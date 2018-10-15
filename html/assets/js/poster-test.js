/**
 * 生成海报
 * @param   canvasId   canvas id
 * @param   imgBox     图片容器（.class或#id）
 * @param   url        二维码地址
 * @param   itemDetail 商品信息
 */
function canvasApp(canvasId,imgBox,url,itemDetail)
{
    var canvas = document.getElementById(canvasId);
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = "#f8f8f8";  
    canvas.width = document.documentElement.offsetWidth * 2 * .7;
    canvas.height = canvas.width + 348;

    var imageData = ctx.getImageData(0, 0,canvas.width,canvas.height);
    for(var i = 0; i < imageData.data.length; i += 4) {
        // 当该像素是透明的，则设置成白色
        if(imageData.data[i + 3] == 0) {
            imageData.data[i] = 255;
            imageData.data[i + 1] = 255;
            imageData.data[i + 2] = 255;
            imageData.data[i + 3] = 255; 
        }
    }

    ctx.putImageData(imageData, 0, 0);
    ctx.fillText("end_price_title",20,20);

    // 商品主图
    var item_img = new Image();
    item_img.setAttribute('crossOrigin','anonymous');
    item_img.src =  'http://api.fq'+'apps.com/bridge/image?url='+ encodeURIComponent(itemDetail['image'] + '_600x600.jpg');
    item_img.onload = function()
    {
        ctx.drawImage(item_img, 0, 0, canvas.width, canvas.width);
        // 商品标题
        var str = itemDetail['title'];

        ctx.fillStyle = '#333333';
        ctx.lineWidth = 1; 
        ctx.textAlign = 'left';
        ctx.textBaseline = "top";
        ctx.font = '24px Helvetica';
        var lineWidth = 0;
        var canvasWidth = canvas.width;//计算canvas的宽度 
        var initHeight = canvas.width + 10;//绘制字体距离canvas顶部初始的高度
        var lastSubStrIndex = 0; //每次开始截取的字符串的索引

        for(var i = 0;i <= str.length; i++) { 
            lineWidth += ctx.measureText(str[i]).width; 

            if(lineWidth > canvasWidth - 40){ 
                ctx.fillText(str.substring(lastSubStrIndex,i),20,initHeight);//绘制截取部分
                initHeight += 30;//字体的高度
                lineWidth = 0;
                lastSubStrIndex = i;

            } 
            if(i == str.length - 1 ){
                ctx.fillText(str.substring(lastSubStrIndex,i + 1 ),20,initHeight);
            }
        }

        //券后价
        var end_price_str = '券后价';
        var end_price_str_hright = initHeight + 40;
        ctx.fillStyle = '#f13849';//字体颜色
        ctx.textAlign = 'left';
        ctx.font = '18px Helvetica';
        ctx.fillText(end_price_str, 20, end_price_str_hright);

        //￥
        ctx.fillStyle = '#f13849';//字体颜色
        ctx.textAlign = 'left';
        ctx.font = '24px Helvetica';
        ctx.fillText('￥', 20, end_price_str_hright + 32);

        //券后价
        var end_price = itemDetail['end_price'];
        ctx.fillStyle = '#f13849';
        ctx.textAlign = 'left';
        ctx.font = '34px Helvetica';
        ctx.fillText(end_price, 46, end_price_str_hright + 24);

         //第一条斜线
        ctx.moveTo(canvasWidth / 3 + 14, end_price_str_hright);
        ctx.lineTo(canvasWidth / 3 - 24, end_price_str_hright + 70);
        ctx.strokeStyle = "#dddddd";
        ctx.stroke();

        //在售价
        var end_price_str = '在售价';
        ctx.fillStyle = '#8f8f8f';//字体颜色
        ctx.textAlign = 'left';
        ctx.font = '18px Helvetica';
        ctx.fillText(end_price_str, canvasWidth / 3 + 32, end_price_str_hright);

        //￥
        ctx.fillStyle = '#8f8f8f';//字体颜色
        ctx.textAlign = 'left';
        ctx.font = '24px Helvetica';
        ctx.fillText('￥', canvasWidth / 3 + 32, end_price_str_hright + 32);

        //在售价价格
        var zkPice = itemDetail['price'];
        ctx.fillStyle = '#8f8f8f';//字体颜色
        ctx.textAlign = 'left';
        ctx.font = '34px Helvetica';
        ctx.fillText(zkPice, canvasWidth / 3 + 58, end_price_str_hright + 24);

        //第二条斜线
        ctx.moveTo((canvasWidth / 3) * 2 + 34, end_price_str_hright);
        ctx.lineTo((canvasWidth / 3) * 2 - 14 , end_price_str_hright + 70);
        ctx.strokeStyle = "#dddddd";
        ctx.stroke();

        //优惠券
        var end_price_str = '优惠券';
        ctx.fillStyle = '#8f8f8f';//字体颜色
        ctx.textAlign = 'left';
        ctx.font = '18px Helvetica';
        ctx.fillText(end_price_str, (canvasWidth / 3) * 2 + 50, end_price_str_hright);

        //￥
        ctx.fillStyle = '#8f8f8f';//字体颜色
        ctx.textAlign = 'left';
        ctx.font = '24px Helvetica';
        ctx.fillText('￥', (canvasWidth / 3) * 2 + 50 , end_price_str_hright + 32);

        //quan价格
        var coupon = itemDetail['coupons'];
        ctx.fillStyle = '#8f8f8f';//字体颜色
        ctx.textAlign = 'left';
        ctx.font = '34px Helvetica';
        ctx.fillText(coupon, (canvasWidth / 3) * 2 + 76, end_price_str_hright + 24);

        /* 销量背景矩形路径 */
        ctx.beginPath();
        const grd = ctx.createLinearGradient(0, 0, 200, 0);
        ctx.moveTo(12, canvas.height - 50);
        ctx.lineTo(244, canvas.height - 50); 
        ctx.lineTo(246, canvas.height - 48);
        ctx.lineTo(246, canvas.height - 12);
        ctx.lineTo(244, canvas.height - 10);
        ctx.lineTo(12, canvas.height - 10); 
        ctx.lineTo(10, canvas.height - 12);
        ctx.lineTo(10, canvas.height - 48);
        ctx.lineTo(12, canvas.height - 50); 
        ctx.lineWidth = 1;
        ctx.strokeStyle="#f26760";
        ctx.fillStyle ='#f26760';
        ctx.fill();
        ctx.closePath();

         //长按二维码识别查看商品
        var str = '长按二维码识别查看商品';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.font = '20px Helvetica';                   
        ctx.fillText(str, 128, canvas.height - 42 );


        /*二维码*/
        var code_img = new Image();
        code_img.setAttribute('crossOrigin','anonymous');
        code_img.src = 'http://api.fq'+'apps.com/bridge/image?url='+ encodeURIComponent('http://api.fq'+'apps.com/qrcode/echo_qrcode?w=600&url='+encodeURIComponent(url));
        code_img.onload = function()
        {
            ctx.drawImage(code_img, canvas.width - 160,canvas.height - 160,150, 150);
            /*保存为图片*/
            var image = new Image();
            image.setAttribute('crossOrigin','anonymous');
            image.src = canvas.toDataURL("img/png");

            $(imgBox).attr("background","white").attr("src",image.src);
            hasImage(imgBox);
            hasPoster = 1;
        }
    }
}
/**
 * 提示显隐
 * @param    imgBox 图片容器（.class或#id）
 */
function hasImage(imgBox)
{
    if($(imgBox).attr('src') == "") {
        $('.image_loading').show();
        $('.image_show').hide();
    } else {
        $('.image_loading').hide();
        $('.image_show').show();
    }
}

/**
 * 点击合成海报按钮
 */
$(".fq-camera").click(function() {
    // 当前设备不支持生成海报
    if(camera != 1) {
        $('#fq_alert_info').text('您当前IOS版本暂不支持该功能，请升级到IOS9.3以上。');
        $('#fq_alert').modal();
        return;
    }

    if(hasPoster == 0) $('.imgData').attr('src','');
    $(".fq-sharecanvas").css("display","flex");

    hasImage('.imgData');

    {/* 已存在海报，下面操作直接 */}
    if($('.imgData').attr('src')) return;
    if(actionName == 'agentdetail') {
        var url = window.location.href;
    } else {
        var url = window.location.origin;
        if(posterRid != 0) {
            if(pushType == 1) {
                url += '/index/agentdetail/rid/'+ posterRid +'/push_type/1/id/' + id;
            } else if(guanFang) {
                url += '/index/official_details/rid/'+ posterRid +'/itemid/' + id;
                if(guanFang == 1) {
                    url += '/index/official_details/rid/'+ posterRid +'/itemid/' + id;
                } else {
                    url += '/Applist/details/itemid/'+ id +'/rid/' + posterRid;
                }
            } else if(bannerMid) {
                url += '/index/agentdetail/rid/'+ posterRid +'/banner_id/'+ bannerMid +'/id/' + id;
            } else {
                url += '/index/agentdetail/rid/'+ posterRid +'/id/' + id;
            }
        } else if(posterPname && posterPname != 'no') {
            posterPname = posterPname.replace('mm_','');
            posterPname = posterPname.replace('_','-');
            if(pushType == 1) {
                url += '/index/agentdetail/pname/'+ posterPname +'/push_type/1/id/' + id;
            } else if(guanFang) {
                if(guanFang == 1) {
                    url += '/index/official_details/pname/'+ posterPname +'/itemid/' + id;
                } else {
                    url += '/Applist/details/itemid/'+ id +'/pname/' + posterPname;
                }
            } else if(bannerMid) {
                url += '/index/agentdetail/pname/'+ posterPname +'/banner_id/'+ bannerMid +'/id/' + id;
            } else {
                url += '/index/agentdetail/pname/'+ posterPname +'/id/' + id;
            }
        } else {
            if(pushType == 1) {
                url += '/index/details/push_type/1/id/' + id;
            } else if(guanFang) {
                if(guanFang == 1) {
                    url += '/index/official_details/itemid/' + id;
                } else {
                    url += '/Applist/details/itemid/' + id;
                }
            } else if(bannerMid) {
                url += '/index/details/banner_id/'+ bannerMid +'/id/' + id;
            } else {
                url += '/index/details/id/' + id;
            }
        }

        if(super_search != '') {
            url = decodeURIComponent(window.location.href);
            if(posterRid != 0) {
                url = url.replace('details','agentdetail') + '/rid/' + posterRid;
            } else if(posterPname && posterPname != 'no') {
                url = url.replace('details','agentdetail') + '/pname/' + posterPname;
            }
        }
    }
    //canvasApp('sharecanvas','.imgData',url,itemDetail);
    $.ajax({
        url:'/api/api_get_short_url',
        type:'POST',
        data:{"url":url}
    }).done(function(res) {
        if(res.status == 1) {
            hasPoster = 1;
            canvasApp('sharecanvas','.imgData',res.info,itemDetail);
        } else {
            canvasApp('sharecanvas','.imgData',url,itemDetail);
        }
    }).fail(function(){
        canvasApp('sharecanvas','.imgData',url,itemDetail);
    });
});

/**
 * 隐藏海报
 */
$(".fq-canvas .am-icon-close").click(function(){
    $(".fq-sharecanvas").css("display","none");
});