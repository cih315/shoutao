import my_cache from './cache'
import ejs from 'ejs'
import got from 'got';
import qs from 'querystring'
import pids from './pids'

const view_path = __dirname + '/../views'
const api_item_detail = 'http://v2.api.haodanku.com/item_detail/apikey/lowangquan/itemid/'
const api_item_similar = 'http://v2.api.haodanku.com/get_similar_info/apikey/lowangquan/itemid/'
/**
 * item redirect
 */
class Go {
  constructor() {
    this.index = this.index.bind(this);
    this.item = this.item.bind(this)
  }


  async index(ctx, next) {
    ctx.redirect('/')
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

  async item(ctx, next) {
    var pid_cfg = await this.pid(ctx, next)
    var item_id = ctx.params.itemid
    var key_item_detail = 'item_detail:' + item_id
    var item = await my_cache.get(key_item_detail)
    var data = { item: item }
    if (!item) {
      var p1
      var likes, p2
      var p_arr = []
      var key_item_likes = 'item_likes:' + item_id
      item = await my_cache.get(key_item_detail)
      if (!item) {
        let api1 = api_item_detail + item_id
        p1 = got.get(api1)
        p_arr.push(p1)
      }
      likes = await my_cache.get(key_item_likes)
      if (!likes) {
        let api2 = api_item_similar + item_id
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
            if (data.item.itemid) {
              await my_cache.set(key_item_detail, data.item, ttl)
              console.log('item detail cache miss:' + key_item_detail)
            }
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
        }
      }
    }
    if (!data.item) {
      ctx.redirect('/')
      return
    }
    data.cfg = pid_cfg
    data.iid = item_id
    ejs.renderFile(view_path + '/go.html', data, { async: false, cache: true, rmWhitespace: true }, (err, html) => {
      if (err) {
        console.error(err)
        ctx.body = 'server error'
        ctx.status = 500
      } else {
        ctx.body = html
      }
    })
  }
}

export default new Go()