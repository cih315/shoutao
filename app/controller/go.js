import my_cache from './cache'
import ejs from 'ejs'

const view_path = __dirname + '/../views'
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

  async item(ctx, next) {
    const item_id = ctx.params.itemid
    const key_item_id = 'item_detail:' + item_id
    const item = my_cache.get(key_item_id)
    if (!item) {
      ctx.redirect('/')
      return
    }
    var data = { item: item }
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