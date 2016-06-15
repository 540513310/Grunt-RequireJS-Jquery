var dialog;
function ShowDialog() {
    var result = $.dialog({
        lock: true,
        max: false,
        min: false,
        fixed: true,
        resize: false,
        drag: true,
        esc: false,
        close:true
    });

    result.hide();
    return result;
}

var actionDialog;

function upInMoneyVoucher() {
    var url = "/Users/Fund/UploadInMoenyVoucher";
    $.get(url, function (result) {
        actionDialog.content(result);
    });
}

function upInMoneyVoucherSuccess(pic,inMoney) {
    $.post("/Users/Fund/UploadInMoenyVoucher", { image: pic,inMoney:inMoney, isBuy: true }, function (response) {
        actionDialog.content(response);
        actionDialog.show();
    });
}

function OpenTradePassVerifiedDialog(type) {
    dialog = ShowDialog();
    dialog.title("");
    var html = '';
    html = "<div class=\"ui-member-dialog width500\">";
    html += "<div class=\"title\"><h3>请输入您的交易密码：</h3></div>";
    html += "<div class=\"form\" style=\"background:#fff;margin:0\">";
    html += "<div><input type=\"password\" size=\"35\" placeholder=\"在此输入交易密码\" id=\"pwd\" name=\"pwd\"/></div>";    
    html += "<div class=\"btns\"><a href=\"#\" class=\"width60 \" onclick='CloseDialog();'>取消</a><button id=\"transferBtn\" onclick=\"TradePassVerified(this," + type + ")\" class=\"normal-blue-button\">确认</button></div>";
    html += "</div>";
    dialog.content(html);
    dialog.show();
}

function OpenDialog(obj, isTradePassVerified) {
    if (obj && $(obj).val() === "提交入金凭证") {
        actionDialog = ShowDialog();
        actionDialog.show();
        upInMoneyVoucher();
        return;
    }

    if (typeof (isTradePassVerified) !== "undefined" && !isTradePassVerified) {
        OpenTradePassVerifiedDialog(0);
        return false;
    }

    var num = $("input[name='fallMoney']").val();
    dialog = ShowDialog();
    dialog.title("");
    var html = "<div class=\"ui-member-dialog width500\">";
    html += "<div class=\"title\"><h3>资金划转</h3></div>";
    html += "<div class=\"msg\"><span></span>提示：当前所缺的资金为 <strong>" + num + "</strong>元，补足后即可购买！</div>";
    html += "<div class=\"form\">";
    html += "<p><label>划转类型：</label>订单转现货</p>";
    html += "<p><label>划转金额：</label><input type=\"text\" value=\"" + num + "\" id=\"money\" onFocus=\"this.style.color='#333'\"/> <span class=\"gary\">元</span></p></div>";
    html += "<div class=\"btns\"><a href=\"#\" class=\"width60 \" onclick='window.parent.CloseDialog();'>返回</a><button onclick=\"Transfer(this)\"  class=\"normalBlueButton\">确定划转</button></div>";    
    html += "</div>";
    html += "</div>";
    dialog.content(html);
    dialog.show();
}

function CloseInMoneyVoucherDialog() {
    location.reload();
}

function CloseDialog() {
    dialog.close();
    //location.reload();
}

function Transfer(obj) {
    if(obj){
        $(obj).prop("disabled", true);
        $(obj).css("cursor", "wait");
        $(obj).text("划转中......");
    }

    var money = parseFloat($("#money").val());
    var totalBail = parseFloat($(".totalBail").text());
    $.ajax({
        url: "/Users/Fund/TransferOnBuyer",
        data: { "money": money },
        type: "post",
        dataType: "json",
        async: true,
        cache: false,
        success: function (data) {
            var html = "";
            if (data.Code === 1) {
                if (data.Balance >= totalBail) {
                    html = "<div class=\"ui-member-dialog width500\">";
                    html += "<div class=\"title success\"><h3>资金划转成功!</h3></div>";
                    html += "<div class=\"msg\">资金已补足，购买商品所需冻结交收履约金 <strong>" + totalBail + "</strong>元</div>";
                    html += "<div class=\"btns\">";
                    html += "<a href=\"#\" onclick=\"window.top.location.reload();\">返回</a>";
                    html += "<button id=\"btn_buy2\" onclick=\"OnPost(this);\" class=\"normal-blue-button\">确认购买</button>";
                    html += "</div>";
                    html += "</div>";
                }
                else {
                    var num = accSub(totalBail, data.Balance);
                    //parseFloat($("input[name='fallMoney']").val()); //new Decimal(totalBail).minus(data.Balance);
                    html = "<div class=\"ui-member-dialog width500\">";
                    html += "<div class=\"title\"><h3>资金划转</h3></div>";
                    html += "<div class=\"msg\">提示：当前所缺的资金为 <strong>" + num + "</strong>元，补足后即可购买！</div>";
                    html += "<div class=\"form\">";
                    html += "<p><label>划转类型：</label>订单转现货</p>";
                    html += "<p><label>划转金额：</label><input type=\"text\" value=\"" + num + "\" id=\"money\"/> <span class=\"f_gary\">元</span></p></div>";
                    html += "<div class=\"btns\"><a href=\"#\" class=\"width60 \" onclick='window.top.location.reload();'>返回</a><button id=\"transferBtn\" onclick=\"Transfer(this)\" class=\"normal-blue-button\">确定划转</button></div>";
                    html += "</div>";
                }

            } else {
                html += "<div class=\"ui-member-dialog width500\">";
                html += "<div class=\"title errors\"><h3>资金划转失败!</h3></div>";
                html += "<div class=\"msg\">失败提示：" + data.Message + "</div>";
                html += "<div class=\"btns\">";
                html += "<a href=\"#\" onclick=\"window.top.location.reload();\"  class=\"normal-blue-button\">返回</a>";
                html += "</div>";
                html += "</div>";
            }
            dialog.content(html);
        }
    });
}

function TradePassVerified(obj,type) {
    var pwd = $("#pwd").val();
    if (pwd) {
        $.post("/account/tradePassVerified", { pwd: pwd }, function (response) {
            if (response.ret == '2') {
                window.top.location.href = "/home/warn";
            } else if (response.ret == '1') {
                if (type === 0) {
                    OpenDialog(undefined, true);
                }else if (type === 1) {
                    OnPost(undefined, true);
                }else if (type === 2) {
                    window.top.location.reload();
                }
            } else {
                alert('提示：交易密码输入有误，请重新输入！');
            }
        });
    }
}

function OnPost(obj, isTradePassVerified) {
    if (typeof (isTradePassVerified) !== "undefined" && !isTradePassVerified) {
        OpenTradePassVerifiedDialog(1);
        return false;
    }

    if (obj) {
        $(obj).removeAttr("onclick");
    }

    var num = parseInt($(".totalItem").text());
    if (num <= 0) {
        alert("请选择您需要购买的商品");
        return false;
    } else {
        $("#btn_buy").val("订单提交中...");
        $("#btn_buy").css("cursor", "wait");
        $("#btn_buy").prop("disabled", true);
        $("#btn_buy2").text("订单提交中...");
        $("#btn_buy2").css("cursor", "wait");
        $("#btn_buy2").prop("disabled", true);
        $("#form0").submit();
    }
}

var myBalance = 0, myHoldings = 0;
var spHoldings = [];

$(document).ready(function() {
    myBalance = $("input[name='balance']").val();
    myHoldings = $("input[name = 'buyHoldings']").val();
    CheckBuyList();
    $("input[name='goodsInforCheckBox']").bind("click", CheckBuyList);
});

function CheckBuyList() {
    spHoldings = [];
    var totalMoney = 0, totalHoldings = 0, totalBail = 0, count = 0, isCanBuy = true, isMoneyFall = false, isHoldingsFall = false, fallBail = 0, fallHoldings = 0;
    var buyBtn = $("input[value='确认购买']");
    var moneyBtn = $("input.payMoney");
    myBalance = $("input[name='balance']").val();
    myHoldings = $("input[name='buyHoldings']").val();
    $(".singleInfor").each(function (k, v) {
        var obj = $(v);
        if (!obj.hasClass("disabled") && obj.find("input[name='goodsInforCheckBox']").is(":checked")) {
            var priceType = obj.find("input[name='priceType']").val();
            var money = obj.find("input[name='payment']").val();
            var weight = obj.find("input[name='weight']").val();
            if ("A" === priceType) {
                var bail = obj.find("input[name='bail']").val();
                totalMoney = accAdd(totalMoney, money);
                totalBail = accAdd(totalBail, bail);
                if (myBalance < totalBail) {
                    obj.find(".seal").css("display", "inline-block").text("资金不足");
                    isCanBuy = false;
                    isMoneyFall = true;
                } else {
                    obj.find(".seal").css("display", "none");
                }
            } else {
                var holdings = parseInt(obj.find("input[name='holdings']").val());
                var crt_code = obj.find("input[name=crt_code]").val();
                
                if (spHoldings[crt_code]) {
                    spHoldings[crt_code] += holdings;
                } else {
                    spHoldings[crt_code] = holdings;
                }
                totalHoldings = accAdd(totalHoldings, holdings);
                totalMoney = accAdd(totalMoney, money);
                var mythisholdings = 0;
                if ($("#holding_" + crt_code).length)
                    mythisholdings = parseInt($("#holding_" + crt_code).val());
                if (mythisholdings < spHoldings[crt_code]) {
                    obj.find(".seal").css("display", "inline-block").text("持仓不足");
                    isCanBuy = false;
                    isHoldingsFall = true;
                } else {
                    obj.find(".seal").css("display", "none");
                }
            }
            count ++;
        } else {
            if (obj.hasClass("disabled")){
                obj.find(".seal").css("display", "inline-block");
            }
        }
    });
    
    $(".totalItem").text(count);
    $(".totalPayment").text(totalMoney.toFixed(2));
    if (totalBail > 0) {
        $(".totalBail").text(totalBail.toFixed(2));
        $("span.needBail").show();
    } else {
        $("span.needBail").hide();
    }
    if (totalHoldings > 0) {
        $(".freezeNums").text(totalHoldings);
        $("span.needHoldings").show();
    } else {
        $("span.needHoldings").hide();
    }

    //购买按钮
    if (isCanBuy) {
        buyBtn.prop("disabled",false);
        buyBtn.removeClass("scDisabledButton");
    } else {
        buyBtn.prop("disabled", true);
        buyBtn.addClass("scDisabledButton");
    }

    //资金按钮
    if (isMoneyFall) {
        fallBail = parseFloat(accSub(totalBail, myBalance));
        $(".lackbail").text(fallBail.toFixed(2));
        $(".lackbail").show();
        $(".fallBail").show();
        //$(".balance").show();
        $("input[name='fallMoney']").val(fallBail);
        moneyBtn.show();
        $(".balance").show();
        if (userInfo.SystemCert.indexOf('C') < 0) {
            $(".buyUploadTicket").show();
        }

    } else {
        $(".fallBail").hide();
        moneyBtn.hide();
        $(".balance").hide();
    }

    //持仓不足
    if (isHoldingsFall) {
        fallHoldings = accSub(totalHoldings, myHoldings);
        fallHoldingDesc = "";
        for (var key in spHoldings) {
            var mythisholdings = 0;
            if($("#holding_" + key).length)
                mythisholdings = parseInt($("#holding_" + key).val());

            var lease = spHoldings[key] - mythisholdings;
            if (lease > 0) {
                if (fallHoldingDesc != "")
                    fallHoldingDesc += "，"; 
                fallHoldingDesc += "(" + key + "合约) " + lease + "手";
            }
        }
        $(".lackholdings").text(fallHoldingDesc);
        $(".fallHoldings").show();
        if (userInfo.SystemCert.indexOf('C') < 0) {
            $(".noT5Roles").show();
        } else {
            $(".rf-Holding").show();
        }
    } else {
        $(".fallHoldings").hide();
        $(".rf-Holding").hide();
        $(".noT5Roles").hide();
    }

    //未选货物
    if (count === 0) {
        buyBtn.prop("disabled", true);
        buyBtn.addClass("scDisabledButton");
    }
}