/**
 * home page
 */
class Home {
  constructor() {
    this.index = this.index.bind(this);
    this.cat = this.cat.bind(this);
    this.index = this.index.bind(this);
  }
  /**
   * home page
   * @param {*} ctx 
   * @param {*} next 
   */
  async index(ctx, next) {
    ctx.body = "home"
  }
  /**
   * activ
   * @param {*} ctx 
   * @param {*} next 
   */
  async act(ctx, next) {
    ctx.body = 'act'
  }

  async cat(ctx, next) {
    ctx.body = 'cat'
  }

  async item(ctx, next) {
    ctx.body = 'item'
  }

  async search(ctx, next) {
    ctx.body = 'search'
  }


}

export default new Home()