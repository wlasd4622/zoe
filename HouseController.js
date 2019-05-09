let puppeteer = require('puppeteer');
let fs = require('fs');
let xlsx = require('node-xlsx');
let md5 = require('md5')
let House = require('./db/House.js')
class HouseController {
  constructor() {
    this.pageIndex = 1;
    this.maxPageIndex = 70;
    this.page = null;
    this.dbHouse = new House();
    this.browser = null;
  }
  async runPuppeteer() {
    this.browser = await (puppeteer.launch({
      headless: false
    }));
    this.page = await this.browser.newPage();
  }

  async getList() {
    if (!this.browser) await this.runPuppeteer()
    if (this.pageIndex > this.maxPageIndex) {
      await this.close()
      return false;
    }
    await this.page.setViewport({
      width: 1376,
      height: 768,
    })
    let url = `http://qd.ganji.com/ershoufang/0/pn${this.pageIndex}/`
    console.log(`>>>${url}`);
    await this.page.goto(url, {
      waitUntil: 'domcontentloaded'
    })
    await this.page.addScriptTag({
      url: 'http://cdn.bootcss.com/jquery/3.2.0/jquery.min.js'
    })
    await this.page.waitForSelector('.js-tips-list');

    let list = await this.page.evaluate(() => {
      let list = [];
      try {
        $('.f-main-list .f-list-item').each((i, item) => {
          let rooms = $(item).find('.dd-item.size span:eq(0)').text(); //厅室
          let title = $(item).find('.title a').text(); //名称
          let area = $(item).find('.dd-item.size span:eq(2)').text(); //面积
          let orientation = $(item).find('.dd-item.size span:eq(4)').text(); //朝向
          let floor = $(item).find('.dd-item.size span:eq(6)').text(); //楼层
          let address = $(item).find('.dd-item.address:first').text().replace(/\s/g, ''); //小区
          let host = $(item).find('.dd-item.address:last').find('.address-eara').text(); //联系人
          let price = $(item).find('.price').text(); //价格
          let unit_price = $(item).find('.time').text();; //单价
          let phone = '' //电话
          let link = 'http:' + $(item).find('a').attr('href')
          let data = {
            title,
            rooms,
            area,
            orientation,
            floor,
            address,
            host,
            price,
            unit_price,
            phone,
            link
          }

          list.push(data)
        })
      } catch (err) {
        console.error(err)
      }
      return list;
    });
    if (list && list.length) {
      for (let index = 0; index < list.length; index++) {
        let element = list[index];
        let key = md5(element.link);
        let result = await this.dbHouse.Select(['key', key])
        if (!result) {
          element.key = md5(element.link)
          result = await this.dbHouse.Insert(element)
        } else {
          console.log(key + '已存在！');
        }
      }
    }
    setTimeout(() => {
      this.pageIndex++;
      this.getList()
    }, 5000)
  }

  async getDetailUrl() {
    let houseArr = await new House().Run(`SELECT * from house
    WHERE phone =''
    LIMIT 1`)
    if (houseArr && houseArr.length) {
      return houseArr[0]
    }
  }

  async getPhone() {
    if (!this.browser) await this.runPuppeteer()
    let house = await this.getDetailUrl();
    if (!house) {
      await this.close();
      return false;
    }
    let link = house.link;
    console.log(`>>>detail:${link}`);
    try {
      await this.page.setViewport({
        width: 1376,
        height: 768,
      })
      await this.page.goto(link, {
        waitUntil: 'domcontentloaded'
      })
      await this.page.addScriptTag({
        url: 'http://cdn.bootcss.com/jquery/3.2.0/jquery.min.js'
      })
      await this.page.waitForSelector('.card-info');
      house.phone = await this.page.$eval('.phone_num', el => el.textContent);
    } catch (err) {
      let title = await this.page.title()
      if (title === '您访问的网页不存在') {
        house.phone = '-'
      }
    }
    if (house.phone) {
      console.log(house.phone);
      //存表
      await this.dbHouse.Run(`update house set phone='${house.phone}' WHERE key='${house.key}'`);
      await this.sleep(20000)
      await this.getPhone();
    } else {
      console.log('未处理异常!!');
      return false;
    }
  }

  sleep(ms = 300) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve()
      }, ms);
    })
  }
  async close() {
    if (this.browser) await this.browser.close()
  }
  async exportExcel() {
    let xlsData = [];
    let data = {
      id: 'id',
      title: '名称',
      rooms: '厅室',
      area: '面积',
      orientation: '朝向',
      floor: '楼层',
      address: '小区',
      host: '联系人',
      price: '价格',
      unit_price: '单价',
      phone: '电话',
      link: '链接'

    }

    let title = []
    Object.keys(data).map(key => {
      title.push(data[key])
    })
    xlsData.push(title)
    //read db
    let list = await this.dbHouse.SelectedAll()
    list.map(item => {
      let row = []
      Object.keys(item).map(key => {
        if (key !== 'key')
          row.push(item[key])
      })
      xlsData.push(row)
    })
    // 写xlsx
    var buffer = xlsx.build([{
      name: 'sheet1',
      data: xlsData
    }]);
    fs.writeFileSync('./dist/青岛二手房.xls', buffer);
  }
}
module.exports = HouseController;
