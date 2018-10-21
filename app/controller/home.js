import ejs from 'ejs';
import got from 'got';
import qs from 'querystring';
import my_cache from './cache'

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
  }
  /**
   * home page
   * @param {*} ctx 
   * @param {*} next 
   */
  async index(ctx, next) {
    var classify, p1
    var deserve, p2
    var items, p3
    var p_arr = []
    var body = { cid: 0, min_id: -1 }
    // 1.query cat list
    classify = my_cache.get('classify_list')
    if (!classify) {
      p1 = got(api_classify_list)
      p_arr.push(p1)
    }
    // 2.query deserve list
    deserve = my_cache.get('deserve_list')
    if (!deserve) {
      p2 = got(api_deserve_list)
      p_arr.push(p2)
    }
    // 3.query new items
    items = my_cache.get('item_list')
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
          my_cache.set('classify_list', data.classify, ttl_classify_list)
        }
        if (!deserve) {
          data.deserve = JSON.parse(ps[index++].body)
          my_cache.set('deserve_list', data.deserve, ttl_deserve_list)
        }
        if (!items) {
          data.items = JSON.parse(ps[index++].body)
          for (var i in data.items.data) {
            if (!data.items.data[i].product_id) {
              delete data.items.data[i]
            }
          }
          my_cache.set('item_list', data.items, ttl_item_list)
        }
      } catch (e) {
        console.log('fetch api data error', e)
      }
    }
    ejs.renderFile(view_path + '/index.html', data, { async: false, cache: true, rmWhitespace: true }, (err, html) => {
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
    ejs.renderFile(view_path + '/list.html', data, { async: false, cache: true, rmWhitespace: true }, (err, html) => {
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
      for (var i in body.data) {
        if (!body.data[i].product_id) {
          delete body.data[i]
        }
      }
    }
    ctx.body = body
  }

  async item(ctx, next) {
    let iid = ctx.params.iid
    var item, p1
    var likes, p2
    var p_arr = []
    var key_item_detail = 'item_detail:' + iid
    var key_item_likes = 'item_likes:' + iid
    item = my_cache.get(key_item_detail)
    if (!item) {
      let api1 = api_item_detail + iid
      p1 = got.get(api1)
      p_arr.push(p1)
    }
    likes = my_cache.get(key_item_likes)
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
          my_cache.set(key_item_detail, data.item, ttl)
          console.log('item detail cache miss:' + key_item_detail)
        } else {
          if (data.item.couponendtime) {
            ttl = data.item.couponendtime - new Date().valueOf() / 1000
            ttl = ttl > 0 ? ttl : 1
          }
        }
        if (!likes) {
          data.likes = JSON.parse(ps[index++].body)
          my_cache.set(key_item_likes, data.likes, ttl)
        }
      } catch (e) {
        console.log('fetch item detail & likes error:', e)
      }
    }
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

  async search(ctx, next) {
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
    try {
      var res = await got.post('http://api.chaozhi.hk/tb/ulandArray', {
        body: qs.stringify(body),
        headers: {
          'content-type': 'application/x-www-form-urlencoded'
        }
      })
      ctx.body = JSON.parse(res.body)
    } catch (e) {
      console.error(e)
      ctx.body = { "msg": e, "error_code": 102 }
    }
  }

}

export default new Home()