function isPlaceholer() {
    var input = document.createElement('input');
    return "placeholder" in input;
}

$(function () {
    //文本框默认占位符
    if (!isPlaceholer()) {
        $("input[type=text]").each(function (k, v) {
            if ($(v).val())
                return;

            $(v).addClass("f-gray");
            var text = $(v).attr("placeholder");
            if (undefined != text && text) {
                $(v).val(text);
                $(v).on("blur", function () {
                    if (!$(v).val()) {
                        $(v).val(text);
                    }
                });

                $(v).on("focus", function () {
                    $(v).remove("f-gray");
                    if ($(v).val() === text) {
                        $(v).val('');
                    }
                });
            }
        });
    }

});



//当滚动条的位置处于距顶部100像素以下时，跳转链接出现，否则消失  
$(function () {
    $(window).scroll(function () {
        if ($(window).scrollTop() > 200) {
            $(".work_slide-main-top").fadeIn(1500);
        }
        else {
            $(".work_slide-main-top").fadeOut(1500);
        }
    });
    //当点击跳转链接后，回到页面顶部位置  
    $(".work_slide-main-top").click(function () {
        $('body,html').animate({ scrollTop: 0 }, 1000);
        return false;
    });
});

//显示用户信息
$(function () {
    $(".account-welcome").hover(function () {
        $(this).addClass("infoHover");
    }, function () {
        $(this).removeClass("infoHover");
    });
});

//关闭&显示右侧边栏
$(function () {
    $(".work_slide-main-close").click(function () {
        var slide = $(this).parent().parent();
        if (slide.hasClass("isclose")) {
            slide.removeClass("isclose");
        } else {
            slide.addClass("isclose");
        }
    });
});

//我的挂单展开&关闭子菜单
$(function () {
    var parent = $(".have-child-item");
    parent.click(function () {
        var childs = parent.parent().find(".fd-hide");
        if (childs && childs.length > 0) {
            $.each(childs, function () {
                $(this).removeClass("fd-hide");
                $(this).addClass("fd-show");
            });
            parent.find("em").addClass("open");
            parent.find("em").removeClass("close");
        } else {
            childs = parent.parent().find(".fd-show");
            if (childs && childs.length > 0) {
                $.each(childs, function () {
                    $(this).removeClass("fd-show");
                    $(this).addClass("fd-hide");
                });
            }
            parent.find("em").removeClass("open");
            parent.find("em").addClass("close");
        }
    });
});



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