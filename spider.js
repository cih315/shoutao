const querystring = require('querystring');
const got = require('got')
const ejs = require('ejs')
const fs = require("fs")
const path = require('path')
var Hashids = require('hashids');
var hashids = new Hashids();
const pic = require('./draw')
const h5coupon = require('./h5coupon')
const pid = 'mm_14942785_97600036_18176850324';
const session = '7000010072916787752d8075875798536fade1f44127420a49db9d443ca9e55488e37c1267987083';
//all
var api = 'http://api.xuandan.com/DataApi/index?AppKey=8ua248rlp0&page=1&cid=0';
//9.9
var api = 'http://api.xuandan.com/DataApi/index?AppKey=8ua248rlp0&page=1&cid=0&Maxp=10&Minp=1'
//大面额
var api = 'http://api.xuandan.com/DataApi/index?AppKey=8ua248rlp0&page=1&cid=0&sort=2'
//销量榜
var api = 'http://api.xuandan.com/DataApi/Top100?appkey=8ua248rlp0&type=3'

const date = '20181008'
const last = '20181007'
const prefix = date + '-1'
const outputBase = __dirname + '/output/' + date + '/'
const last_output_base = __dirname + '/output/' + last + '/'
const tmpBase = __dirname + '/tmp'
const htmlFile = outputBase + prefix + '.html'

async function loadItem() {
  prepare()
  const response = await got.get(api);
  let data = JSON.parse(response.body);
  let url = []
  if (data.total_num && data.total_num > 0) {
    var dataList = data.data.slice(0, 100)
    var arr = [];
    var num = 0
    if (!fs.existsSync(tmpBase + '/data.json')) {
      console.log('item count: ' + dataList.length)
      var marketImage = 'https://img.wificoin.ml/shoutao/tkl.jpg';
      marketImage = 'https://gw.alicdn.com/tfs/TB1c.wHdh6I8KJjy0FgXXXXzVXa-580-327.png';
      let tjRemark;
      for (i in dataList) {
        var item = dataList[i];
        item.hashid = hashids.encode(item.GoodsId)
        url.push(item.GoodsLink + '|' + item.ActLink);
        num++;
        if (num % 40 == 0) {
          console.log('tmp uland request: ' + url.length)
          var tmp = await uland(url, pid, tjRemark, marketImage);
          console.log('tmp uland response: ' + tmp.length)
          arr = arr.concat(tmp)
          url = []
        }
      }
      if (url.length > 0) {
        console.log('tmp uland request: ' + url.length)
        var tmp = await uland(url, pid, tjRemark, marketImage);
        console.log('tmp uland response: ' + tmp.length)
        arr = arr.concat(tmp)
        url = []
      }

      console.log('uland total: ' + arr.length)
      num = 0;
      fs.writeFileSync(tmpBase + "/data.json", JSON.stringify(dataList))
      fs.writeFileSync(tmpBase + "/arr.json", JSON.stringify(arr))
    } else {
      dataList = JSON.parse(fs.readFileSync(tmpBase + '/data.json').toString('utf-8'))
      arr = JSON.parse(fs.readFileSync(tmpBase + '/arr.json').toString('utf-8'))
    }
    num = 0
    var resultList = []
    for (i in dataList) {
      var item = dataList[i];
      if (arr[i]) {
        if (arr[i].ulandCode != 0) {
          console.log(`item: ${i},tkl parse error: ${arr[i].ulandResult}`)
          continue
        }
        item.tkl = arr[i].tkl;
        item.uland = arr[i].ulandResult;
        var outputPath = outputBase + item.hashid + '.jpg'
        var last_output_path = last_output_base + item.hashid + '.jpg'
        if (fs.existsSync(last_output_path)) {
          console.log(`${++i} id: ${item.hashid} exist`)
          continue
        }
        item.shoutao = 'https://img.wificoin.ml/shoutao/' + date + '/' + item.hashid + '.jpg'
        var last_img = 'https://img.wificoin.ml/shoutao/' + last + '/' + item.hashid + '.jpg'
        try {
          var res = await got.head(last_img)
          if (res.statusCode == 200) {
            console.log(`${++i} id: ${item.hashid} last img exist`)
            continue
          }
        } catch (e) {
          //console.log(e)
        }
        if (!fs.existsSync(outputPath)) {
          try {
            var filePath = await pic.draw({ item: item, outputPath: outputPath })
          } catch (error) {
            console.log(`${++i} draw error`)
            continue
          }
        }

        var rt;
        try {
          rt = await h5coupon.fetch(item.uland + '&pid=' + pid)
        } catch (e) {
          console.log('============================')
          console.log(item)
          console.log('============================')
          console.error(e)
        }
        if (rt.data && rt.data.success) {
          var coupon = rt.data.result
          if (coupon && coupon.amount) {
            resultList.push(item)
            num++
          } else {
            console.log('item: ' + i + ',coupon invalid')
          }
        }

      }
    }
    console.log('job done: ' + num)
    var check = '法兰绒毛毯'
    var t, x
    for (var i in resultList) {
      if (resultList[i].GoodsName.indexOf(check) >= 0) {
        t = resultList[i]
        x = i
        break
      }
    }
    if (t) {
      resultList[x] = resultList[0]
      resultList[0] = t
    }

    fs.writeFileSync(tmpBase + "/data.json", JSON.stringify(resultList))
    let str = fs.readFileSync(__dirname + "/template/output.ejs", "utf8")
    let html = ejs.render(str, { list: resultList })
    fs.writeFileSync(htmlFile, html, "utf-8")

  }
}


function prepare() {
  var is_exist = fs.existsSync(outputBase)
  if (!is_exist) {
    mkdirs(outputBase)
  }
  var is_exist = fs.existsSync(tmpBase)
  if (!is_exist) {
    mkdirs(tmpBase)
  }
}
function mkdirs(dirpath) {
  if (!fs.existsSync(path.dirname(dirpath))) {
    mkdirs(path.dirname(dirpath));
  }
  fs.mkdirSync(dirpath);
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
