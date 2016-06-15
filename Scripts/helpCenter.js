$(document).ready(function () {
    var title = $(document).attr("title");
    var num =title.split("-").length - 1;  
    var index = title.indexOf("-");
    var index2 = title.indexOf("-", index + 1);
    var tit = title.substring(0, index);
      
    $('.side-menu dd').each(function () {
        var selectItem = "";
        if ($(this).text() == tit) {
            $(this).addClass('selected');
        }
        if(num == 2) {
            tit = title.substring(0, index);
            if ($(this).hasClass('selected')) {
                selectItem = $(this).text();
                $(".title").html("<div class='title'><i></i>" + selectItem + "</div>");
                $(".breadcrumb li.active").html(selectItem);
                $(".breadcrumb li.active").before("<li><a  href='/HelperCenter'>帮助中心></a></li>");
            }
        }
        else {
            tit = title.substring(index + 1, index2);
        }
        
    });
});
//流程tab页鼠标点击事件
$('.tabs li').click(function () {
    $(this).siblings().removeClass('slected');
    $(this).addClass('slected');
    // 获取当前点击tab页的id
    var currentId = ($(this).children('a').attr("href"));
    $('.tab-content ul').each(function () {
        $(this).css('display', 'none');
        // 获取当前展示内容的id
        var id = "#" + $(this).attr('id');
        if (currentId == id) {
            $(this).css('display', 'block');
        }

    })
});
//流程tab页鼠标悬停事件
$('.tabs li').mouseover(function () {
    $(this).siblings().removeClass('slected');
    $(this).addClass('slected');
    // 获取当前点击tab页的id
    var currentId = ($(this).children('a').attr("href"));
    $('.tab-content ul').each(function () {
        $(this).css('display', 'none');
        // 获取当前展示内容的id
        var id = "#" + $(this).attr('id');
        if (currentId == id) {
            $(this).css('display', 'block');
            // 获取当前项的index
            var index = $(this).index();
            var number = index * 80 + index * 100;
            // $(this).css('margin-left',number+'px');
            //改变三角位置
            $('.triangle-tip span.bot').css('left', number + 240 + 'px');
            $('.triangle-tip span.top-white').css('left', number + 240 + 'px');
        }

    })
});

//左侧菜单二级菜单点击事件
$('.side-menu dd').click(function () {
    $(this).addClass("selected").siblings().removeClass("selected");
    //暂无内容的二级菜单项
    if ($(this).children("a").attr("href") == "javascript:void(0);") {
        //显示拨打客服热线信息
        $(".content").html("<div class='title'><i></i>" + $(this).html() + "</div>" + "<div class='blank-remind'>正在更新中，如有问题，请拨打客服热线<strong class='fontRed'>0510-66001000</strong>。</div>");
    }
});

$('.list li').click(function () {
    var title = $(document).attr("title");
    var tit = title.substring(0, title.indexOf("-"));
    $(".title").html("<div class='title'><i></i>" + tit + "</div>");
    //$(".breadcrumb li.active").html(tit);
    //$(".breadcrumb li.active").before("<li><a href='@Url.Action('Index', 'HelperCenter')'>帮助中心></a></li>");
});