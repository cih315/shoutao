import ejs from 'ejs';
import got from 'got';
import qs from 'querystring';
const view_path = __dirname + '/../views'
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
    // 1.query cat list
    var classify = got("http://api.haodanku.com/app/get_classify")
    // 2.query deserve list
    var deserve = got("http://api.haodanku.com/app/get_deserve_item_new")
    // 3.query new item
    var body = {
      cid: 0,
      min_id: -1
    }
    var items = got.post('http://api.haodanku.com/app/get_fqcat_items', {
      body: qs.stringify(body)
    })
    var data = {};
    try {
      var results = await Promise.all([classify, deserve, items])
      data = { classify: JSON.parse(results[0].body), deserve: JSON.parse(results[1].body), items: JSON.parse(results[2].body) }
    } catch (e) {
      console.error(e)
    }
    ejs.renderFile(view_path + '/index.html', data, { async: false }, (err, html) => {
      if (err) {
        console.error(err)
        ctx.body = err
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
      res = await got.post('http://api.haodanku.com/app/get_fqcat_items', {
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
    ejs.renderFile(view_path + '/list.html', data, { async: false }, (err, html) => {
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
      res = await got.post('http://api.haodanku.com/app/get_fqcat_items', {
        body: qs.stringify(body),
        headers: {
          'content-type': 'application/x-www-form-urlencoded'
        }
      })
    } catch (e) {
      console.error('cat load error:', e)
    }
    ctx.body = res.body
  }

  async item(ctx, next) {
    let iid = ctx.params.iid
    let api1 = 'http://v2.api.haodanku.com/item_detail/apikey/lowangquan/itemid/' + iid
    let api2 = 'http://v2.api.haodanku.com/get_similar_info/apikey/lowangquan/itemid/' + iid
    let r1 = got.get(api1)
    let r2 = got.get(api2)
    var data = {}
    try {
      var results = await Promise.all([r1, r2])
      data = { item: JSON.parse(results[0].body).data, likes: JSON.parse(results[1].body) }
    } catch (e) {
      console.error(e)
    }
    ejs.renderFile(view_path + '/detail.html', data, { async: false }, (err, html) => {
      if (err) {
        console.error(err)
        ctx.body = err
      } else {
        ctx.body = html
      }
    })

  }

  async search(ctx, next) {
    var api = 'http://api.haodanku.com/app/get_keyword_items_new'
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
    var api = 'http://api.haodanku.com/app/get_keyword_items_new'
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
    let api = 'http://v2.api.haodanku.com/get_similar_info/apikey/lowangquan/itemid/' + iid
    try {
      let res = await got.get(api)
      let json = JSON.parse(res.body)
      ctx.body = json
    } catch (e) {
      ctx.body = 'error'
    }
  }


}

export default new Home()