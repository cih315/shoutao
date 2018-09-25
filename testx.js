import db from './mongodb'
import { Goods } from './mongodb/models'

import fs from 'fs'
import querystring from 'querystring'
import url from 'url'

const dataList = JSON.parse(fs.readFileSync(__dirname + '/tmp/data.json').toString('utf-8'))


dataList.forEach(async (e, i) => {
  var query = url.parse(e.ActLink).query
  var act_id =  querystring.parse(query).activityId
  var goods = new Goods({
    hashid: e.hashid,
    source: 'api.xuandan.com',
    goods_id: e.ID,
    mall_type: e.ly,
    item_id: e.GoodsId,
    item_name: e.GoodsName,
    item_link: e.GoodsLink,
    item_price: e.GoodsPrice, //
    last_price: e.LastPrice, //
    img_url: e.ImgUrl,
    dsr: 0,
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
    tkl: e.tkl,
    uland: e.uland,
    commission: e.TKMoneyRate,
    go_url: ''
  })
  var tmp = await Goods.findOne({ hashid: goods.hashid }).exec()
  if (!tmp) {
    let obj = await goods.save()
  } else {
    tmp.go_url = ''
    await tmp.save()
  }
  console.log('i: ' + i)
});