import db from './mongodb'
import { Goods } from './mongodb/models'

import chalk from 'chalk'
import fs from 'fs'
import url from 'url'
import querystring from 'querystring'
import got from 'got'
import path from 'path'
import Hashids from 'hashids'
import h5coupon from './h5coupon'

const hashids = new Hashids();
const pid = 'mm_14942785_97600036_18176850324';
const session = '7000010072916787752d8075875798536fade1f44127420a49db9d443ca9e55488e37c1267987083';


const apis = {
  xuandan_all: 'http://api.xuandan.com/DataApi/index?AppKey=8ua248rlp0',
  xuandan_9_9: 'http://api.xuandan.com/DataApi/index?AppKey=8ua248rlp0&Maxp=10&Minp=1',
  xuandan_top_100: 'http://api.xuandan.com/DataApi/Top100?appkey=8ua248rlp0&type=3'
}

const fetch_path = __dirname + '/fetch/'

function prepare() {
  function mkdirs(dirpath) {
    if (!fs.existsSync(path.dirname(dirpath))) {
      mkdirs(path.dirname(dirpath));
    }
    fs.mkdirSync(dirpath);
  }
  var is_exist = fs.existsSync(fetch_path)
  if (!is_exist) {
    mkdirs(fetch_path)
  }
}
async function fetch(type, page, cid) {
  prepare()
  const url = apis[type] + '&cid=' + cid + '&page=' + page
  console.log(url)
  const res = await got.get(url)
  if (res.statusCode == 200) {
    const body = JSON.parse(res.body)
    if (body.error == 0) {
      if (body.total_num > 0) {
        console.log(chalk.green(`fetch type: ${type} response total_num: ${body.total_num}`))
        return body.data
      }
    } else {
      console.error(chalk.red(`fetch type: ${type} response error: ${body}`))
    }
  }
}

async function xuandan(dataList) {
  const modelList = []
  if (!dataList || dataList.length == 0) {
    return modelList
  }
  for (let i in dataList) {
    let e = dataList[i]
    let query = url.parse(e.ActLink).query
    let act_id = querystring.parse(query).activityId
    let hashid = hashids.encode(e.GoodsId)
    const goods = new Goods({
      hashid: hashid,
      source: 'api.xuandan.com',
      goods_id: e.ID,
      mall_type: e.ly,
      item_id: e.GoodsId,
      item_name: e.GoodsName,
      item_link: e.GoodsLink,
      item_price: e.GoodsPrice, //
      last_price: e.LastPrice, //
      img_url: e.ImgUrl,
      //dsr: 0,
      act_id: act_id,
      act_link: e.ActLink,
      act_money: e.ActMoney,
      act_type: e.ActivityType, //0:none 1:taoqianggou 2:juhuasuan
      begin_date: new Date(e.BeginDate).valueOf(), //timestamp
      end_date: new Date(e.EndDate).valueOf(), //timestamp
      seller_id: e.SellerId,
      sale_count: e.SaleCount,
      coupon_totalcount: e.Coupon_Count,
      coupon_salecount: e.Coupon_SaleCount,
      tj_remark: e.TjRemark,
      commission: e.TKMoneyRate,
      tkl: e.tkl,
      uland: e.uland,
      //go_url: ''
    })
    modelList.push(goods)
  }
  return modelList
}

async function save(modelList) {
  for (let i in modelList) {
    const m = modelList[i]
    let goods = await Goods.findOne({ hashid: m.hashid }).exec()
    if (goods) {
      //console.log(`index: ${i},item_id:${goods.item_id} is exist`)
      m._id = goods._id
      //await m.save()
    } else {
      await Goods.create(m)
    }
  }
}


async function sleep(time) {
  return new Promise((res) => {
    setTimeout(() => { res() }, time)
  })
}

(
  async () => {
    const type = 'xuandan_all'
    const size = 100
    let dataList
    let modelList
    let page = 1
    let end_page = 8
    let cid = 0
    do {
      dataList = await fetch(type, page++, cid)
      modelList = await xuandan(dataList)
      await save(modelList)
      if (page % 15 == 0) {
        console.log('sleep 3000ms')
        await sleep(3000)
      }
    } while (dataList != null && dataList.length == size && page < end_page);
    process.exit(0)
  }
)()