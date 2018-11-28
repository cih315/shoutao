const querystring = require('querystring');
const got = require('got')
const ejs = require('ejs')
const fs = require("fs")
const path = require('path')
const dateformat = require('dateformat')
var Hashids = require('hashids');
var hashids = new Hashids();

const api_item_detail = 'http://v2.api.haodanku.com/item_detail/apikey/lowangquan/itemid/'

const pic = require('./draw')
const h5coupon = require('./h5coupon')
const pid = 'mm_14942785_97600036_18176850324';
const session = '700001005490f169b6da0e8c56574d5e0fc34e4085121bf1feb6b3ade062d1ce9949887267987083';

const date = '20181128'
const prefix = date + '-1'
const outputBase = __dirname + '/dd/' + date + '/'
const tmpBase = __dirname + '/tmp'
const htmlFile = outputBase + prefix + '.html'
const mp_link = 'https://mp.weixin.qq.com/s/t7vDceDrCiGlNa5egbHP7Q'
const len = 100

async function getMpHtml(url) {
    try {
        const response = await got.get(url, {
            decompress: true,
            headers: {
                'accept-encoding': 'gzip',
                'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36'
            }
        })
        let html = response.body
        let regEx = /￥(.+?)￥/gi
        let rt = html.match(regEx)
        if (rt && rt.length > 0) {
            return rt
        }
    } catch (e) {
        throw new Error(e)
    }
}

async function tklParse(array) {
    let api = 'http://api.chaozhi.hk/tb/tklParse'
    let tkl_map = {}
    let size = array.length
    for (var i in array) {
        var v = array[i]
        var body = querystring.stringify({
            tkl: v
        });
        let response = await got.post(api, {
            body: body,
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
                'x-forwarded-for': '4.2.2.2,10.96.112.230',
                // 'x-real-ip': '192.168.247.1',
                // 'proxy-client-ip': '192.168.247.1',
                // 'wl-proxy-client-ip': '192.168.247.1'
            }
        });
        let json = JSON.parse(response.body)
        if (json.error_code === 0) {
            tkl_map[v] = json.data
            console.log(`${++i}/${size} tkl ${v} parse success`)
        } else {
            console.error(`${++i}/${size} tkl ${v} parse error: ${json.msg}`)
        }
        await sleep(rand(5000, 5000))

    }
    return tkl_map
}

function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}
async function sleep(time) {
    return new Promise((res) => {
        setTimeout(() => { res() }, time)
    })
}


async function uland(url, pid, tklTitle = '选客家粉丝福利购', tklImg = 'https://gw.alicdn.com/tfs/TB1c.wHdh6I8KJjy0FgXXXXzVXa-580-327.png') {
    let api = 'http://api.chaozhi.hk/tb/ulandArray'
    let body = querystring.stringify({
        urls: url,
        pid: pid,
        tklTitle: tklTitle,
        tklImg: tklImg,
        platform: true,
        isTkl: true,
        session: session
    });
    let response = await got.post(api, {
        body: body,
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'x-forwarded-for': '10.47.103.13,4.2.2.2,10.96.112.230',
            'x-real-ip': '192.168.247.1',
            'proxy-client-ip': '192.168.247.1',
            'wl-proxy-client-ip': '192.168.247.1'
        }
    });
    let json = JSON.parse(response.body)
    let data = json.data
    return data
}

function prepare() {
    var is_exist = fs.existsSync(outputBase)
    if (!is_exist) {
        mkdirs(outputBase)
    }
    is_exist = fs.existsSync(tmpBase)
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

(
    async () => {
        var tkls = []
        var ulands = []
        prepare()
        if (!fs.existsSync(outputBase + '/ulands.json')) {
            let url = mp_link
            let array = await getMpHtml(url)
            console.log('download mp html with tkl size: ', array.length)
            let tkl_map = await tklParse(array)
            console.log('tkl parse result size: ', Object.keys(tkl_map).length)
            var num = 0
            var urls = []
            var split_num = 2
            for (var k in tkl_map) {
                var item = tkl_map[k]
                tkls.push(item)
                var pic_url = item.pic_url
                var content = item.content
                var uland_url = item.url   //for uland
                num++
                urls.push(uland_url)
                if (num % split_num == 0) {
                    var uland_tmp = await uland(urls, pid, undefined, undefined)
                    ulands = ulands.concat(uland_tmp)
                    urls = []
                }
            }
            if (num < split_num && urls.length > 0) {
                var uland_tmp = await uland(urls, pid, undefined, undefined)
                ulands = ulands.concat(uland_tmp)
            }
            if (ulands.length > 0) {
                fs.writeFileSync(outputBase + '/tkls.json', JSON.stringify(tkls), { encoding: 'utf-8' })
                fs.writeFileSync(outputBase + '/ulands.json', JSON.stringify(ulands), { encoding: 'utf-8' })
                console.log('write urls and ulands json file')
            }
        } else {
            tkls = JSON.parse(fs.readFileSync(outputBase + '/tkls.json', { encoding: 'utf-8' }))
            ulands = JSON.parse(fs.readFileSync(outputBase + '/ulands.json', { encoding: 'utf-8' }))
            console.log('load urls and ulands json file')
        }
        var dataList = []
        var size = ulands.length
        for (var i in ulands) {
            var item = ulands[i]
            if (item.ulandCode == 0) {
                var info = item.ulandData.coupon_info
                var act_money = 0
                var begin_date = new Date()
                var end_date = new Date()
                var good_price = 0
                if (info) {
                    info = info.replace(/满/g, '').replace(/减/g, '').split('元')
                }
                if (info && info.length > 1) {
                    act_money = parseFloat(info[1])
                }
                //coupon detail
                item.GoodsId = item.itemId || item.ulandData.item_id
                var api = api_item_detail + item.GoodsId
                var res = await got.get(api)
                var body = JSON.parse(res.body)
                if (body.msg == 'SUCCESS' && body.data) {
                    begin_date = dateformat(new Date(parseInt(body.data.couponstarttime) * 1000),'yyyy-mm-dd HH:MM:ss')
                    end_date = dateformat(new Date(parseInt(body.data.couponendtime) * 1000),'yyyy-mm-dd HH:MM:ss')
                    good_price = body.data.itemprice
                    item.GoodsName = body.data.itemtitle
                    item.ly = body.data.shoptype == "C" ? '2' : '1'
                    item.ImgUrl = tkls[i].pic_url
                    item.GoodsLink = 'https://item.taobao.com/'
                    item.ActLink = item.ulandData.coupon_click_url
                    item.TjRemark = ''
                    item.GoodsPrice = parseFloat(good_price)
                    item.ActMoney = parseFloat(body.data.couponmoney)
                    item.LastPrice = item.GoodsPrice - item.ActMoney
                    item.BeginDate = begin_date
                    item.EndDate = end_date
                    item.uland = item.ulandResult
                    item.hashid = hashids.encode(item.GoodsId)
                    //item.go = 'https://www.xuankejia.cn/go/'+item.GoodsId
                    //item.go = 'https://www.xuankejia.cn/item/' + item.GoodsId
                    var url = 'https://www.xuankejia.cn/item/' + item.GoodsId
                    var api = 'http://api.weibo.com/2/short_url/shorten.json?source=2849184197&url_long=' + encodeURIComponent(url)
                    try {
                        var json = await got.get(api, {
                            timeout: 5000
                        });
                        json = JSON.parse(json.body)
                        url = json.urls[0].url_short
                    } catch (e) {
                        console.error('url_short error:', e)
                    }
                    item.go = url
                    dataList.push(item)
                    console.log(`${(++i)}/${size} parse item success : ${item.GoodsId}, effect:${begin_date}-${end_date}`)
                }
                await sleep(50)
            } else {
                console.log(`${(++i)}/${size} parse uland error : ${item.ulandResult} ${item.ulandCode}`)
            }
        }
        console.log('parse duodian item success: ' + dataList.length)
        var num = 0
        var resultList = []
        for (i in dataList) {
            var item = dataList[i];
            var outputPath = outputBase + item.hashid + '.jpg'
            if (!fs.existsSync(outputPath)) {
                try {
                    var filePath = await pic.draw({ item: item, outputPath: outputPath })
                    item.shoutao = 'https://img.wificoin.ml/shoutao/' + date + '/' + item.hashid + '.jpg'
                    resultList.push(item)
                    num++
                } catch (e) {
                    console.error(e)
                    console.log(`${++i} draw error`)
                }
            }

        }
        console.log('job done: ' + num)
        let str = fs.readFileSync(__dirname + "/template/output.ejs", "utf8")

        var tmp_list = [];
        var i = 1;
        var total = resultList.length
        var now = 1;
        do {

            tmp_list = resultList.splice(0, len)
            now += tmp_list.length
            let html = ejs.render(str, { list: tmp_list })
            var outFile = outputBase + date + (i++) + '.html'
            fs.writeFileSync(outFile, html, "utf-8")
        } while (tmp_list.length > 0 && now < total)
    }
)()
