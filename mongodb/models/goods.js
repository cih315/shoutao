
import mongoose from 'mongoose'
const Schema = mongoose.Schema


const GoodsSchema = new Schema({
  hashid: String, //hashid from goods_id
  source: String, //xuandan.com
  source_id: String, //
  mall_type: String, //1:tmall 2:taobao
  goods_id: String,
  goods_name: String,
  goods_link: String,
  act_link: String,
  act_money: Number, //
  act_type: Number, //0:none 1:taoqianggou 2:juhuasuan
  img_url: String,
  goods_price: Number, //
  last_price: Number, //
  begin_date: Number, //timestamp
  end_date: Number, //timestamp
  seller_id: String,
  sale_count: Number,
  coupon_totalcount: Number,
  coupon_salecount: Number,
  tj_remark: String,
  tkl: String,
  uland: String,
  go_url: String,
})

export default GoodsSchema