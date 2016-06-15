
var objectionDialog;
var deliverDiaglog;

/*提出异议*/
function sendObjection(contractId, status) {
    objectionDialog = $.dialog({
        title: "",
        content: "url:/Users/Contract/Objection?contractId=" + contractId + "&status=" + status+"&flag=A",
        min: false,
        max: false,
        lock: true,
        resize: false,
        fixed: true,
        close:false
    });
}


function showPostObjectResult(result) {
    var resultPostDialog = $.dialog({
        title: "",
        content: result.Msg,
        min: false,
        max: false,
        lock: true,
        resize: false,
        fixed: true,
        close: function() {
            window.reload();
        }
    });
    var html = "";
    html = '<div class="ui-member-dialog width500">';
    if (result.Msg == '操作成功') {
        html += '<div class="title success"><h3>异议提交成功</h3></div>';
        html += '<div class="btns">';
        html += '<a href="javascript:;" onclick=" window.top.location.reload();" class="normal-blue-button">确定</a>';
        html += '</div>';
    }   
    else {
        html += '<div class="title errors"><h3>异议提交失败</h3></div>';
        html += '<div class="btns">';
        html += '<a href="javascript:;" onclick="window.top.location.reload();" class="normal-blue-button">返回</a>';
        html += '</div>';
    }
    html += '</div>';
    resultPostDialog.content(html);
}

/*发货*/
function deliverGoods(contractId,type) {
    deliverDiaglog = $.dialog({
        title: "",
        content: "url:/Stock/Goods/Deliver?contractId=" + contractId+"&type="+type,
        min: false,
        max: false,
        lock: true,
        resize: false,
        fixed: true,
        close: function () {
            // location.reload();
            return true;
        }
    });
}

function closeDeliverGoods() {
    deliverDiaglog.hide();
}

//发货倒计时
function showSendGoodsTime() {
    var $sendGoodsTimeTip = $("#sendGoodsTimeTip");

    if ($sendGoodsTimeTip.length >= 1) {
        var interval = null;
        var $hdTotalTime = $("#hdTotalTime");//总秒数
        var $sendGoodsTimeMM = $("#sendGoodsTimeMM");//分钟
        var $sendGoodsTimeSS = $("#sendGoodsTimeSS");//秒
        setSendGoodsBtnDisable();
        interval = setInterval(function () {
            var hdTotalTimeVal = $("#hdTotalTime").val();
            var m = Math.floor(hdTotalTimeVal / 60);
            var s = Math.floor(hdTotalTimeVal % 60);
            if (hdTotalTimeVal < 0) {
                $sendGoodsTimeTip.remove();
                setSendGoodsBtnEnable();
                clearInterval(interval);
            }
            else {
                $sendGoodsTimeMM.text(m);
                $sendGoodsTimeSS.text(s);
                $hdTotalTime.val(hdTotalTimeVal - 1);
            }

        }, 1000);
    }
}

function setSendGoodsBtnEnable() {
    $(".btn-sendGoods").removeAttr("disabled")
        .removeClass("btn-Disable");
}

function setSendGoodsBtnDisable() {
    $(".btn-sendGoods").attr({"title": "发货倒计时中,请稍等!" })
        .addClass("btn-Disable");
}



function ShowDialog() {
    var result = $.dialog({
        width: 400,
        height: 150,
        title: "",
        lock: true,
        max: false,
        min: false,
        fixed: true,
        resize: false,
        drag: true,
        esc: false,
        close: function () {
            location.reload();
        }
    });
    result.hide();
    return result;
}

//发货 加发货时间判断
var dialog;
function sendGoods(contractId,type,isShowTip) {
    var $sendGoodsTimeTip = $("#sendGoodsTimeTip");
    if ($sendGoodsTimeTip.length >= 1 || isShowTip) {
        dialog = ShowDialog();
        var typeName = (type == "B" ? "过户" : "发货");
        var html = "";
        html += "<div class=\"ui-member-dialog width500\">";
        html += "<div class=\"title remind \"><h3>提示</h3></div>";
        html += "<div class=\"msg\">提单验证成功60秒后再" + typeName + "哦，请您稍稍等待!</div>"
        html += '<div class="btns">';
        html += "<input type='submit' onclick='dialogClose()' value='确定' class=\"normal-blue-button\" />";
        html += "</div>";
        html += "</div>";
        dialog.content(html);
        dialog.show();
    }
    else {
        deliverGoods(contractId, type);
    }
}

function dialogClose() {
    dialog.close();
}
