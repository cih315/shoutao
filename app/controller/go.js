/**
 * item redirect
 */
class Go {
  constructor() {
    this.index = this.index.bind(this);
  }

  async index(ctx, next) {
    let hashid =  ctx.params.hashid
    ctx.body = hashid
  }
}

export default new Go()