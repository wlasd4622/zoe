#!/usr/bin/python
# -*- coding: UTF-8 -*-
import requests
import time
from Proxy import ip
from fake_useragent import UserAgent

def get(**args):
    print args

    http = ip()
    http='45.125.32.182:3128'
    proxies = {
        'http': http,
        'https': http
    }
    headers = {
        'User-Agent': UserAgent().random,
        'Host': 'nb.ganji.com'
    }
    print proxies
    try:
        return requests.get(args.get('url', ''), headers=headers, proxies=proxies, timeout=5) 
    except requests.exceptions.RequestException as e:
        print e
        print '异常！自动重试...'
        return get(url=args['url'])


if __name__ == "__main__":
    url = "http://nb.ganji.com/ershoufang/37946119052935x.shtml"
    result = get(url=url)
    print 11
    print result
    print result.text
