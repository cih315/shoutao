import ejs from 'ejs';
import got from 'got';
import qs from 'querystring';
import my_cache from './cache'
import pids from './pids'
import querystring from 'querystring'
import schedule from 'node-schedule'

const view_path = __dirname + '/../views'

/* API LIST */
const api_coupon_page = 'http://qwd.jd.com/pages/secondaryPage/coupon'
const api_coupon_detail = 'http://qwd.jd.com/api/cps/product/getSearchgoods'
const api_sku_coupon_detail = 'http://qwd.jd.com/fcgi-bin/mid_page'
const api_item_share = 'http://qwd.jd.com/fcgi-bin/qwd_itemshare'
/* API LIST */
const jingfen_cookie = '__jda=122270672.1543935193223862246025.1543935193.1545717868.1546414765.12; __jdb=122270672.1.1543935193223862246025|12.1546414765; __jdc=122270672; __jdv=122270672|direct|-|none|-|1546414765027; jfShareSource=1; mba_muid=1543935193223862246025.1.1546414765031; mba_sid=1.1; app_id=161; apptoken=076162633B1DB473D0E7D4007B69311E3383A6B6A214A9DCC681986FC94F004219ACC16CA6A2052A3577B4B4961F04E192CF2721DACAA0E65E0DD64EC80CB803; client_type=apple; clientid=9A5C92C9-1EF7-4956-8CFC-74FB7DD622AC; jdpin=wayne185; jxjpin=wayne185; levelName=%E9%87%91%E7%89%8C%E7%94%A8%E6%88%B7; nickname=wayne185; picture_url=http://storage.360buyimg.com/i.imageUpload/7761796e6531383531343030363631343138383537_mid.jpg; pinType=1; tgt=AAFcBpTzAEBoQn76OVr5JsEK9sPGSikIxu3SoDnNPLBDB37s_UASgvaKT36RgQ7q7jr2shkXMEbR5jDV3PnpRyKzhKjJtH8I; userLevel=62; wg_skey=zp7AF3C4B9907A55AAD21727FE5498E1226E777B9B90D62E5EFDD0568AD9B5706C89B44499CCB8B7B2FA91843646686499; wg_uin=5032903798; wq_skey=zp7AF3C4B9907A55AAD21727FE5498E1226E777B9B90D62E5EFDD0568AD9B5706C89B44499CCB8B7B2FA91843646686499; wq_uin=5032903798; login_mode=1; qwd_chn=99; qwd_schn=2; pin=wayne185'
const ttl_jd_skuids = 60 * 60 * 24

class Jd {
  constructor() {
    this.index = this.index.bind(this)
    this.detail = this.detail.bind(this)
    schedule.scheduleJob('*/10 * * * * *', this.fetch_coupon)
  }
  /**
 * pid cfg
 * @param {*} ctx 
 * @param {*} next 
 */
  async pid(ctx, next) {
    var pid = ctx.params.pid
    var pid_cfg = pids.default
    if (pid) {
      //pid = 'mm_' + pid.replace(/-/g, '_')
      if (pids[pid]) {
        pid_cfg = pids[pid]
      }
    }
    return pid_cfg
  }


  async fetch_coupon() {
    var key_jd_skuids = 'jd:skuids'
    var sku_ids = ''
    console.log('start to fetch jd skuids')
    //1. get the skuid list
    //
    var url = 'https://qwd.jd.com/cps/product/searchgoodsrecommend?sourceId=2&pageindex=1&pagesize=100'
    var res = await got(url, {
      headers: {
        'Cookie': jingfen_cookie,
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/16B92 MicroMessenger/6.7.3(0x16070321) NetType/WIFI Language/zh_CN'
      },
      timeout: 5000
    })
    var html = res.body
    //console.log(html)
    //var reg = /"skuIds":\[(.+?)\]/i
    //var result = html.match(reg)

    //if (result && result.length > 0) {
    // sku_ids = result[1]
    //}
    var sku_arr = JSON.parse(html).sku
    var sku_id_arr = []
    sku_arr.forEach(element => {
      sku_id_arr.push(element.skuId)
    });
    sku_ids = sku_id_arr.join(',')
    //2. get the sku list
    var api = api_coupon_detail + '?skuid=' + sku_ids
    res = await got(api, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/16B92 MicroMessenger/6.7.3(0x16070321) NetType/WIFI Language/zh_CN'
      },
      timeout: 5000
    })
    var coupon_list = JSON.parse(res.body)
    if (coupon_list.errCode == 0) {
      my_cache.set(key_jd_skuids, coupon_list, ttl_jd_skuids)
      console.log('cache jd skuids:' + coupon_list.sku.length)
    }
    return coupon_list
  }

  async index(ctx, next) {
    var pid_cfg = await this.pid(ctx, next)
    var key_jd_skuids = 'jd:skuids'
    var coupon_list = await my_cache.get(key_jd_skuids)
    if (!coupon_list) {
      coupon_list = await this.fetch_coupon()
    }
    var items = []
    for (var i = 0; i < coupon_list.sku.length; i++) {
      var sku = coupon_list.sku[i]
      if (!sku.denomination) continue
      var item = {
        itemid: sku.skuId,
        spuid: sku.spuId,
        product_id: sku.spuId,
        itemtitle: sku.title,
        itemendprice: parseFloat(parseFloat(sku.price) - sku.denomination).toFixed(2),
        couponmoney: sku.denomination,
        itemsale: sku.saleCount,
        itempic: sku.imgUrl,
        shoptype: 'J'
      }
      items.push(item)
    }
    var data = {
      items: { data: items, min_id: -1 },
      cfg: pid_cfg
    }
    ejs.renderFile(view_path + '/index_jd.html', data, { async: false, cache: false, rmWhitespace: true }, (err, html) => {
      if (err) {
        console.error(err)
        ctx.body = 'server error'
        ctx.status = 500
      } else {
        ctx.body = html
      }
    })
  }

  async detail(ctx, next) {
    var skuid = ctx.params.skuid
    var pid_cfg = await this.pid(ctx, next)
    var key_jd_skuids = 'jd:skuids'
    var coupon_list = await my_cache.get(key_jd_skuids)
    if (!coupon_list) {
      coupon_list = await this.fetch_coupon()
    }
    var item = null
    if (coupon_list && coupon_list.sku && coupon_list.sku.length > 0) {
      for (var i = 0; i < coupon_list.sku.length; i++) {
        var sku = coupon_list.sku[i]
        if (sku.skuId == skuid) {
          item = sku
          break
        }
      }
    }
    if (item) {
      var redirect_url = api_item_share + '?skuid=' + item.skuId
        + '&spuid' + item.spuId + '&type=1&ie=utf-8&source=0&subsource=0&ispg=&cps_ab=cab_ac&name='
        + encodeURIComponent(item.title)
        + '&couponid=' + item.couponId
        + '&callback=__jp0'
      var res = await got(redirect_url, {
        headers: {
          'Cookie': jingfen_cookie,
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/16B92 MicroMessenger/6.7.3(0x16070321) NetType/WIFI Language/zh_CN'
        },
        timeout: 5000
      })
      var js = res.body
      js = js.replace(/\s+/g, "").replace(/[\r\n]/g, "")
      var reg = /\((.+?)\)/i
      var match = js.match(reg)
      if (match && match.length > 0) {
        var json = match[1]
        json = JSON.parse(json)
        var skuurl = json.skuurl
        if (skuurl) {
          ctx.redirect(skuurl)
          return
        }
      }
      ctx.redirect('/jd')
    } else {
      ctx.redirect('/')
    }

  }
}

export default new Jd()
