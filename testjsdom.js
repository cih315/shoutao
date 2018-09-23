const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const url = 'https://uland.taobao.com/coupon/edetail?e=hIuOaoMOU6EGQASttHIRqeviykwMFOE2aBBzkzHzivseZ70UuoQJiBFUqcc/SOX06+HJ/8ceVH1+xtX3mC9mzDEhJpUUrcnYV6UtQ6J03JSkaXRx42EY6nY9x3IctcCWLspxGy3zBjY8IeN8lvhRA2lzrR4+frcb2XhfVVaMpqG15FJ9pwQ64K3AXcfXif+p&traceId=0b839c1e15372580415916078e&union_lens=lensId:0b0840e9_087f_165ebb83109_7101'

JSDOM.fromURL(url, {
    //url: url,
    referrer: "https://uland.taobao.com",
    //contentType: "text/html",
    includeNodeLocations: true,
    storageQuota: 10000000,
    runScripts:  'dangerously' //"outside-only"
  }).then( (dom) =>{
    console.log(dom.window.document.body)
  });
  