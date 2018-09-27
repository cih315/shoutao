const fs = require('fs')
const path = require('path')
const Canvas = require('canvas')
const got = require('got')
const qr = require('qr-image')

/**
 * load draw template
 * @param {*} context 
 * @param {*} fromImage 
 */
async function loadTemplate(context, fromImage = true) {
  if (!fromImage) {
    context.ctx.rect(0, 0, 800, 1144)
    context.ctx.fillStyle = '#fff'
    context.ctx.fill()
    return
  } else {
    return new Promise((res, rej) => {
      const img = new Canvas.Image()
      img.onload = () => {
        context.ctx.drawImage(img, 0, 0)
        res()
      }
      img.onerror = (err) => {
        console.log(err)
        rej(err)
      }
      img.src = context.templatePath
    })
  }
}

/**
 * download image to tmpPath
 * @param {*} context 
 */
async function downloadImage(context) {
  if (fs.existsSync(context.tmpPath)) {
    fs.unlinkSync(context.tmpPath)
  }
  console.log('downloadImage start: ' + context.item.ImgUrl)
  let url = context.item.ImgUrl;
  if (url.indexOf('http') < 0) {
    url = 'http:' + url;
  }
  let pipe;
  try {
    console.log('1111')
    pipe = got.stream(url).pipe(fs.createWriteStream(context.tmpPath))
    console.log('2222')
  } catch (e) {
    console.error('errrorrrrrrr')
  }
  return new Promise((res, rej) => {
    pipe.on('finish', () => {
      console.log('downloadImage end')
      res()
    })
    pipe.on('error', (err) => {
      console.log("3333")
      rej(err)
    })
  })
}
/**
 * fill the item main image
 * @param {*} context 
 */
async function fillImage(context) {
  return new Promise((res, rej) => {
    let img2 = new Canvas.Image()
    img2.onload = () => {
      if (img2.width < 500) {
        rej('img width < 500')
        return
      }
      context.ctx.drawImage(img2, 0, 0)
      res()
    }
    img2.onerror = (err) => {
      console.log(err)
      rej(err)
    }
    img2.src = context.tmpPath
  })
}
/**
 * output image to outputPath
 * @param {*} context 
 */
async function output(context) {
  if (fs.existsSync(context.outputPath)) {
    fs.unlinkSync(context.outputPath)
  }
  return new Promise((res, rej) => {
    let pipe = context.canvas.createJPEGStream().pipe(fs.createWriteStream(context.outputPath));
    pipe.on('finish', () => {
      console.log('output finish')
      res(context.outputPath)
    })
    pipe.on('error', (err) => {
      console.error(err)
      rej(err)
    })
  })
}
/**
 * draw round rect without fill
 * @param {*} ctx 
 * @param {*} x 
 * @param {*} y 
 * @param {*} width 
 * @param {*} height 
 * @param {*} radius 
 */
function drawRoundRect(ctx, x, y, width, height, radius) {
  drawRoundRect(ctx, x, y, width, height, radius)
}

/**
 * draw round rect with fill
 */
function drawRoundRect(ctx, x, y, width, height, radius, fillStyle) {
  drawRoundRect(ctx, x, y, width, height, radius, fillStyle, fillStyle)
}

/**
 * draw round rect with fill
 */
function drawRoundRect(ctx, x, y, width, height, radius, fillStyle, strokeStyle) {
  if (strokeStyle) {
    ctx.strokeStyle = strokeStyle
  }
  ctx.beginPath();
  ctx.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 3 / 2);
  ctx.lineTo(width - radius + x, y);
  ctx.arc(width - radius + x, radius + y, radius, Math.PI * 3 / 2, Math.PI * 2);
  ctx.lineTo(width + x, height + y - radius);
  ctx.arc(width - radius + x, height - radius + y, radius, 0, Math.PI * 1 / 2);
  ctx.lineTo(radius + x, height + y);
  ctx.arc(radius + x, height - radius + y, radius, Math.PI * 1 / 2, Math.PI);
  ctx.lineTo(x, y + radius);
  ctx.stroke()
  if (fillStyle) {
    ctx.fillStyle = fillStyle
    ctx.fill()
  }
  ctx.closePath()
}


/**
 * draw round rect with fill
 */
function drawRoundRect2(ctx, x, y, width, height, radius, fillStyle, strokeStyle) {
  if (strokeStyle) {
    ctx.strokeStyle = strokeStyle
    ctx.lineWidth = 3
  }
  ctx.beginPath();
  ctx.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 3 / 2);
  ctx.lineTo(width - radius + x - 230, y);
  ctx.stroke()

  ctx.beginPath();
  ctx.lineTo(width - radius + x - 30, y);
  ctx.lineTo(width - radius + x, y);
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(width - radius + x, radius + y, radius, Math.PI * 3 / 2, Math.PI * 2);
  ctx.lineTo(width + x, height + y - radius - 230);
  ctx.stroke()

  ctx.beginPath()
  ctx.lineTo(width + x, height + y - radius - 30);
  ctx.lineTo(width + x, height + y - radius);
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(width - radius + x, height - radius + y, radius, 0, Math.PI * 1 / 2);
  ctx.lineTo(radius + x + 230, height + y);
  ctx.stroke()

  ctx.beginPath()
  ctx.lineTo(radius + x + 30, height + y);
  ctx.lineTo(radius + x, height + y);
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(radius + x, height - radius + y, radius, Math.PI * 1 / 2, Math.PI);
  ctx.lineTo(x, y + radius + 230);
  ctx.stroke()

  ctx.beginPath()
  ctx.lineTo(x, y + radius + 30);
  ctx.lineTo(x, y + radius);
  ctx.stroke()

  if (fillStyle) {
    ctx.fillStyle = fillStyle
    ctx.fill()
  }
  ctx.closePath()
}




/**
 * fill item title text
 * @param {*} context 
 */
async function fillText(context) {
  const ctx = context.ctx
  let str = context.item.GoodsName + '，' + context.item.TjRemark
  const goodsPrice = context.item.GoodsPrice
  const actMoney = context.item.ActMoney
  const lastPrice = context.item.LastPrice
  const mallType = context.item.ly
  ctx.font = '30px pingfang'
  ctx.fillStyle = '#4D4D4D'
  let txt = '';
  let line = 1;
  let idx = 0;
  str = str.replace(/\ +/g, "").replace(/[ ]/g, "").replace(/[\r\n]/g, "")
  while (line <= 3) {
    if (line == 1) {
      idx = 0;
      while (idx < str.length) {
        txt = str.substring(0, idx++)
        let pix = ctx.measureText(txt)
        if (pix.width > 340) {
          break;
        }
      }
      console.log(txt + ' line:' + line)
      ctx.fillText(txt, 110, 875)
      str = str.substring(idx - 1)
      line++
    } else if (line == 2) {
      idx = 0;
      while (idx < str.length) {
        txt = str.substring(0, idx++)
        let pix = ctx.measureText(txt)
        if (pix.width > 425) {
          break;
        }
      }
      console.log(txt + ' line:' + line)
      ctx.fillText(txt, 25, 920)
      str = str.substring(idx - 1)
      line++
    } else if (line == 3) {
      idx = 0;
      while (idx < str.length) {
        txt = str.substring(0, idx++)
        let pix = ctx.measureText(txt)
        if (pix.width > 425) {
          break;
        }
      }
      console.log(txt + ' line:' + line)
      ctx.fillText(txt, 25, 965)
      str = str.substring(idx - 1)
      line++
      break
    }
  }

  //价格25,1010
  const nowPriceStr = '现价 ￥' + goodsPrice.toFixed(2)
  const lastPriceTxt = '券后价 '
  const lastPriceMoneyTxt = '￥' + lastPrice.toFixed(2)

  ctx.fillStyle = '#949494'
  ctx.fillText(nowPriceStr, 25, 1030)
  //划线价格
  ctx.strokeStyle = 'rgba(0,0,0,0.8)'
  let pix = ctx.measureText(nowPriceStr)
  ctx.beginPath()
  ctx.lineTo(100, 1025)
  ctx.lineTo(95 + pix.width - 70, 1025)
  ctx.stroke()
  ctx.closePath()
  //券后价
  ctx.fillStyle = '#949494'
  ctx.fillText(lastPriceTxt, 170, 1082)
  pix = ctx.measureText(lastPriceTxt);
  //券后价格
  ctx.font = '38px pingfang'
  if (mallType == 2) {
    ctx.fillStyle = '#FF5000'
  } else if (mallType == 1) {
    ctx.fillStyle = '#FF0036'
  }
  ctx.fillText(lastPriceMoneyTxt, 170 + pix.width - 5, 1082)

  //券(图标)
  if (mallType == 2) {
    drawRoundRect(ctx, 25, 1055, 35, 40, 5, '#FF5000', '#FF5000');
  } else if (mallType == 1) {
    drawRoundRect(ctx, 25, 1055, 35, 40, 5, '#FF0036', '#FF0036');
  }
  ctx.font = '30px pingfang'
  ctx.fillStyle = '#fff'
  ctx.fillText('券', 28, 1082)
  //优惠价格
  let quan = actMoney + '元'
  pix = ctx.measureText(quan)
  drawRoundRect(ctx, 25, 1055, 35 + pix.width + 10, 40, 5);
  ctx.font = '30px pingfang'
  if (mallType == 2) {
    ctx.fillStyle = '#FF5000'
  } else if (mallType == 1) {
    ctx.fillStyle = '#FF0036'
  }
  ctx.fillText(quan, 65, 1082)

  //25,850
  if (mallType == 2) {
    const strokeStyle = '#FF5000'
    const filleStyle = '#FF5000'
    //taobao FE5406
    drawRoundRect(ctx, 25, 850, 70, 35, 5, filleStyle, strokeStyle)
    ctx.font = 'bold 28px msyh'
    ctx.fillStyle = '#fff'
    ctx.fillText('淘宝', 32, 874)
    //qr code circle
    drawRoundRect2(ctx, 490, 835, 750 - 490, 1085 - 825, 5, null, strokeStyle)
    ctx.font = 'bold 24px msyh'
    ctx.fillStyle = strokeStyle
    ctx.fillText('长按识别二维码', 535, 1095)
  } else if (mallType == 1) {
    const strokeStyle = '#FF0036'
    const filleStyle = '#FF0036'
    //tmall #FF0036
    drawRoundRect(ctx, 25, 850, 70, 35, 5, filleStyle, strokeStyle);
    ctx.font = 'bold 28px msyh'
    ctx.fillStyle = '#fff'
    ctx.fillText('天猫', 32, 874)
    //qr code circle
    drawRoundRect2(ctx, 490, 835, 750 - 490, 1085 - 825, 5, null, strokeStyle)
    ctx.font = 'bold 24px msyh'
    ctx.fillStyle = strokeStyle
    ctx.fillText('长按识别二维码', 535, 1095)
  }
  const qrUrl = context.item.uland
  let buffer = qr.imageSync(qrUrl, { type: 'png' })
  return new Promise((res, rej) => {
    let qrImg = new Canvas.Image()
    qrImg.onload = () => {
      ctx.drawImage(qrImg, 505, 845, 230, 230)
      res()
    }
    qrImg.onerror = (err) => {
      console.log('err')
      console.error(err)
      rej(err)
    }
    qrImg.src = buffer
  })
}

/**
 * exports.draw
 * @param {*} context 
 */
async function draw(context) {
  //add font family
  const font = new Canvas.Font('pingfang', path.join(__dirname, '/font/pingfang.ttf'))
  //font.addFace('msyh', path.join(__dirname, 'msyh.ttf'))
  const canvas = new Canvas(800, 1144)
  const ctx = canvas.getContext('2d')
  const tmpPath = context.tmpPath
    || (context.item.hashid && path.join(__dirname + '/tmp/', context.item.hashid + ".jpg"))
    || path.join(__dirname, '/tmp/tmp.jpg')
  const templatePath = context.templatePath
    || path.join(__dirname, '/template/template.png')
  const outputPath = context.outputPath
    || (context.item.hashid && path.join(__dirname + '/output/', context.item.hashid + ".jpg"))
    || path.join(__dirname, '/output/output.jpg')
  //set ctx
  context.canvas = canvas
  context.ctx = ctx
  context.tmpPath = tmpPath
  context.templatePath = templatePath
  context.outputPath = outputPath
  //download Image
  await downloadImage(context)
  await loadTemplate(context, false)
  await fillImage(context)
  await fillText(context)
  let filePath = await output(context)
  console.log('output png file : ' + filePath)
  return filePath
}
(
  async () => {
    const context = {
      item: {
        ID: 1046226,
        GoodsId: '575109942989',
        GoodsName: '光感cc棒！+美妆蛋仅需19.9',
        GoodsClass: '化妆品',
        GoodsLink: 'https://detail.tmall.com/item.htm?id=575109942989',
        ActLink: 'https://uland.taobao.com/quan/detail?sellerId=3380278282&activityId=e6bce092effe4ec79f727643256e41ba&qq-pf-to=pcqq.c2c',
        ImgUrl: 'https://img.alicdn.com/bao/uploaded/TB2CYVRcy6guuRjy1XdXXaAwpXa_!!3380278282.jpg',
        ActMoney: 10,
        GoodsPrice: 29.9,
        LastPrice: 19.9,
        BeginDate: '2018-09-20 12:27:19',
        EndDate: '2018-09-22 23:59:59',
        SaleCount: 6418,
        TKMoneyRate: 40,
        TjRemark: '【聚划算】期间下单还随机赠送美妆蛋！会呼吸的cc棒，轻薄透气，遮盖脸部肌肤瑕疵，自然润肤，8大护肤精华，滋养补水，持久保湿不脱妆，让你的肌肤吹弹可破~专为亚洲女性定制色号！！！',
        Coupon_Count: 100000,
        Coupon_SaleCount: 100000,
        ly: 1,
        MarketImage: 'https://img.alicdn.com/bao/uploaded/TB2CYVRcy6guuRjy1XdXXaAwpXa_!!3380278282.jpg',
        ActivityType: 2,
        OrderCount: 0,
        TowHourCount: 0,
        AllDayCount: 0,
        SellerId: '3380278282',
        CommssionType: 2
      }
    }
    //await draw(context)
  }
)

module.exports.draw = draw;