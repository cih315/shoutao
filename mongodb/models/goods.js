
import mongoose from 'mongoose'
const Schema = mongoose.Schema


const GoodsSchema = new Schema({
  hashid: { type: String, index: true }, //hashid from goods_id
  source: String, //xuandan.com
  goods_id: String, //
  mall_type: String, //1:tmall 2:taobao
  item_id: { type: String, index: true },
  item_name: String,
  item_link: String,
  item_price: Number, //
  last_price: Number, //
  img_url: String,
  tags: { type: [String], index: true },
  dsr: Number,
  act_id: String,
  act_link: String,
  act_money: Number, //
  act_type: Number, //0:none 1:taoqianggou 2:juhuasuan
  begin_date_str: String,
  begin_date: { type: Number, index: true }, //timestamp
  end_date_str: String,
  end_date: { type: Number, index: true }, //timestamp
  seller_id: String,
  sale_count: Number,
  coupon_totalcount: Number,
  coupon_salecount: Number,
  tj_remark: String,
  tkl: String,
  uland: String,
  commission: Number,
  go_url: String
})

export default GoodsSchema