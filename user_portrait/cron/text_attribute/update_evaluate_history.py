# -*- coding: UTF-8 -*-
'''
use to scan the activeness, influence, pagerank to copy
'''
import sys
import json
import time
from elasticsearch.helpers import scan
reload(sys)
sys.path.append('../../')
from global_utils import es_user_portrait, portrait_index_name, portrait_index_type
from global_utils import copy_portrait_index_name, copy_portrait_index_type
from time_utils import ts2datetime, datetime2ts
from parameter import DAY, LOW_INFLUENCE_THRESHOULD

# yuankun-20151229
def average_value(source):
    average_influence = 0
    average_activeness = 0
    total_influence = 0
    total_activeness = 0
    count_influence = 0
    count_activeness = 0
    for k,v in source.iteritems():
        if 'activeness_' in k: # 活跃度计算
            total_activeness += int(v)
            count_activeness += 1
        elif str(k) not in set(['uid', 'low_number', 'aver_activeness', 'aver_influence']):#影响力计算，需要更改字段名
            total_influence += int(v)
            count_influence += 1
        else:
            pass
    average_activeness = total_activeness*1.0/count_activeness
    average_influence = total_influence*1.0/count_influence

    return average_activeness, average_influence



#use to scan portrait to get activeness and influence to es:copy_user_portrait
#write in version: 15-12-08
def scan_index_history():
    s_re = scan(es_user_portrait, query={'query':{'match_all':{}}, 'size':1000}, index=portrait_index_name, doc_type=portrait_index_type)
    bulk_action = []
    add_info = {}
    count = 0
    start_ts = time.time()
    now_date = ts2datetime(start_ts - DAY)
    now_date = '2013-09-07'
    #now_date_string = ''.join(now_date.split('-'))
    now_date_string = now_date
    activeness_key = 'activeness_'+now_date_string
    influence_key = now_date_string
    del_date = ts2datetime(time.time() - DAY*31)
    #del_date_string = ''.join(del_date.split('-'))
    del_date_string = del_date
    del_activeness_key = 'activeness_'+del_date_string
    del_influence_key = del_date_string
    while True:
        try:
            scan_re = s_re.next()['_source']
            count += 1
            uid = scan_re['uid']

            activeness_key = 'activeness_'+now_date_string
            influence_key = now_date_string

            add_info[uid] = {activeness_key:scan_re['activeness'], influence_key:scan_re['influence']}
            if count % 1000==0:
                uid_list = add_info.keys()
                evaluate_history_results = es_user_portrait.mget(index=copy_portrait_index_name, doc_type=copy_portrait_index_type, body={'ids':uid_list})['docs']
                '''
                del_date = ts2datetime(time.time() - DAY*31)
                del_date_string = ''.join(s)
                del_activeness_key = 'activeness_'+del_date
                del_influence_key = del_date
                '''
                iter_count = 0
                for uid in uid_list:
                    try:
                        user_history_item = evaluate_history_results[iter_count]['_source']
                    except:
                        user_history_item = {}
                    try:
                        user_history_item.pop(del_activeness_key)
                        user_history_item.pop(del_influence_key)
                    except:
                        pass
                    new_user_item = dict(user_history_item, **add_info[uid])
                    # yuankun-20151229
                    if add_info[uid][influence_key] < LOW_INFLUENCE_THRESHOULD:#更新活跃情况，出库
                        try:
                            new_user_item["low_number"] += 1
                        except:
                            new_user_item["low_number"] = 1
                    else:
                        new_user_item["low_number"] = 0
                    aver_activeness, aver_influence = average_value(new_user_item)
                    new_user_item['aver_activeness'] = aver_activeness
                    new_user_item['aver_influence'] = aver_influence
                    #print 'add_info:', add_info[uid]
                    #print 'user_history_item:', user_history_item
                    #print 'new_user_item:', new_user_item
                    action = {'index':{'_id': uid}}
                    #print 'action:', action
                    bulk_action.extend([action, new_user_item])
                es_user_portrait.bulk(bulk_action, index=copy_portrait_index_name, doc_type=copy_portrait_index_type)
                bulk_action = []
                add_info = {}
                iter_count = 0
                end_ts = time.time()
                print '%s sec count 1000' % (end_ts - start_ts)
        except StopIteration:
            print 'all done'
            if len(add_info) != 0:
                uid_list = add_info.keys() 
                evaluate_history_results = es_user_portrait.mget(index=copy_portrait_index_name, doc_type=copy_portrait_index_type, body={'ids':uid_list})['docs']
                '''
                del_date = ts2datetime(time.time() - DAY*31)
                del_activeness_key = 'activeness_'+del_date
                del_influence_key = del_date
                '''
                iter_count = 0
                for uid in uid_list:
                    try:
                        user_history_item = evaluate_history_results[iter_count]['_source']
                    except:
                        user_history_item = {}
                    try:
                        user_history_item.pop(del_activeness_key)
                        user_history_item.pop(del_influence_key)
                    except:
                        pass
                    new_user_item = dict(user_history_item, **add_info[uid])
                    if add_info[uid][influence_key] < LOW_INFLUENCE_THRESHOULD:
                        try:
                            new_user_item["low_number"] += 1
                        except:
                            new_user_item["low_number"] = 1
                    else:
                        new_user_item["low_number"] = 0
                    aver_activeness, aver_influence = average_value(new_user_item)
                    new_user_item['aver_activeness'] = aver_activeness
                    new_user_item['aver_influence'] = aver_influence
                    action = {'index':{'_id': uid}}
                    bulk_action.extend([action, new_user_item])
                    iter_count += 1
                es_user_portrait.bulk(bulk_action, index=copy_portrait_index_name, doc_type=copy_portrait_index_type)
                bulk_action = []
                add_info = {}
                iter_count = 0
            break
        except Exception, e:
            raise e
    
    if len(add_info)!=0:
        uid_list = add_info.keys()
        evaluate_history_results = es_user_portrait.mget(index=copy_portrait_index_name, doc_type=copy_portrait_index_type, body={'ids':uid_list})['docs']
        '''
        del_date = ts2datetime(time.time() - DAY*31)
        del_activeness_key = 'activeness_'+del_date
        del_influence_key = del_date
        '''
        iter_count = 0
        for uid in uid_list:
            try:
                user_history_item = evaluate_history_results[iter_count]['_source']
            except:
                user_history_item = {}
            try:
                user_history_item.pop(del_activeness_key)
                user_history_item.pop(del_influence_key)
            except:
                pass
            new_user_item = dict(user_history_item, **add_info[uid])
            if add_info[uid][influence_key] < LOW_INFLUENCE_THRESHOULD:
                try:
                    new_user_item["low_number"] += 1
                except:
                    new_user_item["low_number"] = 1
            else:
                new_user_item["low_number"] = 0
            aver_activeness, aver_influence = average_value(new_user_item)
            new_user_item['aver_activeness'] = aver_activeness
            new_user_item['aver_influence'] = aver_influence
            action = {'index':{'_id': uid}}
            bulk_action.extend([action, new_user_item])
            iter_count += 1
        es_user_portrait.bulk(bulk_action, index=copy_portrait_index_name, doc_type=copy_portrait_index_type)
        bulk_action = []
        add_info = {}

    print 'count:', count


if __name__=='__main__':
    scan_index_history()
