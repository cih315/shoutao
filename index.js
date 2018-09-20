const querystring = require('querystring');
const got = require('got')
const ejs = require('ejs')
const fs = require("fs")
var Hashids = require('hashids');
var hashids = new Hashids();
const pic = require('./draw')
const pid = 'mm_14942785_97600036_18176850324';
const session = '7000010072916787752d8075875798536fade1f44127420a49db9d443ca9e55488e37c1267987083';
//all
var api = 'http://api.xuandan.com/DataApi/index?AppKey=8ua248rlp0&page=1&cid=0';
//9.9
var api = 'http://api.xuandan.com/DataApi/index?AppKey=8ua248rlp0&page=1&cid=0&Maxp=10&Minp=1'
//大面额
var api = 'http://api.xuandan.com/DataApi/index?AppKey=8ua248rlp0&page=1&cid=0&sort=2';

const date = '20180920'
const htmlFile = '/20180920-3.html'

async function loadItem() {
  const response = await got.get(api);
  let data = JSON.parse(response.body);
  let url = []
  if (data.total_num && data.total_num > 0) {
    var dataList = data.data.slice(0, 50)
    console.log('item count: ' + dataList.length)
    var num = 0
    var arr = [];
    let marketImage;
    let tjRemark;
    for (i in dataList) {
      var item = dataList[i];
      item.hashid = hashids.encode(item.GoodsId)
      url.push(item.GoodsLink + '|' + item.ActLink);
      num++;
      if (num % 10 == 0) {
        console.log('tmp uland start: ' + url.length)
        var tmp = await uland(url, pid, tjRemark, marketImage);
        console.log('tmp uland count: ' + tmp.length)
        arr = arr.concat(tmp)
        url = []
      }
    }
    console.log('uland end')
    console.log('uland count: ' + arr.length)
    num = 0;
    for (i in dataList) {
      var item = dataList[i];
      if (arr[i]) {
        item.tkl = arr[i].tkl;
        item.uland = arr[i].ulandResult;
        var filePath = await pic.draw({ item: item })
        item.shoutao = 'https://img.wificoin.ml/shoutao/' + date + '/' + item.hashid + '.jpg'
        num++
        if (num % 3 == 0) {
          //await sleep(rand(1000, 3000))
        }
      }
    }
    console.log('job done: ' + num)
    let str = fs.readFileSync(__dirname + "/output.ejs", "utf8")
    let html = ejs.render(str, { list: dataList })
    fs.writeFileSync(__dirname + htmlFile, html, "utf-8")

  }
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}


async function sleep(time) {
  return new Promise((res) => {
    setTimeout(() => { res() }, time)
  })
}

async function uland(url, pid, tklTitle = '老王券粉丝福利购', tklImg = 'http://c.chaozhi.hk/timg.jpg') {
  let api1 = 'http://api.chaozhi.hk/tb/ulandArray'
  let body = querystring.stringify({
    urls: url,
    pid: pid,
    tklTitle: tklTitle,
    tklImg: tklImg,
    platform: true,
    isTkl: true,
    session: session
  });
  //console.log(body)
  let response = await got.post(api1, {
    body: body,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Forwarded-For': '10.47.103.13,4.2.2.2,10.96.112.230',
      'X-Real-IP': '192.168.247.1',
      'Proxy-Client-IP': '192.168.247.1',
      'WL-Proxy-Client-IP': '192.168.247.1'
    }
  });
  let json = JSON.parse(response.body)
  //console.log(json)
  let data = json.data
  return data
}

(
  async () => {
    await loadItem();
  }
)()