$(function () {
    //刷新订单价
    RefreshBillPrice();

    $(".reSizePic").hide();

    $("#btnCancle").click(function () {
        $(".module").hide();
        $(".reSizePic").hide();
    })

    //缩放
    $('.reSizePic').on("mousewheel", function () {
        return big(this);
    });

    //设置货物类型
    setTypeCk();
    initData();
    //购买
    Buy();
    //加入购物车
    AddCart();
    //重量计算
    weightCounterBind();
    weightCounter();
})

//查看质保书
function viewQualities(src) {

    //浏览位置
    var option = {
        start_frame: $(src).index() + 1
    };
    myGallery2 = $('#myGallery2').galleryView(option);

    $(".module").show();
    //拖拽
    drag($("#qualitiesContainer"));
    $("#qualitiesContainer").show();
    $("#prductsContainer").hide();

    $(".gv_galleryWrap").css({ "width": "960px", "height": "610px" });

}

function weightCounterBind() {
    $('.li-Weight input').on('ifClicked', function (event) {
        var $select = $(this);
        $($select).parent().toggleClass("checked");
        weightCounter();
    });
}

function weightCounter() {
    var count = 0;
    $(".li-Weight .icheckbox_line-blue").each(function () {
        var b = $(this).hasClass("checked");
        if (b) {
            var weight = $("input", $(this)).val().split("|");
            count += parseFloat(weight[1]);
        }
    });

    $("#lbWeightSelect").text(count.toFixed(3));
}


function setTypeCk() {
    var type = $("#hdType").val();
    switch (type) {
        case 'A': $("#liOrder input").iCheck('disable'); break;
        case 'B': $("#liMall input").iCheck('disable'); break;
        default:

    }
}

function initData() {
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
}

//购买
function Buy() {
    $(".Buy").click(function () {
        if (isStockManager) {
            $.dialog.alert('您的账号没有购买权限');
            return false;
        }
        var loginFirmId = $(this).parent().find(".loginfirmId").val();
        var curFirmId = $(this).parent().find(".curFirmId").val();
        var $status = $(this).parent().find("#status");
        var statusVal = $status.val();
        var statusName = $status.attr("statusName");

        if (statusVal == "C") {
            ValidateFail("购买失败", "该货物处于" + statusName + "状态");
            return false;
        } else if (statusVal == "D") {
            if ("Y" != $("#tempsalable").val()) {
                ValidateFail("购买失败", "该货物处于" + statusName + "状态");
                return false;
            }
        }
        if (loginFirmId == curFirmId) {
            ValidateFail("购买失败", "这是您自己上传的货物，不能购买");
            return false;
        }
        var weightIds = new Array();
        var weightul = $(this).parents().find(".skin-section").find(".weights");
        weightul.find("input[type='checkbox']:checked").each(function () {
            weightIds.push($(this).val());
        })
        if (weightIds.length <= 0) {
            ValidateFail("购买失败", "请选择商品重量");
            return false;
        }
    })
}

//加入购物车
function AddCart() {
    $(".Add").click(function () {
        if (isStockManager) {
            $.dialog.alert('您的账号没有购买权限');
            return false;
        }
        var loginFirmId = $(this).parent().find(".loginfirmId").val();
        var curFirmId = $(this).parent().find(".curFirmId").val();
        var $status = $(this).parent().find("#status");
        var statusVal = $status.val();
        var statusName = $status.attr("statusName");

        if (statusVal == "C") {
            ValidateFail("加入购物车失败", "该货物处于" + statusName + "状态");
            return false;
        } else if (statusVal == "D") {
            if ("Y" != $("#tempsalable").val()) {
                ValidateFail("购买失败", "该货物处于" + statusName + "状态");
                return false;
            }
        }
        if (loginFirmId == curFirmId) {
            ValidateFail("加入购物车失败", "这是您自己上传的货物，不能加入购物车");
            return false;
        }

        var weightIds = new Array();
        var id = $(this).parent().find('input[class=ID]').val();
        var pricetypeul = $(".priceList");
        var choosePriceType = pricetypeul.find("input[type=radio]:checked").val();

        var weightul = $(this).parents().find(".skin-section").find(".weights");
        weightul.find("input[type='checkbox']:checked").each(function () {
            weightIds.push($(this).val());
        })
        if (weightIds.length <= 0) {
            ValidateFail("加入购物车失败", "请选择商品重量");
            return false;
        }
        else {
            $.post("/Cart/AddCart", { BillId: id, PriceType: choosePriceType, Weights: weightIds }, function (data) {
                if (data.ret == 0) {
                    if ($(".cart>a>.shopping>em").length)
                        $(".cart>a>.shopping>em").text(data.count);
                    AddToCart(data.count);
                }
                else {
                    alert(data.msg);
                }
            });
        }

    });
}

var validateFirmIdDialog = null;
function ValidateFail(title,msg) {
    var html = "";
    validateFirmIdDialog = ShowDialog();
    validateFirmIdDialog.title("");
    html += "<div class=\"ui-member-dialog width500\">";
    html += "<div class=\"title remind\"> <h3>" + title + "</h3>";
    html += "<div class=\"msg\"><p>" + msg + "</p></div>";
    html += "<div class=\"btns\"><a href=\"javascript:;\" class=\"normal-blue-button\" onclick=\"CloseDialog();\">返回</a>";
    html += "</div>";
    html += "</div>";
    validateFirmIdDialog.content(html);
    validateFirmIdDialog.show();
}

var cartDialog = null;
function AddToCart(count) {
    var html = "";
    cartDialog = ShowDialog();
    cartDialog.title("");
    html += "<div class=\"ui-member-dialog width500\">";
    html += "<div class=\"title success\"><h3>加入购物车成功!</h3></div>";
    html += "<div class=\"msg\">购物车已有" + count + "件商品，您可以 </div>";
    html += "<div class=\"btns\">";
    html += "<a href=\"javascript:void(0);\" onclick=\"CloseCartDialog();\">继续购物</a>";
    html += "<input type=\"button\" class=\"normal-blue-button\" value=\"购物车结算\" onclick=\"OnAddCart();\" />";
    html += "</div>";
    html += "</div>";
    cartDialog.content(html);
    cartDialog.show();
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
    validateFirmIdDialog.close();
}

function CloseCartDialog() {
    cartDialog.close();
    window.close();
}
/* 加入购物车*/
function OnAddCart() {
    location.href = "/Cart";
}

//刷新订单价
function RefreshBillPrice() {
    if ((type === 'B' || type === 'C' || type === 'B,C' || type === 'C,B')) {

        $.getJSON('/ajax/MarketPrice', { wareId: billCode }, function (data) {
            if (data.STATE === "0") {
                var billPrice = data.DATAS[0].SALPRICE1;
                if ("" === billPrice || "0" == billPrice)
                    billPrice = data.DATAS[0].NEWPRICE;
                if ("" === billPrice || "0" == billPrice)
                    billPrice = data.DATAS[0].SETPRICE;

                var gap = $("#lbPriceGap").text();
                $("#lbPriceBillCount").text(parseInt(gap) + parseInt(billPrice));
                $("#lbPriceBasic").text(billPrice);

            }
            setTimeout(RefreshBillPrice, 5000);
        });
    }
}
