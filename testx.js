import db from './mongodb'
import { Goods } from './mongodb/models'

import fs from 'fs'

const dataList = JSON.parse(fs.readFileSync(__dirname + '/tmp/data.json').toString('utf-8'))


dataList.forEach(async (e) => {
  var goods = new Goods({
    hashid: e.hashid,
    source: 'api.xuandan.com',
    source_id: e.ID,
    mall_type: e.ly,
    goods_id: e.GoodsId,
    goods_name: e.GoodsName,
    goods_link: e.GoodsLink,
    act_link: e.ActLink,
    act_money: e.ActMoney,
    act_type: e.ActivityType, //0:none 1:taoqianggou 2:juhuasuan
    img_url: e.ImgUrl,
    goods_price: e.GoodsPrice, //
    last_price: e.LastPrice, //
    begin_date: new Date(e.BeginDate).valueOf(), //timestamp
    end_date: new Date(e.EndDate).valueOf(), //timestamp
    seller_id: e.SellerId,
    sale_count: e.SaleCount,
    coupon_totalcount: e.Coupon_Count,
    coupon_salecount: e.Coupon_SaleCount,
    tj_remark: e.TjRemark,
    tkl: e.tkl,
    uland: e.uland
  })
  let obj = await Goods.create(goods)
  console.log(obj)
});