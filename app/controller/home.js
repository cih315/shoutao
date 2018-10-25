import ejs from 'ejs';
import got from 'got';
import qs from 'querystring';
import my_cache from './cache'
import pids from './pids'
import h5coupon from '../lib/h5coupon'
import querystring from 'querystring'

const view_path = __dirname + '/../views'

const ttl_item_list = 60 * 3
const ttl_classify_list = 60 * 60 * 24 * 7
const ttl_deserve_list = 60 * 30
const api_new_item_list = 'http://api.haodanku.com/app/get_new_fqcat_items'
const api_cat_list = 'http://api.haodanku.com/app/get_fqcat_items'
const api_deserve_list = 'http://api.haodanku.com/app/get_deserve_item_new'
const api_classify_list = 'http://api.haodanku.com/app/get_classify'
const api_item_detail = 'http://v2.api.haodanku.com/item_detail/apikey/lowangquan/itemid/'
const api_item_similar = 'http://v2.api.haodanku.com/get_similar_info/apikey/lowangquan/itemid/'
const api_search = 'http://api.haodanku.com/app/get_keyword_items_new'
/**
 * home page
 */
class Home {
  constructor() {
    this.index = this.index.bind(this);
    this.index = this.index.bind(this);
    this.cat = this.cat.bind(this);
    this.item = this.item.bind(this);
    this.search = this.search.bind(this);
    this.cat_list = this.cat_list.bind(this);
    this.list = this.list.bind(this)
    this.search_result = this.search_result.bind(this)
    this.parse = this.parse.bind(this)
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

  /**
   * home page
   * @param {*} ctx 
   * @param {*} next 
   */
  async index(ctx, next) {
    var pid_cfg = await this.pid(ctx, next)
    var classify, p1
    var deserve, p2
    var items, p3
    var p_arr = []
    var body = { cid: 0, min_id: -1 }
    // 1.query cat list
    classify = await my_cache.get('classify_list')
    if (!classify) {
      p1 = got(api_classify_list)
      p_arr.push(p1)
    }
    // 2.query deserve list
    deserve = await my_cache.get('deserve_list')
    if (!deserve) {
      p2 = got(api_deserve_list)
      p_arr.push(p2)
    }
    // 3.query new items
    items = await my_cache.get('item_list')
    if (!items) {
      p3 = got.post(api_new_item_list, { body: qs.stringify(body) })
      p_arr.push(p3)
    }
    var data = { classify: classify, deserve: deserve, items: items }
    if (p_arr.length > 0) {
      try {
        var ps = await Promise.all(p_arr)
        var index = 0
        if (!classify) {
          data.classify = JSON.parse(ps[index++].body)
          await my_cache.set('classify_list', data.classify, ttl_classify_list)
        }
        if (!deserve) {
          data.deserve = JSON.parse(ps[index++].body)
          await my_cache.set('deserve_list', data.deserve, ttl_deserve_list)
        }
        if (!items) {
          data.items = JSON.parse(ps[index++].body)
          var tmp = data.items.data
          data.items.data = []
          for (var i in tmp) {
            if (tmp[i].product_id) {
              data.items.data.push(tmp[i])
            }
          }
          await my_cache.set('item_list', data.items, ttl_item_list)
        }
      } catch (e) {
        console.log('fetch api data error', e)
      }
    }
    data.cfg = pid_cfg
    ejs.renderFile(view_path + '/index.html', data, { async: false, cache: false, rmWhitespace: true }, (err, html) => {
      if (err) {
        console.error(err)
        ctx.body = 'server error'
        ctx.status = 500
      } else {
        ctx.body = html
      }
    })
  }
  /**
   * activ
   * @param {*} ctx 
   * @param {*} next 
   */
  async act(ctx, next) {
    ctx.body = 'act'
  }
  async list(ctx, next) {
    var pid_cfg = await this.pid(ctx, next)
    let cid = ctx.params.id ? ctx.params.id : 0
    var body = {
      cid: cid,
      min_id: -1
    }
    var res = { min_id: -1, data: [] }
    try {
      res = await got.post(api_cat_list, {
        body: qs.stringify(body),
        headers: {
          'content-type': 'application/x-www-form-urlencoded'
        }
      })
      res = JSON.parse(res.body)

    } catch (e) {
      console.error('cat load error:', e)
    }
    var data = { list: res, cid: cid }
    data.cfg = pid_cfg
    ejs.renderFile(view_path + '/list.html', data, { async: false, cache: false, rmWhitespace: true }, (err, html) => {
      if (err) {
        console.error(err)
        ctx.body = err
      } else {
        ctx.body = html
      }
    })
  }

  async cat(ctx, next) {
    let cid = ctx.params.id ? ctx.params.id : 0
    let min_id = ctx.params.page ? ctx.params.page : -1
    var body = {
      cid: cid,
      min_id: min_id
    }
    var res = { min_id: -1, data: [] }
    try {
      let url = (cid == 0 ? api_new_item_list : api_cat_list)
      res = await got.post(url, {
        body: qs.stringify(body),
        headers: {
          'content-type': 'application/x-www-form-urlencoded'
        }
      })
    } catch (e) {
      console.error('cat load error:', e)
    }
    body = JSON.parse(res.body)
    if (cid == 0) {
      var tmp = body.data
      body.data = []
      for (var i in tmp) {
        if (tmp[i].product_id) {
          body.data.push(tmp[i])
        }
      }
    }
    ctx.body = body
  }

  async item(ctx, next) {
    var pid_cfg = await this.pid(ctx, next)
    let iid = ctx.params.iid
    if (isNaN(iid)) {
      ctx.body = 'Not Found'
      ctx.status = 404
      return
    }
    var item, p1
    var likes, p2
    var p_arr = []
    var key_item_detail = 'item_detail:' + iid
    var key_item_likes = 'item_likes:' + iid
    item = await my_cache.get(key_item_detail)
    if (!item) {
      let api1 = api_item_detail + iid
      p1 = got.get(api1)
      p_arr.push(p1)
    }
    likes = await my_cache.get(key_item_likes)
    if (!likes) {
      let api2 = api_item_similar + iid
      p2 = got.get(api2)
      p_arr.push(p2)
    }
    var data = { item: item, likes: likes }
    if (p_arr.length > 0) {
      try {
        var ps = await Promise.all(p_arr)
        var index = 0
        var ttl = 60 * 60
        if (!item) {
          data.item = JSON.parse(ps[index++].body).data
          if (data.item.couponendtime) {
            ttl = data.item.couponendtime - new Date().valueOf() / 1000
            ttl = parseInt(ttl > 0 ? ttl : 1)
          }
          await my_cache.set(key_item_detail, data.item, ttl)
          console.log('cache miss:' + key_item_detail)
        } else {
          if (data.item.couponendtime) {
            ttl = data.item.couponendtime - new Date().valueOf() / 1000
            ttl = ttl > 0 ? ttl : 1
          }
        }
        if (!likes) {
          data.likes = JSON.parse(ps[index++].body)
          await my_cache.set(key_item_likes, data.likes, ttl)
        }
      } catch (e) {
        console.log('fetch item detail & likes error:', e)
        data.item = data.item ? data.item : {}
        data.likes = data.likes ? data.likes : { data: [] }
      }
    }
    data.cfg = pid_cfg
    ejs.renderFile(view_path + '/detail.html', data, { async: false, cache: false, rmWhitespace: true }, (err, html) => {
      if (err) {
        console.error(err)
        ctx.body = 'server error'
        ctx.status = 500
      } else {
        ctx.body = html
      }
    })
  }


  async tklParse(tkl) {
    let api = 'http://api.chaozhi.hk/tb/tklParse'
    var body = querystring.stringify({
      tkl: tkl
    });
    try {
      let response = await got.post(api, {
        body: body,
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'x-forwarded-for': '4.2.2.2,10.96.112.230'
        },
        timeout: 5000
      });
      let json = JSON.parse(response.body)
      if (json.error_code === 0) {
        return json.data
      }
    } catch (e) {

    }
    return null
  }

  async parse(ctx, next) {
    var pid_cfg = await this.pid(ctx, next)
    var body = {
      is_coupon: ctx.query.is_coupon ? ctx.query.is_coupon : 0,
      is_tmall: ctx.query.is_tmall ? ctx.query.is_tmall : 0,
      limitrate: ctx.query.limitrate ? ctx.query.limitrate : 0,
      min_id: ctx.query.min_id ? ctx.query.min_id : -1,
      sort: ctx.query.sort ? ctx.query.sort : 0,
      tb_p: ctx.query.tb_p ? ctx.query.tb_p : 1,
      search_goal: ctx.query.search_goal ? ctx.query.search_goal : 0,
      keyword: ctx.query.keyword ? ctx.query.keyword : ''
    }
    //parse tkl
    var keyword = body.keyword
    let regEx = /￥(.+?)￥/gi
    let rt = keyword.match(regEx)
    if (rt && rt.length > 0) {
      var tkl = rt[0]
      console.log('find tkl:' + tkl)
      var data = await this.tklParse(tkl)
      if (data && data.suc == true) {
        var url = data.url + '&pid=' + pid_cfg.pid
        rt = await h5coupon.fetch(url)
        if (rt.data && rt.data.success) {
          var coupon = rt.data.result
          var item_id = coupon.item.itemId
          if (item_id) {
            console.log('find item:' + item_id)
            ctx.redirect('/item/' + item_id + pid_cfg.suffix)
            return
          } else {
            console.log('can not find tkl:' + tkl, rt)
          }
        }
      }
    }
    await this.search(ctx, next)
  }

  async search(ctx, next) {
    var pid_cfg = await this.pid(ctx, next)
    var api = api_search
    var body = {
      is_coupon: ctx.query.is_coupon ? ctx.query.is_coupon : 0,
      is_tmall: ctx.query.is_tmall ? ctx.query.is_tmall : 0,
      limitrate: ctx.query.limitrate ? ctx.query.limitrate : 0,
      min_id: ctx.query.min_id ? ctx.query.min_id : -1,
      sort: ctx.query.sort ? ctx.query.sort : 0,
      tb_p: ctx.query.tb_p ? ctx.query.tb_p : 1,
      search_goal: ctx.query.search_goal ? ctx.query.search_goal : 0,
      keyword: ctx.query.keyword ? ctx.query.keyword : ''
    }
    var data = body
    try {
      var res = await got.post(api, {
        body: qs.stringify(body),
        headers: {
          'content-type': 'application/x-www-form-urlencoded'
        }
      })
      data.search = JSON.parse(res.body)
    } catch (e) {
      console.error(e)
    }
    data.cfg = pid_cfg
    ejs.renderFile(view_path + '/search.html', data, { async: false }, (err, html) => {
      if (err) {
        console.error(err)
        ctx.body = err
      } else {
        ctx.body = html
      }
    })
  }

  async search_result(ctx, next) {
    var api = api_search
    var body = {
      is_coupon: ctx.query.is_coupon ? ctx.query.is_coupon : 0,
      is_tmall: ctx.query.is_tmall ? ctx.query.is_tmall : 0,
      limitrate: ctx.query.limitrate ? ctx.query.limitrate : 0,
      min_id: ctx.query.min_id ? ctx.query.min_id : -1,
      sort: ctx.query.sort ? ctx.query.sort : 0,
      tb_p: ctx.query.tb_p ? ctx.query.tb_p : 1,
      search_goal: ctx.query.search_goal ? ctx.query.search_goal : 0,
      keyword: ctx.query.keyword ? ctx.query.keyword : ''
    }
    var data = { min_id: -1, data: [] }
    try {
      var res = await got.post(api, {
        body: qs.stringify(body),
        headers: {
          'content-type': 'application/x-www-form-urlencoded'
        }
      })
      data = JSON.parse(res.body)
    } catch (e) {
      console.error(e)
    }
    ctx.body = data
  }

  async cat_list(ctx, next) {
    ctx.body = 'cat_list'
  }

  async similar(ctx, next) {
    let iid = ctx.params.iid
    let api = api_item_similar + iid
    try {
      let res = await got.get(api)
      let json = JSON.parse(res.body)
      ctx.body = json
    } catch (e) {
      ctx.body = 'error'
    }
  }

  async uland(ctx, next) {
    let body = ctx.request.body
    let pid = body.pid
    if (!pid || !pids[pid.replace(/_/g, '-').replace('mm-', '')]) {
      ctx.body = { "msg": '生成口令失败,非法pid', "error_code": 102 }
      return
    }
    body.tklImg = body.tklImg.replace('a-li-cdn', 'alicdn')
    body.urls = body.urls.replace('ta-oba-o.com', 'taobao.com')
    let item_id = body.item_id
    var key_item_tkl = 'item_tkl:' + item_id + ':' + pid
    var key_item_detail = 'item_detail:' + item_id
    var tkl = await my_cache.get(key_item_tkl)
    if (!tkl) {
      console.log('cache miss:' + key_item_tkl)
      try {
        var res = await got.post('http://api.chaozhi.hk/tb/ulandArray', {
          body: qs.stringify(body),
          headers: {
            'content-type': 'application/x-www-form-urlencoded'
          }
        })
        var json = JSON.parse(res.body)

        var ttl = 60 * 60
        var item = await my_cache.get(key_item_detail)
        if (item && item.couponendtime) {
          ttl = item.couponendtime - new Date().valueOf() / 1000
          ttl = ttl > 0 ? ttl : 1
        }
        await my_cache.set(key_item_tkl, json, ttl)
        ctx.body = json
      } catch (e) {
        console.error(e)
        ctx.body = { "msg": e, "error_code": 102 }
      }
    } else {
      ctx.body = tkl
    }
  }

}

export default new Home()