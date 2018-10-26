const got = require('got')
const querystring = require('querystring')
const url = require('url')
const { CookieJar } = require('tough-cookie');
const cookieJar = new CookieJar();

function sign(params, token) {
    let str = token + '&' + params.t + '&' + params.appKey + '&' + params.data
    let md5Str = md5(str)
    return md5Str
}

function md5(data) {
    var Buffer = require("buffer").Buffer;
    var buf = new Buffer(data);
    var str = buf.toString("binary");
    var crypto = require("crypto");
    return crypto.createHash("md5WithRSAEncryption").update(str).digest("hex");
}
async function fetch(uland, token) {
    let api = 'https://acs.m.taobao.com/h5/mtop.alimama.union.hsf.coupon.get/1.0/'
    let urljson = url.parse(uland)
    let qjson = querystring.parse(urljson.query)
    var data = {
        "e": qjson.e,
        "pid": qjson.pid
    }

    var params = {
        jsv: '2.4.0',
        appKey: '12574478',
        api: 'mtop.alimama.union.hsf.coupon.get',
        v: '1.0',
        AntiCreep: true,
        AntiFlood: true,
        type: 'json',
        dataType: 'json',
        callback: 'mtopjsonp2',
        data: JSON.stringify(data),
    }

    var cookies = cookieJar.getCookiesSync(api)
    if (cookies.length > 0) {
        let cookie = cookies[0].toJSON()
        if (cookie) {
            token = cookie.value.split('_')[0]
        }
    }

    params.t = new Date().valueOf()
    var signx = sign(params, token)
    params.sign = signx
    api = api + '?' + querystring.stringify(params)
    var options = {
        headers: {
            'accept-encoding': 'gzip',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
            'referer': uland
        },
        cookieJar: cookieJar,
        timeout: 5000
    }
    let res = await got(api, options)
    var body = JSON.parse(res.body)
    if (res.body.indexOf('令牌为空') >= 0) {
        cookies = cookieJar.getCookiesSync(api)
        if (cookies.length > 0) {
            let cookie = cookies[0].toJSON()
            if (cookie) {
                token = cookie.value.split('_')[0]
            }
        }
        return fetch(uland, token)
    } else {
        return body
    }
}
(async () => {
    var json = await fetch('https://uland.taobao.com/coupon/edetail?e=hIuOaoMOU6EGQASttHIRqeviykwMFOE2aBBzkzHzivseZ70UuoQJiBFUqcc/SOX06+HJ/8ceVH1+xtX3mC9mzDEhJpUUrcnYV6UtQ6J03JSkaXRx42EY6nY9x3IctcCWLspxGy3zBjY8IeN8lvhRA2lzrR4+frcb2XhfVVaMpqG15FJ9pwQ64K3AXcfXif+p&traceId=0b839c1e15372580415916078e&union_lens=lensId:0b0840e9_087f_165ebb83109_7101&pid=mm_14942785_97600036_18176850324')
    console.log(json)
})

module.exports = { fetch: fetch }