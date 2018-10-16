const Koa = require('koa');
const koabody = require('koa-body');
const app = new Koa();
//const db = require('./mongodb')
const serve = require('koa-static')

import chalk from 'chalk'
import router from './app/routers'

app.use(serve('app/public'));
app.use(koabody());
app.use(router.routes());

app.listen(3000, () => {
  console.log(chalk.green('server start listening at 3000'))
});