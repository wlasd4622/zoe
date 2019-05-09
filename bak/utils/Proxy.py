#!/usr/bin/python
# -*- coding: UTF-8 -*-
import requests
import random 
import json
def ip():
    response = requests.get(
        'http://127.0.0.1:8000/?types=2&count=100&country=%E5%9B%BD%E5%86%85')
    result = response.text
    ips = json.loads(result)
    index = random.randint(0, len(ips))
    return ips[index][0]+':'+str(ips[index][1])
