#!/usr/bin/python
# -*- coding: UTF-8 -*-
import requests
from lxml import etree
import re
import xlwt
import time
import random
from fake_useragent import UserAgent
from utils.Request import get
# 创建excel表格
f = xlwt.Workbook(encoding='utf_8')
sheet01 = f.add_sheet(u'sheet1', cell_overwrite_ok=True)
sheet01.write(0, 0, '名称')
sheet01.write(0, 1, '厅室')
sheet01.write(0, 2, '面积')
sheet01.write(0, 3, '朝向')
sheet01.write(0, 4, '楼层')
sheet01.write(0, 5, '小区')
sheet01.write(0, 6, '联系人')
sheet01.write(0, 7, '价格')
sheet01.write(0, 8, '单价')
sheet01.write(0, 9, '电话')
num = 1

for x in range(1, 70):
    url = 'http://qd.ganji.com/ershoufang/0/pn%d/' % x  # 青岛个人二手房
    print url
    headers = {
        'User-Agent': UserAgent().random,
        'Host': 'nb.ganji.com'
    }
    response = get(url=url)
    result = response.text

    html = etree.HTML(result, etree.HTMLParser())
    # 获取所有二手房的div标签
    divs = html.xpath(
        "//div[@class='f-list js-tips-list']/div[contains(@class,'ershoufang-list')]")
    # 遍历每个标签，拿到需要的数据
    print len(divs)
    for div in divs:
        title = div.xpath(".//dd[contains(@class,'title')]/a/@title")[0]
        info = div.xpath(".//dd[contains(@class,'size')]//text()")
        rooms = info[1]
        area = info[4]
        orientation = info[7]
        floor = info[10] if len(info) > 10 else ''
        address = "".join(
            div.xpath(".//dd[contains(@class,'address')][1]//text()"))
        address = re.sub("\s", "", address)
        host = "".join(
            div.xpath(".//dd[contains(@class,'address')][2]//text()"))
        host = re.sub("\s", "", host)
        price = "".join(div.xpath(
            ".//dd[contains(@class,'info')]/div[@class='price']/span/text()"))    #
        unit_price = div.xpath(
            ".//dd[contains(@class,'info')]/div[@class='time']/text()")[0]
        # 获取手机号
        url = 'http:' + div.xpath(".//div[@class='img-wrap']/a/@href")[0]
        print url
        time.sleep(5)  # 设置延时
        response = get(url=url)
        result = response.text
        html = etree.HTML(result, etree.HTMLParser())
        phone = html.xpath('//*[@id="full_phone_show"]/div[2]/a//text()')[0]
        print phone
        sheet01.write(num, 0, title)
        sheet01.write(num, 1, rooms)
        sheet01.write(num, 2, area)
        sheet01.write(num, 3, orientation)
        sheet01.write(num, 4, floor)
        sheet01.write(num, 5, address)
        sheet01.write(num, 6, host)
        sheet01.write(num, 7, price)
        sheet01.write(num, 8, unit_price)
        sheet01.write(num, 9, phone)
        num = num + 1
    time.sleep(5)  # 设置延时


f.save("二手房"+'.xls')
