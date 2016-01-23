# -*- coding:utf-8 -*-

import sys
import time
import json
import numpy as np
from elasticsearch import Elasticsearch

from user_portrait.global_utils import es_flow_text as es_text
from user_portrait.global_utils import es_user_profile as es_profile
from user_portrait.global_utils import es_user_portrait as es
from user_portrait.global_utils import flow_text_index_name_pre, flow_text_index_type, profile_index_name, profile_index_type, \
                                       portrait_index_name, portrait_index_type
from user_portrait.time_utils import ts2datetime, datetime2ts
from user_portrait.parameter import DETAIL_SOCIAL_SENSING as index_sensing_task
from user_portrait.parameter import INDEX_MANAGE_SOCIAL_SENSING as index_manage_social_task
from user_portrait.parameter import DOC_TYPE_MANAGE_SOCIAL_SENSING as task_doc_type
from user_portrait.parameter import IMPORTANT_USER_THRESHOULD
from user_portrait.social_sensing.full_text_serach import count_hot_uid

# 展示所有已经完成的任务，返回任务名
def show_social_sensing_task():
    query_body = {
        "query":{
            "filtered":{
                "filter":{
                    "term": {"finish": "1"}
                }
            }
        },
        "sort": {"create_at": {"order": "desc"}},
        "size": 10000
    }

    results = []
    search_results = es.search(index=index_manage_social_task, doc_type=task_doc_type, body=query_body)['hits']['hits']
    if search_results:
        for item in search_results:
            results.append(item['_source']['task_name'])

    return results


def show_important_users(task_name):
    task_detail = es.get(index=index_manage_social_task, doc_type=task_doc_type, id=task_name)["_source"]
    portrait_detail = []
    important_user_set = set() # 重要人物列表
    history_status = json.loads(task_detail['history_status'])
    start_time = int(task_detail['create_at'])
    stop_time = int(task_detail['stop_time'])
    time_series = []
    keywords_list = json.dumps(task_detail['keywords'])
    for item in history_status:
        time_series.append(item[0])

    if time_series:
        flow_detail = es.mget(index=index_sensing_task, doc_type=task_name, body={"ids": time_series})['docs']
    else:
        flow_detail = {}
    if flow_detail:
        for item in flow_detail:
            item = item['_source']
            temp_user_list = json.loads(item['important_users'])
            important_user_set = important_user_set | set(temp_user_list)

    important_uid_list = list(important_user_set)
    user_detail_info = [] #
    if important_uid_list:
        user_results = es.mget(index=portrait_index_name, doc_type=portrait_index_type, body={"ids":important_uid_list},fields=['uid', 'uname', 'domain', 'topic_string', "photo_url", 'importance', 'influence','activeness'])['docs']
        for item in user_results:
            if item['found']:
                temp = []
                if int(item['fields']['importance'][0]) < IMPORTANT_USER_THRESHOULD:
                    continue
                temp.append(item['fields']['uid'][0])
                temp.append(item['fields']['uname'][0])
                temp.append(item['fields']['photo_url'][0])
                temp.append(item['fields']['domain'][0])
                temp.append(item['fields']['topic_string'][0].split('&'))
                hot_count = count_hot_uid(item['fields']['uid'][0], start_time, stop_time, keywords_list)
                temp.append(hot_count)
                temp.append(item['fields']['importance'][0])
                temp.append(item['fields']['influence'][0])
                temp.append(item['fields']['activeness'][0])
                user_detail_info.append(temp)
                print temp


    return user_detail_info


