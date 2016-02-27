# -*- coding: UTF-8 -*-
'''
use to update the attribute of user portrait
update frequence: one day
update attribute: hashtag, keywords, geo, activeness, importance, influence
'''
import sys
import json
import time
import math
import numpy as np
from evaluate_index import get_evaluate_index
from flow_information import update_flow_information
from save_utils import save_user_results
from evaluate_index import get_activity_time, get_influence
from config import activeness_weight_dict
reload(sys)
sys.path.append('../../')
from global_utils import R_CLUSTER_FLOW2 as r_cluster
from global_utils import es_user_portrait, portrait_index_name, portrait_index_type
from global_utils import update_day_redis, UPDATE_DAY_REDIS_KEY
from time_utils import ts2datetime, datetime2ts
from parameter import DAY

#test
test_ts = datetime2ts('2013-09-08')

#get user hashtag by bulk action
#write in version: 15-12-08
#input: uid_list
#output: {uid:{'hashtag':hashtag_string, 'hashtag_dict': hashtag_dict}, uid:{}...}
def update_day_hashtag(uid_list):
    results = {}
    all_results = {}
    now_ts = time.time()
    now_date_ts = datetime2ts(ts2datetime(now_ts))
    #test
    now_date_ts = test_ts
    for i in range(7,0,-1):
        ts = now_date_ts - DAY*i
        count = 0
        hashtag_results = r_cluster.hmget('hashtag_'+str(ts), uid_list)
        for uid in uid_list:
            if uid not in results:
                results[uid] = {}
            hashtag_item = hashtag_results[count]
            if hashtag_item:
                hashtag_dict = json.loads(hashtag_item)
            else:
                hashtag_dict = {}
            for hashtag in hashtag_dict:
                try:
                    results[uid][hashtag] += 1
                except:
                    results[uid][hashtag] = 1
    for uid in uid_list:
        user_hashtag_dict = results[uid]
        hashtag_string = '&'.join(user_hashtag_dict.keys())
        all_results[uid] = {'hashtag': hashtag_string, 'hashtag_dict':user_hashtag_dict}
    return results

#get user activity geo and geo_action
#write in version: 15-12-08
#input: uid_list, user_info_list
#output: {uid:{'activity_geo':geo_string, 'activity_geo_dict':[{}, {},...]}}
def update_day_geo(uid_list, user_info_list):
    results = {}
    now_ts = time.time()
    now_date_ts = datetime2ts(ts2datetime(now_ts))
    #test
    now_date_ts = test_ts
    ip_results = r_cluster.hmget('new_ip__'+str(now_date_ts - DAY), uid_list)
    count = 0
    for uid in uid_list:
        if uid not in results:
            results[uid] = {'activity_geo':{}, 'activity_geo_dict':[]}
        uid_ip_results = ip_results[count]
        if uid_ip_results:
            uid_ip_dict = json.loads(uid_ip_results)
        else:
            uid_ip_dict = {}
        day_results = {}
        for ip in uid_ip_dict:
            ip_count = len(uid_ip_dict[ip].split('&'))
            geo = ip2city(ip)
            try:
                day_results[geo] += ip_count
            except:
                day_results[geo] = ip_count
        #update the activity_geo_dict
        activity_geo_history_list = json.loads(user_info_list[uid]['activity_geo_dict'])
        activity_geo_history_list.append(day_results)
        results[uid]['activity_geo_dict'] = json.dumps(activity_geo_history_list[-30:])
        #update the activity_geo
        week_activity_geo_list = activity_geo_history_list[-7:]
        week_geo_list = []
        for activity_geo_item in week_activity_geo_list:
            geo_list = activity_geo_item.keys()
            week_geo_list.extend(geo_list)
        week_geo_list = list(set(week_geo_list))
        week_geo_string = '&'.join(['&'.join(item.split('\t')) for item in week_geo_list])
        results[uid]['activity_geo'] = week_geo_string

    return results

#use to get user activeness
#write in version: 15-12-08
#input: geo_results, user_info_list
#output: {uid:{'activeness':value, 'activeness_history':[value1, value2]}}
def update_day_activeness(geo_results, user_info_list):
    results = {}
    uid_list = user_info_list.keys()
    activity_time_results = get_activity_time(uid_list)
    count = 0
    for uid in uid_list:
        results[uid] = {}
        activity_geo_dict = json.loads(geo_results[uid]['activity_geo_dict'])[-1]
        geo_count = len(activity_geo_dict)
        max_freq = activity_time_results[uid]['activity_time']
        statusnum = activity_time_results[uid]['statusnum']
        day_activeness = activeness_weight_dict['activity_time'] * math.log(max_freq + 1) + \
                         activeness_weight_dict['activity_geo'] * math.log(geo_count + 1) + \
                         activeness_weight_dict['statusnum'] * math.log(statusnum + 1)
        '''
        activeness_history_list = json.loads(user_info_list[uid]['activeness_history'])
        activeness_history_list.append(day_activeness)
        activeness_history_list = activeness_history_list[-30:]
        results[uid] = {'activeness':day_activeness, 'activeness_history':json.dumps(activeness_history_list)}
        '''
        results[uid] = {'activeness':day_activeness}
    return results

#use to get user influence
#write in version: 15-12-08
#input: uid_list, user_info_list
#output: {uid:{'influence':value, 'influence_history':[value1, value2]}}
def update_day_influence(uid_list, user_info_list):
    results = {}
    day_influence_results = get_influence(uid_list)
    for uid in uid_list:
        day_influence = day_influence_results[uid]
        '''
        influence_history_list = json.loads(user_info_list[uid]['influence_history'])
        influence_history_list.append(day_influence)
        influence_history_list = influence_history_list[-30:]
        results[uid] = {'influence':day_influence, 'influence_history':json.dumps(influence_history_list)}
        '''
        results[uid] = {'influence': day_influence}
    return results


def save_bulk_action(uid_list, hashtag_results, geo_results, activeness_results, influence_results):
    bulk_action = []
    for uid in uid_list:
        user_results = {}
        user_results = dict(user_results, **hashtag_results[uid])
        user_results = dict(user_results, **geo_results[uid])
        user_results = dict(user_results, **activeness_results)
        user_results = dict(user_results, **influence_results)
        action = {'update':{'_id': uid}}
        bulk_action.extend([action, {'doc': user_results}])

    #print 'bulk_action:', bulk_action
    es_user_portrait.bulk(bulk_action, index=portrait_index_name, doc_type=portrait_index_type)


#use to update day for activity_geo, activity_geo_dict, hashtag, activeness, influence, activeness_history, influence_history
#write in version: 15-12-08
#this file run after the file: scan_es2redis.py
def update_attribute_day():
    bulk_action = []
    count = 0
    user_info_list = {}
    start_ts = time.time()
    while True:
        r_user_info = update_day_redis.rpop(UPDATE_DAY_REDIS_KEY)
        if r_user_info:
            r_user_info = json.loads(r_user_info)
            #print 'r_user_info:', r_user_info
            uid = r_user_info.keys()[0]
            user_info_list[uid] = r_user_info[uid]
            count += 1
        else:
            break

        if count % 1000==0:
            uid_list = user_info_list.keys()
            #get user_list hashtag_results
            hashtag_results = update_day_hashtag(uid_list)
            #get user geo today
            geo_results = update_day_geo(uid_list, user_info_list)
            #get user activeness evaluate
            activeness_results = update_day_activeness(geo_results, user_info_list)
            #get user influence
            influence_results = update_day_influence(uid_list, user_info_list)
            #update to es by bulk action
            save_bulk_action(uid_list, hashtag_results, geo_results, activeness_results, influence_results)
            user_info_list = {}
            end_ts = time.time()
            print '%s sec count 1000' % (end_ts - start_ts)
            start_ts = end_ts

    print 'count:', count

#abandon in version: 15-12-08
'''
def update_attribute_day():
    #scan the user_portrait and bulk action to update
    status = False
    results = {}
    count = 0
    index_name = 'user_portrait'
    index_type = 'user'
    s_re = scan(es, query={'query':{'match_all':{}}, 'size':1000}, index=index_name, doc_type=index_type)
    while True:
        bulk_action = []
        user_info = {}
        while True:
            try:
                scan_re = s_re.next()['_source']
                count += 1
            except StopIteration:
                print 'all done'
                if user_info: # user_info = {uid:activity_geo_dict}
                    new_flow_information_result = update_flow_information(user_info)
                    for uid in new_flow_information_result:
                        flow_information_dict = new_flow_information_result[uid]
                        activity_geo_dict = flow_information_dict['activity_geo_dict']
                        result = flow_information_dict
                        evaluate_user_info = {'uid': flow_information_dict['uid'], 'activity_geo':activity_geo_dict}
                        evaluate_result = get_evaluate_index(evaluate_user_info, 'update')
                        result = dict(result, **evaluate_user_info)
                        action = {'update':{'_id':str(uid)}}
                        bulk_action.extend([action, {'doc': result}])
                if bulk_action:
                    #print 'bulk_action:', bulk_action
                    status = save_user_results(bulk_action)
                sys.exit(0)
            except Exception, r:
                print Exception, r
                sys.exit(0)
            uid = scan_re['uid']
            user_info[uid] = scan_re['activity_geo_dict']

    print 'status:', status
    return status
'''

if __name__=='__main__':
    update_attribute_day()
