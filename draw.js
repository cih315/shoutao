const fs = require('fs')
const path = require('path')
const Canvas = require('canvas')
const got = require('got')

const canvas = new Canvas(800, 1144)
const ctx = canvas.getContext('2d')
const tmpPath = path.join(__dirname, 'tmp.jpg')
const templatePath = path.join(__dirname, 'template.png')
const outputPath = path.join(__dirname, 'output.png');
function fontFile(name) {
  return path.join(__dirname, name)
}
let font = new Canvas.Font('pingfang', fontFile('pingfang.ttf'))

async function loadTemplate() {
  return new Promise((resolve, reject) => {
    const img = new Canvas.Image()
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      resolve()
      //canvas.createPNGStream().pipe(fs.createWriteStream(path.join(__dirname, 'img.png')));
    }
    img.onerror = (err) => { console.log(err); reject(err) }
    img.src = templatePath
  })
}

async function loadImage(url) {
  fs.unlinkSync(tmpPath)
  console.log('loadImage start')
  let pipe = got.stream(url).pipe(fs.createWriteStream(tmpPath))
  return new Promise((res, rej) => {
    pipe.on('finish', () => {
      console.log('loadImage end')
      res()
    })
    pipe.on('error', (err) => {
      rej(err)
    })
  })

}

async function fillImage() {
  return new Promise((res, rej) => {
    let img2 = new Canvas.Image()
    img2.onload = () => {
      ctx.drawImage(img2, 0, 0)
      res()
    }
    img2.onerror = (err) => { console.log(err); rej(err); }
    img2.src = tmpPath
  })
}

async function output() {
  let pipe = canvas.createPNGStream().pipe(fs.createWriteStream(outputPath));
  pipe.on('finish', () => console.log('output finish'))
  pipe.on('error', () => console.log('output error'))
}



function drawRoundRect(ctx, x, y, width, height, radius) {
  drawRoundRect(ctx, x, y, width, height, radius)
}


function drawRoundRect(ctx, x, y, width, height, radius, fillStyle) {
  if (fillStyle) {
    ctx.strokeStyle = fillStyle
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



async function fillText() {
  //110,850
  ctx.font = '30px pingfang'
  ctx.fillStyle = '#4D4D4D'
  let str = '坚固耐用防摔，高清耐磨pc镜片，柔软海绵舒适内衬，透气循环系统。给你安心的呵护';
  let txt = '';
  let line = 1;
  let idx = 0;
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
      console.log(txt)
      ctx.fillText(txt, 110, 875)
      str = str.substring(idx - 1)
      line = 2
    } else if (line == 2) {
      //25,450
      idx = 0;
      while (idx < str.length) {
        txt = str.substring(0, idx++)
        let pix = ctx.measureText(txt)
        if (pix.width > 425) {
          break;
        }
      }
      console.log(txt)
      ctx.fillText(txt, 25, 920)
      str = str.substring(idx - 1)
      line = 3
    } else {
      //25,970
      idx = 0;
      while (idx < str.length) {
        txt = str.substring(0, idx++)
        let pix = ctx.measureText(txt)
        if (pix.width > 425) {
          break;
        }
      }
      console.log(txt)
      ctx.fillText(txt, 25, 965)
      str = str.substring(idx - 1)
      line = 4
    }
  }

  //价格25,1010
  ctx.fillStyle = '#949494'
  ctx.fillText('现价 ￥65.00', 25, 1030)
  //划线价格
  ctx.strokeStyle = 'rgba(0,0,0,0.8)'
  let pix = ctx.measureText('现价 ￥65.00')
  ctx.beginPath()
  //起点
  ctx.lineTo(95, 1025)
  //终点
  ctx.lineTo(95 + pix.width - 70, 1025)
  ctx.stroke()
  ctx.closePath()

  //券后价
  ctx.fillStyle = '#949494'
  ctx.fillText('券后价 ', 170, 1082)
  pix = ctx.measureText('券后价 ');
  //券后价格
  ctx.font = '38px pingfang'
  ctx.fillStyle = '#FE5406'
  ctx.fillText('￥35.00', 170 + pix.width - 5, 1082)



  //券(图标)
  drawRoundRect(ctx, 25, 1055, 35, 40, 5, '#FE5406');
  ctx.font = '30px pingfang'
  ctx.fillStyle = '#fff'
  ctx.fillText('券', 30, 1082)
  //优惠价格
  let quan = '30元'
  pix = ctx.measureText(quan);
  drawRoundRect(ctx, 25, 1055, 35 + pix.width + 10, 40, 5);
  ctx.font = '30px pingfang'
  ctx.fillStyle = '#FE5406'
  ctx.fillText(quan, 65, 1082)

  //25,850
  //淘宝FE5406
  drawRoundRect(ctx, 25, 850, 70, 35, 5, '#FF5000');
  ctx.font = 'bold 28px msyh'
  ctx.fillStyle = '#fff'
  ctx.fillText('淘宝', 32, 874)


  //天猫#FF0036
  drawRoundRect(ctx, 25, 850, 70, 35, 5, '#FF0036');
  ctx.font = 'bold 28px msyh'
  ctx.fillStyle = '#fff'
  ctx.fillText('天猫', 32, 874)

}

async function start() {
  await loadImage('https://img.alicdn.com/imgextra/i4/445268110/TB2WLbJlFmWBuNjSspdXXbugXXa_!!445268110.jpg')
  await loadTemplate()
  await fillImage()
  await fillText()
  await output()

}

(
  async () => {
    await start()
  }
)()