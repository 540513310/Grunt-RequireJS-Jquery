$(function () {

    if (top != null && top.location !== self.location) {
        top.location.href = "/Account/Login?ReturnUrl=" + escape(top.location.href);
    }

    $("#RememberMe").click(function () {
        var isChecked = $(this).is(":checked");
        if (isChecked) {
            $(".errorMessage").css("visibility", "visible");
            $(".errorContainer").text("公共电脑上请勿勾选记住账号。");
        } else {
            $(".errorMessage").css("visibility", "hidden");
        }
    });

    var ckName = getCookie("cuname");
    if (ckName && ckName != '') {
        $("#UserName").val(ckName);
    }
});

$("#tyChk").click(function () {
    checkRule();
});

function checkRule() {
    $(".errorMessage").css("visibility", "visible");

    if (!$("#tyChk").is(":checked")) {
        $(".errorContainer").text("您登录前请阅读和同意《交易细则》。");
        return false;
    }

    if ($("#UserName").val() === "" || $("#UserName").val().length === 0) {
        $(".errorContainer").text("请输入您的登录帐号");
        return false;
    }

    if ($("#Password").val() === "" || $("#Password").val().length === 0) {
        $(".errorContainer").text("请输入登录密码");
        return false;
    }

    if ($(".captcha").length>0) {
        if ($(".captcha").css("display") !== 'none' && ($("#captcha").val() === "" || $("#captcha").val().length !== 4)) {
            $(".errorContainer").text("请输入图形检验码");
            return false;
        }
    }

    $(".errorMessage").css("visibility", "hidden");
    return true;
}

function changeCaptcha() {
    $("#imgCaptcha").attr("src", $("#imgCaptcha").attr("src") + "?" + new Date());
}

function checkAspxForm() {
    var result = checkRule();
    if (result) {
        $(".btnLogin").attr("disabled", "disabled");
        $(".btnLogin").text("登录中...");
        $(".btnLogin").css("cursor", "wait");
        $("#ajaxForm").submit();
    }
}

function OnComplete() {
    $(".btnLogin").removeAttr("disabled");
    $(".btnLogin").text("登录");
    $(".btnLogin").css("cursor", "pointer");
}

function OnSuccess(data) {
    if (data.Code === 1) {

        if ($("#RememberMe").is(":checked")) {
            setCookie("cuname", $("#UserName").val(), 180);
        }

        if (data.ReturnUrl.indexOf("LogOff") !== -1) {
            window.location.href = "/";
        }
        else {
            if (data.ReturnUrl === "/")
                window.location.href = "/";
            else
                window.location.href = data.ReturnUrl;
        }
    } else if (data.Code === 0) {
        $(".errorMessage").css("visibility", "visible");
        $(".errorContainer").text(data.Message);
        if (data.ErrorTimes >= 3) {
            $(".captcha").show();
        }
        changeCaptcha();
    } else {
        window.reload();
    }
}
function OnFailure(e) {
    ///
}

//使用方法：setCookie('username','Darren',30)
function setCookie(cName, value, expiredays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + expiredays);
    document.cookie = cName + "=" + escape(value) + ((expiredays == null) ? "" : ";expires=" + exdate.toGMTString());
}


function getCookie(cName) {
    if (document.cookie.length > 0) {
        var cStart = document.cookie.indexOf(cName + "=");
        if (cStart !== -1) {
            cStart = cStart + cName.length + 1;
            var cEnd = document.cookie.indexOf(";", cStart);
            if (cEnd === -1)
                cEnd = document.cookie.length;
            return unescape(document.cookie.substring(cStart, cEnd));

        }
    }
    return "";
}