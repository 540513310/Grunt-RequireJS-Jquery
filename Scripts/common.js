/* 通用辅助Js库 */

function showMoney(type) {
    var islogin = "@isLogin";
    if (islogin == "False") {
        window.top.location.href = "/Account/Login?ReturnUrl=" + window.top.location.href;
    } else {
        $.post("/Users/Fund/Summary", function (data) {
            if (data.Code == 1) {
                if (type == "A") {
                    $(".nav-content .memberSpMallMoney").text(data.MallMoney + ' 元').addClass("fontRed");
                    $(".nav-content .memberSpMallMoney").show();
                    $(".nav-content .memberLbMallMoney").hide();//.css("cursor", "default");
                } else if (type == "B") {
                    $(".nav-content .memberSpOrderMoney").text(data.OrderMoney + ' 元').addClass("fontRed");
                    $(".nav-content .memberSpOrderMoney").show();
                    $(".nav-content .memberLbOrderMoney").hide();//.css("cursor", "default");
                } else if (type == "C") {
                    $(".work_user-money .memberSpMallMoney").text(data.MallMoney + ' 元').addClass("fontRed");
                    $(".work_user-money .memberSpMallMoney").show();
                    $(".work_user-money .memberLbMallMoney").hide();//.css("cursor", "default");
                } else if (type == "D") {
                    $(".work_user-money .memberSpOrderMoney").text(data.OrderMoney + ' 元').addClass("fontRed");
                    $(".work_user-money .memberSpOrderMoney").show();
                    $(".work_user-money .memberLbOrderMoney").hide(); //css("cursor", "default");
                }
            } else if (data.Code == 0) {
                window.top.location.href = "/Account/Login?ReturnUrl=" + window.top.location.href;
            } else if (data.indexOf("登录超时") != -1) {
                window.top.location.href = "/Account/Login?ReturnUrl=" + window.top.location.href;
            }
        })
    }

}

function hideMoney(type) {
    if (type == 'A') {
        $(".nav-content .memberSpMallMoney").hide();
        $(".nav-content .memberLbMallMoney").show();
    }
    else if (type == 'B') {
        $(".nav-content .memberSpOrderMoney").hide();
        $(".nav-content .memberLbOrderMoney").show();
    } else if (type == 'C') {
        $(".work_user-money .memberSpMallMoney").hide();
        $(".work_user-money .memberLbMallMoney").show();
    } else if (type == 'D') {
        $(".work_user-money .memberSpOrderMoney").hide();
        $(".work_user-money .memberLbOrderMoney").show();
    }
}

var Utils = {
    "Ajax": function(url, data,type) {
        return $.ajax({
            url: url,
            data: data,
            type: type,
            dataType: "json",
            contentType: 'application/json; charset=utf-8',
            async: false,
            cache: false,
            beforeSend: function(xhr) {

            },
            success: function(data) {

            },
            error: function() {

            },
            complete: function(xht, ts) {

            }
        }).responseJSON;
    },
    "FillSelect": function(controlId, data, defaultOption) {
        if (controlId && data) {
            if (Dd(controlId)) {
                Dd(controlId).length = 1;
                $.each(data, function(k, v) {
                    if (defaultOption && defaultOption === v.Value)
                        $('#' + controlId).append("<option value='" + v.Id + "' selected>" + v.Value + "</option>");
                    else
                        $('#' + controlId).append("<option value='" + v.Id + "'>" + v.Value + "</option>");
                });
            }
        }
    }
}

function Dd(i) { return document.getElementById(i); }
function Ds(i) { Dd(i).style.display = ''; }
function Dh(i) { Dd(i).style.display = 'none'; }
function Df(i) { Dd(i).focus(); }

(function() {
    /*
    让IE8-浏览器支持html5 placeholder属性，支持类型为password
    */
    if (!('placeholder' in document.createElement('input'))) { //判断浏览器是否支持placeholder属性，不支持则扩展
        //让IE7-支持display inline-block css，因为password类型需要用dom来模拟
        document.write('<style>div.placeholder{display:inline;zoom:1;position:relative;border:none !important;}input.placeholder{color:#999;border:none !important;}div.placeholder div.note{font-size:12px;color:#999;position:absolute;left:10px;top:-50%}</style>');
        $.fn.placeholder = function(config) {
            return this.each(function() {
                var me = $(this), pl = me.attr('placeholder');
                var wrap = me.wrap('<div class="placeholder" style="width:' + me.outerWidth(true) + 'px;height:' + me.outerHeight(true) + 'px"></div>').parent();
                var note = wrap.append('<div class="note" style="line-height:' + me.outerHeight(true) + 'px;width:' + me.outerWidth(true) + 'px;height:' + me.outerHeight(true) + 'px">' + pl + '</div>')
                    .click(function () {
                        wrap.find('div.note').hide();
                        me.focus();
                    }).find('div.note');
                me.bind("blur", function () {
                    if (me.val() === '') note.show();
                }).bind("focus", function () {
                    note.hide();
                });

                if (me.val() !== '')note.hide();
            });
        }
        
        $(function() {
            $('input[placeholder],textarea[placeholder]').placeholder();
        });
    }
}());

//返回顶部
function gotoTop(acceleration, stime) {
    acceleration = acceleration || 0.1;
    stime = stime || 6;
    var x1 = 0;
    var y1 = 0;
    var x2 = 0;
    var y2 = 0;
    var x3 = 0;
    var y3 = 0;
    if (document.documentElement) {
        x1 = document.documentElement.scrollLeft || 0;
        y1 = document.documentElement.scrollTop || 0;
    }
    if (document.body) {
        x2 = document.body.scrollLeft || 0;
        y2 = document.body.scrollTop || 0;
    }
    var x3 = window.scrollX || 0;
    var y3 = window.scrollY || 0;

    var x = Math.max(x1, Math.max(x2, x3));

    var y = Math.max(y1, Math.max(y2, y3));


    var speeding = 1 + acceleration;
    window.scrollTo(Math.floor(x / speeding), Math.floor(y / speeding));

    if (x > 0 || y > 0) {
        var run = "gotoTop(" + acceleration + ", " + stime + ")";
        window.setTimeout(run, stime);
    }
};

//滑动判断，菜单特效
$(window).scroll(function () {
    var h_num = $(window).scrollTop();

    if (h_num > 360) {
        $('#return_top').show(200);
    } else {

        $('#return_top').hide(200);
    }
});


$(function () {
    if ($("#cartCount").length) {
        $.post("/Cart/GetCartCount", function (data) {
            if (data.Code == 1 && data.CartCount > 0) {
                $("#cartCount").text(data.CartCount);
            }
        })
    }
})


function checkCert() {
    if (userInfo && typeof (userInfo) === "object") {
        if (userInfo.SystemCert.indexOf('A') < 0) {
            var msg = {};
            switch (userInfo.CertState) {
                case 0:
                    msg.title = "请完成企业实名认证后再操作！";
                    msg.desc = "进行商城交易需经过<span class=\"lightBlue\">企业实名认证</span>，您当前尚未进行此认证。";
                    msg.button = {
                        cleanBtn: true,
                        enterBtn: {
                            text: '去认证',
                            url: '/Users/ValidateInfo/BaseInfo'
                        }
                    };
                    showNoCertDialog(msg);
                    return false;;
                case 1:
                    msg.title = "资料审核中，暂时无法操作";
                    msg.desc = "联系客服0510-66008000了解审核进度。";
                    msg.button = {
                        cleanBtn: false,
                        enterBtn: {
                            text: '关闭',
                            url: 'javascript:hideCertDialog();'
                        }
                    };
                    showNoCertDialog(msg);
                    return false;;
                case 3:
                    msg.title = "认证未通过，无法操作";
                    msg.desc = "您的帐号未通过认证审核，原因：" + userInfo.CertNote + "。重新认证通过后才可以操作~";
                    msg.button = {
                        cleanBtn: true,
                        enterBtn: {
                            text: '重新认证',
                            url: '/Users/ValidateInfo/BaseInfo'
                        }
                    };
                    showNoCertDialog(msg);
                    return false;
            }
        }
    }

    return true;
}

var certDialog;
function showNoCertDialog(msg) {
    certDialog =  $.dialog({
        lock: true,
        max: false,
        min: false,
        fixed: true,
        resize: false,
        drag: true,
        esc: false
    });
    certDialog.hide();
    certDialog.title("");
    var html = "";
    html += "<div class=\"ui-member-dialog width500\">";
    html += "<div class=\"title\"><h3>" + msg.title + "</h3></div>";
    html += "<div class=\"msg\">" + msg.desc + "</div>";
    html += "<div class=\"btns\">";
    if (msg.button.cleanBtn) {
        html += "<a href=\"javascript:;\" onclick=\"hideCertDialog();\">取消</a>";
    }
    html += '<a class=\"normal-blue-button\" href=\"' + msg.button.enterBtn.url + '\">' + msg.button.enterBtn.text + '</a>';
    html += "</div>";
    html += "</div>";
    certDialog.content(html);
    certDialog.show();
}

function hideCertDialog() {
    certDialog.hide();
    certDialog.close();
}


function doapplyt5() {
    if ($("#agree_t5").length && $("#agree_t5").prop("checked")) {
        $.post("/Users/ValidateInfo/ApplyT5", function (data) {
            if (data.success) {
                if ($("#applyt5dialogcontent").length) {
                    var html = "<div class=\"title\"><h3>申请已提交！</h3></div>";
                    html += "<div class=\"msg\">中心将联系您补充相关资料，可致电客服0510-66008000了解审核所需资料。</div>";
                    html += "<div class=\"btns\">";
                    html += '<button class=\"sop_btn\" href=\"javascript:void(0);\" onclick=\"hideApplyT5Dialog()\">确定</button>';
                    html += "</div>";
                    $("#applyt5dialogcontent").empty().html(html);
                }
                if ($("#t5ApplyState").length) {
                    $("#t5ApplyState").val("N");
                }

                if ($("#applyt5op").length) {
                    $("#applyt5op").empty().html("申请已提交，中心将联系您补充相关资料，可致电客服0510-66008000了解审核所需资料。")
                }
            } else {
                alert(data.msg);
            }
        })
    }
}