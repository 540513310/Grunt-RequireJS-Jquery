var cartDialog;
var validateFirmIdDialog;
$(function () {
    /* 初始化按钮事件*/
    InitEvent();
});


var isHoldingPrice = false;

function gotoLock() {
    isHoldingPrice = true;
}

function showDetail() {
    //查看明细
    $("#trProduct td:not(.option)").on('click', function () {
        if (!isHoldingPrice) {
            var id = $(this).parents("tr").next().next().find(".ID").val();
            window.open("/product/detail/" + id);
        }
        else {
            isHoldingPrice = false;
        }
    });
}

function InitEvent() {
    //resetMarketPrice();
    /* 订货价提示*/
    $(".td-holdingPrice").hover(function () {
        $(this).find(".explainBox").css('display', 'block');
    }, function () {
        $(this).find(".explainBox").css('display', 'none');
    });

    $("a.detail_link").click(function (event) {
        event.stopPropagation();
    });

    /*生成价格列表清单*/
    $('.skin-line input').each(function () {
        var self = $(this),
          label = self.next(),
          label_text = label.text();

        label.remove();
        self.iCheck({
            checkboxClass: 'icheckbox_line-blue',
            radioClass: 'iradio_line-blue',
            insert: '<div class="icheck_line-icon"></div>' + label_text
        });
    });

    //触发商城首页列表操作按钮执行的方法
    function listOptionButton(e) {
        if (isStockManager) {
             $.dialog.alert('您的账号没有购买权限');
            return;
        }

        if ($(e.currentTarget).val() !== '加入购物车' && !checkCert()) {
            return;
        }

        //仅有一个数量时 直接购买或加入购物车
        var weightCount = $(this).attr("count");
        if (weightCount == "1") {
            var $form=$(this).closest("tr").next().next().find("form");
            if ($(this).val() == '加入购物车') {
                $form.find(".Add").click();
            }
            else {
                $form.submit();
            }
            return;
        }
       

        $(this).hide();

        var td = $(this).closest('td');
        td.find(".actionButton").show();

        var row = td.closest('tr');
        //移除其他已展开行的选中样式
        row.siblings().removeClass('selected');
        //移除其他已展开的选择面板行
        row.siblings('.chooseWrapper').hide();
        //显示此次点击的按钮的最近的选择面板行
        row.next().next().show();
        //给所选行相关信息的三行（信息，备注，选择面板）添加选中样式
        row.addClass("selected");
        row.next().addClass("selected");
        row.next().next().addClass("selected");

        var $tr = $(this).closest("tbody").find("tr").not($(this).closest("tr"));
        $tr.find(".scCartButton").show();
        $tr.find(".scBuyButton").show();
        $tr.find(".actionButton").hide();

        var add = row.next().next().find(".Add");
        var buy = row.next().next().find(".Buy");
        //判断是加入购物车按钮
        if (($(this).val() == '加入购物车')) {
            td.find(".scBuyButton").hide();
            add.show();
            buy.hide();
        }
        //判断是购买按钮
        else {
            td.find('.scCartButton').hide();
            add.hide();
            buy.show();
        }
    }
    
    //购物车按钮触发事件
    $(".scCartButton").on("click", listOptionButton);
    //购买按钮触发事件
    $(".scBuyButton").on("click", listOptionButton);


    //收起按钮触发事件
    $(".actionButton").click(function () {
        $(this).hide();
        var td = $(this).closest('td');
        td.find(".scBuyButton").show();
        td.find(".scCartButton").show();

        var row = td.closest('tr');
        row.removeClass("selected");
        row.next().removeClass("selected");
        row.next().next().hide();

        var remarkTr = row.next();
        remarkTr.removeClass("selected");

        var expand = row.next().next().find('tr[class*=chooseWrapper]');
        expand.removeClass("selected");
        expand.slideToggle(10);
    });

    $(".Buy").click(function () {
        /*验证挂单是否属于当前用户*/
        var loginFirmId = $(this).parent().find(".loginfirmId").val();    
        var curFirmId = $(this).parent().find(".curFirmId").val();
        if (loginFirmId === curFirmId) {
            ValidateFirmId();
            return false;
        }
        var weightIds = new Array();
        var weightul = $(this).parent().parent().find(".skin").find(".skin-section").find(".weights");
        weightul.find(".putWeight:checked").each(function () {
            weightIds.push($(this).val());
        });
        if (weightIds.length <= 0) {
            showTipDialog("购买失败","请选择商品重量")
            return false;
        }
    });

    $(".Add").click(function (e) {
        /*验证挂单是否属于当前用户*/
        var loginFirmId = $(this).parent().find(".loginfirmId").val();
        var curFirmId = $(this).parent().find(".curFirmId").val();
        if (loginFirmId === curFirmId) {
            ValidateFirmId();
            return false;
        }

        var weightIds = new Array();
        var id = $(this.form).find('input[class=ID]').val();
        var choosePriceType = $(this.form).find("input[class=priceType]:checked").val();
        var weightul = $(this.form).find("input.putWeight:checked");
        weightul.each(function() {
            weightIds.push($(this).val());
        });
        if (weightIds.length <= 0) {
            showTipDialog("加入购物车失败", "请选择商品重量");
            return false;
        }
        else {
            $.post("/Cart/AddCart", {BillId:id,PriceType:choosePriceType,Weights:weightIds}, function (data) {
                if (data.ret == 0) {
                    if ($(".cart>a>.shopping>em").length)
                        $(".cart>a>.shopping>em").text(data.count);
                    AddToCart(data.count,e.currentTarget);
                }
                else {
                    alert(data.msg);
                }
            });
        }
    });

    showDetail();
}

function prepare_search() {
    if ($("#s_orderBy").val() == "") {
        if ($("input[name='height']").val() != "" || $("input[name='minRefHeight']").val() != "" || $("input[name='maxRefHeight']").val() != "") {
            $("#s_orderBy").val("THICK");
        }
    }
}


function ShowDialog() {
    var result = $.dialog({
        lock: true,
        max: false,
        min: false,
        fixed: true,
        resize: false,
        drag: true,
        esc: false
    });

    result.hide();
    return result;
}

function CloseDialog() {
    cartDialog.hide();
    //location.reload();

    if (currentRow) {
        var row = $(currentRow).parents('tr');
        row.hide();
        $("input[value='收起']").hide();
        $("input[value='加入购物车']").show();
        $("input[value='购买']").show();
    }
}

var currentRow;

function AddToCart(count, obj) {
    currentRow = obj;
    var html = "";
    cartDialog = ShowDialog();
    cartDialog.title("");
    html += "<div class=\"ui-member-dialog width500\">";
    html += "<div class=\"title success\"><h3>加入购物车成功!</h3></div>";
    html += "<div class=\"msg\">购物车已有"+count+"件商品，您可以 </div>";
    html += "<div class=\"btns\">";
    html += "<a href=\"javascript:void(0);\" onclick=\"CloseDialog();\">继续购物</a>";
    html += "<a class=\"normal-blue-button\" href=\"/cart/\" target=\"_blank\">购物车结算</a>";
    html += "</div>";
    html += "</div>";
    cartDialog.content(html);
    cartDialog.show();
}

function ValidateFirmId() {
    var html = "";
    validateFirmIdDialog = ShowDialog();
    validateFirmIdDialog.title("");
    html += "<div class=\"ui-member-dialog width500\">";
    html += "<div class=\"title errors\"><h3>购买失败！</h3>";
    html += "<div class=\"msg\">这是您自己上传的货物，不能购买</div>";
    html += "<div class=\"btns\"><a href=\"javascript:;\" class=\"normal-blue-button\" onclick=\"location.reload();\">返回</a>";
    html += "</div>";
    html += "</div>";
    validateFirmIdDialog.content(html);
    validateFirmIdDialog.show();
}

var tipDialog;
function showTipDialog(title, message) {
    tipDialog = ShowDialog();
    tipDialog.title("");
    var html = "";
    html += "<div class=\"ui-member-dialog width500\">";
    html += "<div class=\"title remind\"><h3>" + title + "</h3></div>";
    html += "<div class=\"msg\">" + message+ "</div>";
    html += "<div class=\"btns\">";
    html += "<a href=\"javascript:;\" onclick=\"closeTipDialog();\" class=\"normal-blue-button\">返回</a>";
    html += "</div>";
    html += "</div>";
    tipDialog.content(html);
    tipDialog.show();
}

function closeTipDialog() {
    tipDialog.hide();
    tipDialog.close();
}