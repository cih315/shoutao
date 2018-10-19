const Koa = require('koa')
const koabody = require('koa-body')
const serve = require('koa-static')
const minify = require('html-minifier').minify
import chalk from 'chalk'
import router from './app/routers'
const app = new Koa();
//const db = require('./mongodb')
const port = 3000

app.use(serve('app/public'));
// app.use(async function (ctx, next) {
//   await next();
//   if (!ctx.response.is('html')) return;
//   let body = ctx.body;
//   if (!body || body.pipe) return;
//   if (Buffer.isBuffer(body)) body = body.toString();
//   console.log(ctx.response.is('html'))
//   ctx.body = minify(body);
// })
app.use(koabody());
app.use(router.routes());


app.listen(port, () => {
  console.log(chalk.green('server start listening at ' + port))
});