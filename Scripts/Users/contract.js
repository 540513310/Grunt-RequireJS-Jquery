$(document).ready(function () {
    var reminderDialog;

    $('.i-date').calendar({ format: 'yyyy-MM-dd' });

    //搜索条件清空
    $("#filterClean").click(function () {
        $("#search select").each(function () {
            $(this).prop('selectedIndex', 0);
        });
        $("#startDate").val("开始时期");
        $("#endDate").val("结束日期");
    });

    $("#chkall").change(function (e) {
        if ($("#chkall").prop('checked')) {
            $("td").find("input[type='checkbox']").prop('checked', true);
        } else {
            $("td").find("input[type='checkbox']").prop('checked', false);
        }
    });
    $("#quickDate").change(function () {
        switch ($("#quickDate").val()) {
            case "1":
                $("#startDate").val(months_3);
                $("#endDate").val(n);
                break;
            case "2":
                $("#startDate").val(year_1);
                $("#endDate").val(n);
                break;
            case "3":
                $("#startDate").val(GetDateStr("3", "start"));
                $("#endDate").val(GetDateStr("3", "end"));
                break;
            case "4":
                $("#startDate").val(GetDateStr("4", "start"));
                $("#endDate").val(GetDateStr("4", "end"));
                break;
            case "5":
                $("#startDate").val("");
                $("#endDate").val(GetDateStr("5", "end"));
                break;
            default:
                $("#startDate").val("");
                $("#endDate").val("");
                break;
        }
    });
    $("#search-more").click(function () {
        $(".search-detail").slideToggle();
    });

    //提单
    if ($("a#lad_all").length) {
        $("a#lad_all").click(function () {
            var cids = [];
            var stock = '';
            var valid = -2;
            $("#contract-list").find("input[name=id]:checked").each(function () {
                var row = $(this).parents("tr");
                if (row.find("input[name=depot_id]").length) {
                    var stockId = row.find("input[name=depot_id]").val();
                    if (stock == '' || stock == stockId) {
                        stock = stockId;
                        cids.push($(this).val());
                        valid = 1;
                        return true;
                    } else {
                        valid = 0;
                    }
                }
                else {
                    valid = -1;
                }
                return false;
            });

            if (valid > 0) {
                addBillOfLading(cids.join(","), 'A')
            } else if (valid == 0) {
                //$.dialog.alert("所选合同不在同一个仓库，需要分别开具提单进行提货.");
                msg = '<div class="msg">所选合同不在同一个仓库，需要分别开具提单进行提货。</div>';
                reminderDialog = ShowDialog();
            }
            else if (valid == -1) {
                //$.dialog.alert("所选的合同中有无法开提单的项.");
                msg = '<div class="msg">所选的合同中有无法开提单的项。</div>';
                reminderDialog = ShowDialog();

            } else if (valid == -2) {
                msg = '<div class="msg">您还没有选择可以开提单的合同项。</div>';
                //$.dialog.alert("您还没有选择可以开提单的合同项。");
                reminderDialog = ShowDialog();
            }
        });
    }
    //打印提单
    if ($("a#print_all").length) {
        $("a#print_all").click(function () {
            var lbid = '';
            var valid = 1;
            $("#contract-list").find("input[name=id]:checked").each(function () {
                var row = $(this).parents("tr");
                if (row.find("input[name=ladbill_id]").length) {
                    var lbillid = row.find("input[name=ladbill_id]").val();
                    if (lbid == '' || lbid == lbillid) {
                        lbid = lbillid;
                        return true;
                    } else {
                        valid = 0;
                    }
                }
                else {
                    valid = -1;
                }
                return false;
            });

            if (valid > 0) {
                window.open("/Users/Contract/PrintBillOfLading?id=" + lbid);
            } else if (valid == 0) {
                //$.dialog.alert("所选的合同不属于同一提单.");
                msg = '<div class="msg">所选的合同不属于同一提单。</div>';
                reminderDialog = ShowDialog();
            }
            else {
                //$.dialog.alert("所选的合同中有无法打印提单的项.");
                msg = '<div class="msg">所选的合同中有无法打印提单的项。</div>';
                reminderDialog = ShowDialog();
            }

        });
    }


    //付款
    if ($("a#pay_all").length) {
        $("a#pay_all").click(function () {
            var cids = [];
            $("#contract-list").find("input[name=id]:checked").each(function () {
                if ($(this).parents("tr").find("a.paythis").length)
                    cids.push($(this).val());
            });
            if (cids.length) {
                location.href = "/Pay?contractId=" + cids.join();
            } else {
                //$.dialog.alert("您选择的合同中没有待付款的项目.");
                msg = '<div class="msg">您选择的合同中没有待付款的项目。</div>';
                reminderDialog = ShowDialog();
            }
        });
    }

    initEvent();
});
var objectionDialog;
function sendObjection(contractId, status) {
    objectionDialog = $.dialog({
        title: "",
        content: "url:/Users/Contract/Objection?contractId=" + contractId + "&status=" + status + "&flag=B",
        min: false,
        max: false,
        lock: true,
        resize: false,
        fixed: true,
        close: true
        //function () {
        //location.reload();
        //}
    });
}

function resizeDialog(api) {
    //console.log(objectionDialog);
    if (objectionDialog) {
        objectionDialog.width = 200;
        objectionDialog.height = 100;
    }
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
        close: function () {
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

//开提单 重开提单
var billDialog = null;
function addBillOfLading(contractIds, type) {
    billDialog = $.dialog({
        title: "",
        lock: true,
        max: false,
        min: false,
        fixed: true,
        resize: false,
        drag: true,
        esc: false,
        content: "url:/Users/BillOfLading/AddBillOfLading?contractIds=" + contractIds + "&type=" + type,
        close: true
    });
}

function addBillOfLadingCancle() {
    billDialog.hide();
}


/*重发提单验证密码*/
var resentValidatePasswordDiaglog = null;

function resentValDialog(billLadingId) {
    var html = "";
    resentValidatePasswordDiaglog = $.dialog({
        //width: 550,
        //height: 100,
        title: "",
        lock: true,
        max: false,
        min: false,
        fixed: true,
        resize: false,
        drag: true,
        esc: false
    });

    $.ajax({
        url: '/Users/Contract/ResetValidatePassword',
        type: 'post',
        dateType: 'json',
        data: { "billOfLadingId": billLadingId },
        success: function (data) {
            if (data.result) {
                html += "<div class=\"ui-member-dialog width500\">";
                html += "<div class=\"title success \"><h3>发送成功！</h3></div>";
                html += "<div class=\"msg\">"
                html += '<p>新提单密码：<span class="tdPwd money" onclick="$(this).text(' + data.pwd + ')" style="cursor:pointer;;">显示密码</span>&nbsp;</p>';
                html += '<p>' + data.msg + '</p>';
                html += "</div>";
                html += "<div class='btns'><input type='submit' onclick='dialogClose()' value='确定'  id='btn'  class='normal-blue-button' /></div>";
                html += "</div>";

            } else {
                html += "<div class=\"ui-member-dialog width500\">";
                html += "<div class=\"title errors \"><h3><span></span>提单密码发送失败！</h3></div>";
                html += "<div class=\"msg\">" + data.msg + "</div>";
                html += "<div class='btns'><input type='submit' onclick='dialogClose()' value='确定' id='btn' class='normal-blue-button' /></div>";
                html += "</div>";

            }
            resentValidatePasswordDiaglog.content(html);
            resentValidatePasswordDiaglog.show();
        }
    });
}


function dialogClose() {
    resentValidatePasswordDiaglog.close();
    location.reload();
}

var qualityDiaglog;
/*上传质保书*/
function uploadQuality(contractId, proBillId) {
    qualityDiaglog = $.dialog({
        title: "",
        content: "url:/Users/Contract/UploadQuality?contractId=" + contractId + "&billId=" + proBillId,
        min: false,
        max: false,
        lock: true,
        resize: false,
        fixed: true,
        close: true
        //    function () {
        //    location.reload();
        //}
    });
}

//初始化图片上传组伯
function initUploadify(input, box, btnImg, imgType) {
    $("#" + input).uploadify({
        height: 80,
        swf: "/scripts/uploadify/uploadify.swf",
        uploader: "/Upload/Index",
        width: 105,
        buttonImage: "/content/images/" + btnImg + ".gif",
        formData: { "infoId": $("#Id").val(), "imgType": imgType },
        fileTypeExts: "*.jpg;*.png;*.gif;*.bmp;*.jpeg",
        fileDesc: "image files",
        rollover: false,
        onUploadSuccess: function (file, data, response) {
            if (response) {
                var html = "";
                html += "<dd class='qualityImg'>";
                html += "<img onclick=\"viewImage(this.src)\" src=\"" + data.toString() + "\" /> <a href=\"javascript:;\" class=\"delImages\" onclick=\"delUploadImage(this,'" + data.toString() + "')\">删除</a>";
                html += "</dd>";
                $("#" + box).append(html);
            }
        }
    });
}

//删除上传的图片 
function delUploadImage(obj, url, id) {
    $.post("/upload/removeFile", { "path": url }, function (data) {
        if (data) {
            $(obj).parent().remove();
        } else {
            alert(data);
        }
    });
}

//图片预览
function viewImage(src) {
    var html = "<img style='width:700px;' src='" + src + "'>";
    var $parentBody = $(window.top.document.body);
    var $container = $("#upLoadQualityView", $parentBody);
    $(".module", $parentBody).show();
    $container.html(html).show();

    drag($($container));

}

//保存质保书
function save() {
    var billId = $("#Id").val();
    var imgSrc = new Array();

    $(".qualityImg img").each(function (i, e) {
        imgSrc.push($(e).attr("src"));
    })

    if (imgSrc.length <= 0) {
        alert("请上传图片!");
    }
    else {
        var data = { "billId": billId, "imgs": imgSrc };
        $.post("/Users/Contract/UploadQualities", data, function (data) {
            //cancel();
            window.top.location.reload();
        });
    }

}

var cidtohedge;
var actionDialog;

function showhedgedialog(cid) {
    cid = cid ? cid : cidtohedge;
    if (!cid || cid == "") {
        return;
    }

    if ($("#tradePassVerified").val() == "1") {
        $.dialog({
            title: "",
            content: "url:/Users/Contract/Hedge?Ids=" + cid,
            min: false,
            max: false,
            lock: true,
            resize: false,
            fixed: true,
            close: function () {
                location.reload();
            }
        });
        cidtohedge = "";
    } else {
        cidtohedge = cid;
        enterTradePassDialog(0);
    }
}


function enterTradePassDialog(flag) {
    var html = "";
    html = "<div class=\"ui-member-dialog width500\">";
    html += "<div class=\"title\"><h3>请输入您的交易密码：</h3></div>";
    html += "<div class=\"form\" style=\"background:#fff;margin:0\">";
    html += "<div><input type=\"password\" size=\"35\" placeholder=\"在此输入交易密码\" id=\"pwd\" name=\"pwd\"/></div>";
    html += "<div class=\"btns\"><a href=\"#\" class=\"width60 \" onclick='window.top.location.reload();'>取消</a><button id=\"transferBtn\" onclick=\"TradePassVerified(" + flag + ")\" class=\"normal-blue-button\">确认</button></div>";
    html += "</div>";
    if (!actionDialog) {
        actionDialog = $.dialog({
            title: "",
            min: false,
            max: false,
            lock: true,
            resize: false,
            fixed: true,
            close: function () {
                return true;
            }
        });
    }
    actionDialog.content(html);
}

function TradePassVerified(flag) {
    var pwd = $("#pwd").val();
    if (pwd) {
        $("#transferBtn").text("验证中...");
        $.post("/account/tradePassVerified", { pwd: pwd }, function (response) {
            if (response.ret == '2') {
                window.top.location.href = "/home/warn";
            } else if (response.ret == '1') {
                $("#tradePassVerified").val("1");
                actionDialog.close();
                actionDialog = null;
                if (flag == 0) {
                    showhedgedialog();
                }
            } else {
                alert('提示：交易密码输入有误，请重新输入！');
                $("#transferBtn").text("确认");
                $("#pwd").focus();
                $("#pwd").select();
            }
        });
    }
}

function dohedge() {

    var cids = [];
    $("#crt_to_hedge").find("input[name=hcId]").each(function () {
        cids.push($(this).val());
    });
    if (cids.length <= 0) {
        cancel();
        return;
    }
    $("#btn_hedge").val("提交中...");
    $("#btn_hedge").css("cursor", "wait");
    $.post("/Users/Contract/DoHedge", { ids: cids }, function (data) {
        if (data.Summaries && data.Summaries.length) {
            for (var i = 0; i < data.Summaries.length; i++) {
                var item = data.Summaries[i]
                if (item.Success) {
                    $("#hc_" + item.ContractId).append('<span class="fontRed">对冲成功! 交收持仓 ' + item.DeliverCount + ' 手, 交收补差 ' + item.Difference + ' 元</span>');
                } else {
                    $("#hc_" + item.ContractId).append('<span class="fontRed">对冲失败，原因：' + item.FailReason + '</span>');
                }
            }
        } else if (data.msg) {
            $("div.btns").prepend('<span style="color:right;float:left;">发生错误' + data.msg + '</span>');
        }

        $("#cancel_link").hide();
        $("input.submitButton").val("关闭");
        $("#btn_hedge").css("cursor", "pointer");
        $("input.submitButton").click(function () {
            CloseDialog();
        });
    });
}

var objectionDialog;
//无异议付尾款
function noObjection(id) {
    objectionDialog = $.dialog({
        title: "",
        min: false,
        max: false,
        lock: true,
        resize: false,
        fixed: true,
        close: function () {
            return true;
        }
    });

    var html = '<div class="ui-member-dialog width500">';
    html += '<div class="title success"><h3>收货确认提示</h3></div>';
    html += '<div class="msg">您已收到货啦？点击确认一下吧。</div>';
    html += '<div class="btns">';
    html += '<a href="#" onclick="closeNoObjectDialog();">关闭</a>';
    html += '<input type="button" value="确认" onclick="postNoObject(\'' + id + '\')" class="normal-blue-button" />';
    html += '</div>';
    html += '</div>';

    objectionDialog.content(html);
}

function postNoObject(id) {
    $.post("/Users/Contract/NoObjectionAndPayment", { contractId: id }, function (data) {
        var html = '<div class="ui-member-dialog width500">';
        html += '<div class="title success"><h3>已确认收货</h3></div>';
        html += '<div class="msg">' + data.Msg + '</div>';
        html += '<div class="btns">';
        html += '<a href="javascript:window.top.location.reload();" class="normal-blue-button">关闭</a>';
        html += '</div>';
        html += '</div>';
        objectionDialog.content(html);
    });
}

function closeNoObjectDialog() {
    if (objectionDialog)
        objectionDialog.close();
}

function CloseDialog() {
    window.top.location.reload();
}

function redirectPrint(src) {
    window.top.location.reload();
    window.open($(src).attr("url"));
}

//返回时间段的前几年的时间范围
function GetDateStr(num, filter) {
    var dd = new Date();
    switch (num) {
        case "3":
            if (filter == "start") {
                return dd.getFullYear() - 1 + "-01-01";
            }
            else {
                return dd.getFullYear() - 1 + "-12-31";
            }
        case "4":
            if (filter == "start") {
                return dd.getFullYear() - 2 + "-01-01";
            }
            else {
                return dd.getFullYear() - 2 + "-12-31";
            }
        case "5":
            if (filter == "start") {
                return dd.getFullYear() - 3 + "-01-01";
            }
            else {
                return dd.getFullYear() - 3 + "-12-31";
            }
        default:
            $("#startDate").val("");
            $("#endDate").val("");
            break;
    }

    //清空所有搜索条件
    function FilterClean() {
        $("#variety option:first").prop("selected", 'selected');
        $("#material option:first").prop("selected", 'selected');
        $("#surface option:first").prop("selected", 'selected');
        $("#height option:first").prop("selected", 'selected');
        $("#factory option:first").prop("selected", 'selected');
        $("#store option:first").prop("selected", 'selected');
        $("#quickDate option:first").prop("selected", 'selected');
        $("#status option:first").prop("selected", 'selected');
        $("#objectionStatus option:first").prop("selected", 'selected');
        $("#startDate").val("");
        $("#endDate").val("");
    }
}

//提示对话框

var msg = "";
function ShowDialog() {
    reminderDialog = $.dialog({
        title: "",
        min: false,
        max: false,
        lock: true,
        resize: false,
        fixed: true,
        close: true
    });
    var htmlPre;
    var htmlAfter;
    htmlPre = '<div class="ui-member-dialog width500">';
    htmlPre += '<div class="title remind"><h3>提示</h3></div>';
    htmlAfter = '<div class="btns">';
    htmlAfter += '<a href="#" onclick="window.location.reload();" class="normal-blue-button">确认</a>';
    htmlAfter += '</div>';
    htmlAfter += '</div>';
    reminderDialog.content(htmlPre + msg + htmlAfter);
}

//作废提单
var btnConfirm;
$(function () {
    $("#btnCancleTD").click(function () {
        var ids = "";
        $("#contract-list").find("input[name=id]:checked").each(function () {
            ids += $(this).val() + ",";
        });
        if (ids.length <= 0) {
            $.dialog.alert("请选择提单！");
        }
        else {
            btnConfirm = $.dialog({
                title: "",
                min: false,
                max: false,
                lock: true,
                resize: false,
                fixed: true,
                close: function () {
                    return true;
                }
            });
            var html = '<div class="ui-member-dialog width500">';
            html += '<div class="title remind"><h3>提单作废提示</h3></div>';
            html += '<div class="msg">提单作废后，会把原来的提单信息删除，合同回归到未开提单的状态，您需要到待开提单中处理。</div>';
            html += '<div class="btns">';
            html += '<a href="#" onclick="btnConfirm.close()">取消</a>';
            html += '<input type="button" value="确认作废" onclick="postCancel(\'' + ids.substring(0, ids.length - 1) + '\')" class="normal-blue-button" />';
            html += '</div>';
            html += '</div>';

            btnConfirm.content(html);
        }
    });
})

function postCancel(ids) {
    $.post("/Users/BillOfLading/CancelTD/" + ids, function (data) {
        btnConfirm.content(data);
    });
}

function initEvent() {
    
    //查看合同明细
    $(".td-Contract").click(function () {
        window.location.href = "/Users/Contract/Detailed?ContractId=" + $(this).attr("id") + "&Type="+type+"";
    });


    //对冲合同
    if ($("a#hedge").length) {
        $("a#hedge").click(function () {
            var cids = [];
            var check = true;
            $("#contract-list").find("input[name=id]:checked").each(function () {
                var obj = $(this).parent().parent().find("a.contract_t_a");
                if (obj.length === 0) {
                    check = false;
                }
                cids.push($(this).val());
            });
            if (!check) {
                //$.dialog.alert("请选择待对冲的合同后再操作");
                msg = '<div class="msg">请选择待对冲的合同后再操作。</div>';
                reminderDialog = ShowDialog();
                return;
            }
            if (cids.length) {
                showhedgedialog(cids.join());
            }
        });
    }
    if ($("a.hedge_this").length) {
        $("a.hedge_this").click(function () {
            var cid = $(this).parents("tr").find("input[name=id]").val();
            if (cid) {
                showhedgedialog(cid);
            }

        });
    }
}

var setWeightDialog;
function setWeight(id,num,t,w,info) {
    setWeightDialog = $.dialog({
        title: "",
        content: "url:/Users/Contract/ModifyWeight?contractId=" + id + "&contractNumber=" + num + "&signDate=" + t + "&info=" + info+"&weight="+w,
        min: false,
        max: false,
        lock: true,
        resize: false,
        width:680,
        fixed: true,
        close: function () {
            return true;
        }
    });
}

function closeSetWeightDialog() {
    setWeightDialog.close();
}

function postWeight(id, weight) {
    setWeightDialog.close();
    var dialog = $.dialog({
        content: "正在修正重量，请稍候...",
        lock: true
    });

    $.post('/Users/Contract/ModifyWeight', { contractId: id, weight: weight }, function(result) {
        dialog.close();
        $.dialog.alert(result.Msg, function() {
            window.location.reload();
        });
    }).error(function() {
        dialog.close();
        $.dialog.alert("重量修改失败，请重新尝试！");
    });
}

var confirmWeightDialog;
function confirmWeight(id, status, weight, modifyWeight) {
    confirmWeightDialog = $.dialog({
        title: "",
        content: "url:/Users/Contract/ConfirmWeight?contractId=" + id + "&status=" + status + "&weight=" + weight + "&modifyWeight=" + modifyWeight,
        min: false,
        max: false,
        lock: true,
        resize: false,
        width: 680,
        fixed: true,
        close: function () {
            return true;
        }
    });
}

function postConfirmWeight(id, status, weight) {
    confirmWeightDialog.close();
    if (status !== "C") return;
    var dialog = $.dialog({
        content: "正在确认重量，请稍候...",
        lock: true
    });

    $.post('/Users/Contract/ConfirmWeight', { contractId: id, weight: weight }, function (result) {
        dialog.close();
        $.dialog.alert(result.Msg, function() {
            window.location.reload();
        });
    }).error(function () {
        dialog.close();
        $.dialog.alert("重量确认失败，请重新尝试！");
    });
}

function colseConfirmWeightDialog() {
    confirmWeightDialog.close();
}