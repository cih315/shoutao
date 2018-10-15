/**
 * user share page
 */
class Share {
  constructor() {
    this.index = this.index.bind(this);
  }
  /**
   * share page
   * @param {*} ctx 
   * @param {*} next 
   */
  async index(ctx, next) {
    let hashid =  ctx.params.hashid

    
    ctx.body = hashid
  }
}

export default new Share()