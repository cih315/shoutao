const cheerio = require('cheerio')
const querystring = require('querystring');
const got = require('got')
const pid = 'mm_14942785_97600036_18176850324';
const session = '7000010072916787752d8075875798536fade1f44127420a49db9d443ca9e55488e37c1267987083';


let api = 'http://api.xuandan.com/DataApi/index?AppKey=8ua248rlp0&page=1&cid=0';
(async () => {
  const response = await got.get(api);
  let data = JSON.parse(response.body);
  let url = ''
  if (data.total_num && data.total_num > 0) {
    for (i in data.data) {
      var item = data.data[i];
      console.log(`商品名称:${item.GoodsName} \r\n
      优惠面值:${item.ActMoney} \r\n
      券后价格:${item.LastPrice}\r\n
      优惠时间:${item.BeginDate} - ${item.EndDate}\r\n
      推荐理由:${item.TjRemark}`)
      console.log('============================')
      url += item.GoodsLink + '|' + item.ActLink + '\r\n';
    }
    let marketImage = data.data[0].MarketImage;
    let tjRemark = data.data[0].TjRemark;
    await uland(url, pid, tjRemark, marketImage);
  }
})()

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
  let response = await got.post(api1, {
    body: body,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  let json = JSON.parse(response.body)
  let data = json.data


}