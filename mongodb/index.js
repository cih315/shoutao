import { app } from '../config/default'
import mongoose from 'mongoose'
import chalk from 'chalk'

const db = mongoose.connection;
db.once('open', () => {
  console.log(
    chalk.green('mongodb connect success')
  )
})

db.on('error', function (error) {
  console.error(
    chalk.red('error in mongodb connection: ' + error)
  )
  mongoose.disconnect()
});

db.on('close', function () {
  console.log(
    chalk.red('mongodb disconnect ,reconnect...')
  );
  mongoose.connect(config.mongodbUrl, { server: { auto_reconnect: true } })
});
mongoose.Promise = global.Promise
mongoose.connect(app.mongodbUrl, { useNewUrlParser: true });
export default mongoose;
