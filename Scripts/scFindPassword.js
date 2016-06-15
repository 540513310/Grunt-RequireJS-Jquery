var flag = false;

function ckAspxForm()
{
    $("#accountError").html("");
    var account = $.trim($("#Account").val());

    if(account.length == 0 || account == null || typeof(account) == "undefined")
    {
        $("#accountError").html("必须填写帐户名称");
        return false;
    }
    var mobile = checkMobileRegex(account);

    if(!mobile)
    {
        $("#accountError").html("请输入正确的手机号码");
        return false;
    }

    if(!flag)
    {
        $("#slideError").show();
        return false;
    }    
    
    $("#FindPassword").submit();
}

function checkMobileRegex(mobile)
{
    if(!mobile || mobile.length !== 11 || !mobile.match(/^1[3|4|5|8][0-9]\d{4,8}$/))
        return undefined;
    return mobile;
}

$(document).ready(function ()
{
    $(".button").find("a").eq(1).addClass("fixWidth");

    var x;
    var isMove = false;
    var sliderCode = $("#sliderCode");

    var html = '<div class="slider_bg"></div>' +
               '<div class="slider_text">请按住滑块，拖动到最右边</div>' +
               '<div class="handler handler_bg"></div>';
    sliderCode.append(html);


    var handler = sliderCode.find('.handler');
    var slider_bg = sliderCode.find('.slider_bg');
    var text = sliderCode.find('.slider_text');
    var maxWidth = sliderCode.width() - handler.width();

    $(handler).mousedown(function (e)
    {
        isMove = true;
        x = e.pageX - parseInt(handler.css("left"), "10px");
    });

    $(document).mousemove(function (e)
    {
        var _x = e.pageX - x;
        if(isMove)
        {
            if(_x > 0 && _x <= maxWidth)
            {
                handler.css({ "left": _x });
                slider_bg.css({ "width": _x });
            } else if(_x > maxWidth)
            {
                CheckOK();                
            }
        }
    }).mouseup(function (e)
    {
        isMove = false;
        var _x = e.pageX - x;
        if(_x < maxWidth)
        {
            handler.css({ "left": 0 });
            slider_bg.css({ "width": 0 });
        }
    });


    function CheckOK()
    {
        handler.removeClass('handler_bg').addClass('handler_ok_bg');
        text.text("验证通过");        
        handler.unbind('mousedown').css("left", "260px");
        $(document).unbind('mousemove');
        $(document).unbind('mouseup');
        slider_bg.css("width", "260px");
        text.css("color", "white");
        flag = true;
        $("#slideError").hide();
    }
});