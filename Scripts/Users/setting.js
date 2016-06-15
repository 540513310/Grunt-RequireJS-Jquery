$(document).ready(function ()
{
    var width = $("#s1").width();
    var parentW = $("#pp").width();
    if(parentW > 900)
    {
        $("#s2").css("top", "0px").css("left", (parentW / 2 + width / 2) + "px");
    }
    else
    {
        $("#s2").css("top", "0px").css("left", (parentW / 2 + width / 2) + "px");
    }

    var tr = $("#table tbody tr");
    $(tr).height("50px");
    $.each(tr, function (k, v)
    {
        $(v).find("td").eq(0).css("text-align", "right");
        $(v).find("td").eq(1).css("text-align", "left");
    })

    window.onresize = function ()
    {
        var parentW = $("#pp").width();
        if(parentW > 900)
        {
            $("#s2").css("top", "0px").css("left", (parentW / 2 + width / 2) + "px");
        }
        else
        {
            $("#s2").css("top", "0px").css("left", (parentW / 2 + width / 2) + "px");
        }
    }
});

function checkMobileRegex(mobile)
{
    if(!mobile || mobile.length !== 11 || !mobile.match(/^1[3|4|5|8][0-9]\d{4,8}$/))
        return undefined;
    return mobile;
}

function sendTimeout(ts)
{
    var timer = window.setInterval(function ()
    {
        if(ts-- === 0)
        {
            window.clearInterval(timer);
            $("#btn-code").removeAttr("disabled");
            $("#btn-code").removeClass("unEnable");
            $("#btn-code").val("获取验证码");
        } else
        {
            $("#btn-code").val("(" + ts + " 秒)后重发").css("width", "90px;");
        }
    }, 1000);
}

function pushCode(e)
{
    var obj = $(e);
    var mobile = checkMobileRegex($("#phone").val());

    if(!mobile)
    {
        alert("提示：请您输入正确的手机号码！");
        return;
    }

    $("#codeErrorDiv").html("");

    obj.addClass("code");
    obj.attr("disabled", "disabled");
    obj.val("正在发送...");
    $.post('/Users/Setting/SendValidityCodeOnly?mobile=' + mobile, null, function (response)
    {
        if(response.success)
        {
            $("#errorDiv").html("");
            $("#btn-code").addClass("unEnable");
            $("#btn-code").attr("disabled", "disabled");
            sendTimeout(60);
        }
        else
        {
            obj.removeAttr("disabled");
            obj.removeClass("code");
            obj.val("获取验证码");
            $("#errorDiv").html(response.msg);
        }
    });
}