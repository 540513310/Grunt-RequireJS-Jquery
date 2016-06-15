var specs;
$(function () {
    $(".post-sale-varieties li").click(changeCategory);
    $("#btn_AddWeigth").click(addWeight);
    $(".form-group-price").find("input[name='Guarantee']").change(function (e) {
        $("#price_type").removeClass("input-validation-error");
        var obj = $(e.currentTarget);
        $("#PriceGap").removeAttr("disabled");
        if (obj.val() === "B") {
            readOrders();
            changeDeadline();
            $("#Price").val("").attr("disabled", "disabled");
            $("[value='商城价']").attr("disabled", "disabled");
            $("[value='订货价']").addClass("priceSelected");
        } else if(obj.val() === "A") {
            $("[value='商城价']").removeAttr("disabled");
            //$("#Price").removeAttr("disabled");
            changeDeadline();
            $(".priceCounter").hide();
            if ($("input[value='订货价']").hasClass("priceSelected") && $("input[value='商城价']").hasClass("priceSelected")) {
                $("#PriceType").val("C");
            } else if ($("input[value='订货价']").hasClass("priceSelected")) {
                $("#PriceType").val("B");
            }
            else if ($("input[value='商城价']").hasClass("priceSelected")) {
                $("#PriceType").val("A");
            }
            else {
                $("#PriceType").val("");
            }
        }

        var priceGap = parseFloat($("#PriceGap").val() === "" ? 0 : $("#PriceGap").val());
        if (priceGap) {
            $("#sumPrice").text(priceGap + parseFloat($("#t5Price").text()));
        } else {
            $("#sumPrice").text(parseFloat($("#t5Price").text()));
        }
        $(".priceCounter").show();
    });
    
    $("#PriceGap").on("keyup", function (e) {
        var price = $(e.currentTarget).val();
        var t5 = $("#t5Price").text();
        if (isNaN(price) || isNaN(t5)) return;
        $("#sumPrice").text(parseFloat(price==""?0:price) + parseFloat(t5));
    });
    
    $(".btnPriceType").click(function (e) {
        var obj = $(e.currentTarget);
        if (obj.hasClass("priceSelected")) {
            obj.removeClass("priceSelected");
            if (obj.val() === "商城价") {
                $("#Price").val("");
                $("#Price").removeClass("input-validation-error");
                $("#Price").attr("disabled", "disabled");
            } else {
                $("#PriceGap").val("");
                $("#PriceGap").removeClass("input-validation-error");
                $("#PriceGap").attr("disabled", "disabled");
                $(".priceCounter").hide();
            }
        } else {
            obj.addClass("priceSelected");
            if (obj.val() === "商城价") {
                $("#Price").removeAttr("disabled");
                $("input[value='订货价']").removeClass("priceSelected");
                $("#PriceGap").attr("disabled", "disabled");
                $("#PriceGap").val("");
                $("#PriceGap").removeClass("input-validation-error");
                $(".priceCounter").hide();
            } else {
                $("input[value='商城价']").removeClass("priceSelected");
                $("#PriceGap").removeAttr("disabled");
                $("#Price").attr("disabled", "disabled");
                $("#Price").val("");
                $("#Price").removeClass("input-validation-error");
                var priceGap = parseFloat($("#PriceGap").val() === "" ? 0 : $("#PriceGap").val());
                if (priceGap) {
                    $("#sumPrice").text(priceGap + parseFloat($("#t5Price").text()));
                } else {
                    $("#sumPrice").text(parseFloat($("#t5Price").text()));
                }
                $(".priceCounter").show();
            }
        }
        var i = $(".priceSelected").length;
        $("#price_type").removeClass("input-validation-error");
        if (i === 2) {
            $("#PriceType").val("C");
        } else if (i === 0) {
            $("#PriceType").val("");
            $("#price_type").addClass("input-validation-error");
        } else {
            var val = $(".priceSelected").val();
            if (val === "商城价") {
                $("#PriceType").val("A");
            } else {
                $("#PriceType").val("B");
            }
        }

        changeDeadline();
    });
    changeDeadline();
    initCaizhi();
    initProperties();
}());

var categoryId, no,code, deadline, price;
var applyt5Dialog;
$(document).ready(function() {
    if(!isEdit){
        $("li[data-categoryid='1AD03CAB0565FFA1E050007F010079E7']").click();
    }


    if (userInfo.SystemCert.indexOf("C") < 0) {
        $("#Guarantee_B").attr("disabled", "disabled");
        $("input[value=订货价]").attr("disabled", "disabled");
        $("label[for=Guarantee_B]").click(function () {
            var t5applyState = $("#t5ApplyState").val();
            applyt5Dialog = $.dialog({
                lock: true,
                max: false,
                min: false,
                fixed: true,
                resize: false,
                drag: true,
                esc: false
            });
            applyt5Dialog.hide();
            applyt5Dialog.title("");
            var html = "";
            html += "<div id=\"applyt5dialogcontent\" class=\"ui-member-dialog width500\">";
            html += "<div class=\"title\"><h3>抱歉，您暂时无订货价挂单权限！</h3></div>";
            html += "<div class=\"msg\">订货价挂单需以订单系统的持仓作为挂货保证，您当前未开通此系统，暂无权限。 <a href=\"http://www.jsose.com\" target=\"_blank\">进入官网了解订单交易</a>或联系客服<span class=\"fontBlue\">0510-66008000</span></div>";
            if (t5applyState == "" || t5applyState == "X") {
                html += "<div class=\"msg\"><input type=\"checkbox\" id=\"agree_t5\" onchange=\"agreet5_change()\" /><label for=\"agree_t5\" style=\"font-weight:normal;color:#378CDF\">申请开通订单交易，我已阅读并同意</label><a href=\"/HelperCenter/CompanyMarketAgreement\" target=\"_blank\">《订单交易入市协议》</a></div>";
                html += "<div class=\"btns\">";
                html += "<a href=\"javascript:;\" onclick=\"hideApplyT5Dialog();\">取消</a>";
                html += '<button id="apply_t5" disabled="diasabled" class=\"sop_btn\" onclick=\"doapplyt5()\">提交申请</button>';
            } else if (t5applyState == "N") {
                html += "<div class=\"msg\"><span class=\"fontBlue\">您已提交订单交易申请，请耐心等待审核。</span></div>";
                html += "<div class=\"btns\">";
                html += '<button class=\"sop_btn\" onclick=\"hideApplyT5Dialog()\">确定</button>';
            } else if (t5applyState == "Y") {
                html += "<div class=\"msg\"><span class=\"fontBlue\">您的订单交易申请已审核通过，重新登录后生效。</span></div>";
                html += "<div class=\"btns\">";
                html += '<button class=\"sop_btn\" onclick=\"hideApplyT5Dialog()\">确定</button>';
            }
            
            html += "</div>";
            html += "</div>";
            applyt5Dialog.content(html);
            applyt5Dialog.show();
        });
    }
});

function hideApplyT5Dialog() {
    applyt5Dialog.hide();
    applyt5Dialog.close();
}

function agreet5_change() {
    if ($("#apply_t5").length) {
        $("#apply_t5").prop("disabled", !$("#agree_t5").prop("checked"));
    }
}

//切换类目
function changeCategory(e) {
    var obj = $(e.currentTarget);
    categoryId = obj.attr("data-categoryId");
    no = obj.attr('data-billNo');
    code = obj.attr("data-billCode");
    deadline = obj.attr("data-deadLine");
    price = obj.attr("data-billPrice");
    $(".post-sale-varieties li.selected").removeClass("selected");
    $("#CategoryId").val(categoryId);
    $("#CategoryName").val(obj.text());
    $("#ContractNo").val(no);
    $("#BasePrice").val(price);
    $("#ContractCode").val(code);
    $("#t5Price").text(price);
    obj.addClass("selected");
    if (categoryId === "1AD03CAB0565FFA1E050007F010079E7") {
        $("#Guarantee_B").removeAttr("disabled");
        $("input[value='订货价']").removeAttr("disabled");
        $("#Trademark").show();
    } else {
        $("#Guarantee_B").attr("disabled", "disabled");
        $("input[name='Guarantee'][value='A']").click();
        $("input[value='商城价']").addClass("priceSelected");
        $("#Price").removeAttr("disabled");
        $("#PriceType").val("A");
        $("input[value='订货价']").removeClass("priceSelected");
        $("input[value='订货价']").attr("disabled", "disabled");
        $("#PriceGap").attr("disabled", "disabled");
        $("#Trademark").hide();
    }
    initCaizhi();
    initProperties();

    try {
        if (!isEdit) {
            $("#Benchmark").val("");
            $("#Benchmark").attr("placeholder", "执行标准").attr("value", "执行标准");
            isEdit = false;
        }
    } catch (e) {
        ;
    }
}

//切换材质
function initCaizhi() {
    $.post("/Users/Sale/GetFeatures", { "categoryId": $("#CategoryId").val(), "type": "A" }, function (data) {
        if (data && data.Code.toString() === "00000" && data.Rows > 0) {
            specs = data.Data;
            document.getElementById("Material").length = 1;
            document.getElementById("Surface").length = 1;
            $.each(specs, function (k, v) {
                $("#Material").append("<option value=\"" + v.Val + "\">" + v.Val + "</option>");
            });

            if ("undefined" !== typeof product) {
                $("#Material").find("option[value='" + product.Material + "']").attr("selected", true);
                initBiaoMian(product.Material);
            }
        }
    });
}

//切换表面
function initBiaoMian(cz) {
    document.getElementById("Surface").length = 1;
    $.each(specs, function (k, v) {
        if (v.Val === cz) {
            var bm = v.Child.split(',');
            bm.sort();
            for (var i = 0; i < bm.length; i++) {
                $("#Surface").append("<option value=\"" + bm[i] + "\">" + bm[i] + "</option>");
            }
            return;
        }
    });

    if ("undefined" !== typeof product) {
        $("#Surface").find("option[value='" + product.Surface + "']").attr("selected", true);
    }
    initTrademarks(cz);
}

//选择厂商
function setManufacturer() {
    var categoryId = $("#CategoryId").val();
    $.dialog({
        title: "",
        width: 700,
        height: 450,
        min: false,
        max: false,
        lock: true,
        resize: false,
        fixed: true,
        content: "url:/Ajax/Manufacturers?categoryId=" + categoryId
    });
}

//选择仓库
function setStock() {
    var categoryId = $("#CategoryId").val();
    $.dialog({
        title: "",
        width: 700,
        height: 450,
        min: false,
        max: false,
        lock: true,
        resize: false,
        fixed: true,
        content: "url:/Ajax/Stocks?categoryId=" + categoryId
    });
}

//选择执行标准
function setBenchmark() {
    var categoryId = $("#CategoryId").val();
    $.dialog({
        title: "",
        width: 700,
        height: 450,
        min: false,
        max: false,
        lock: true,
        resize: false,
        fixed: true,
        content: "url:/Ajax/Benchmark?categoryId=" + categoryId + "&type=Standard"
    });
}

//选择牌号
function initTrademarks(material) {
    if (material) {
        $.post("/Ajax/Trademarks", { "material": material }, function (data) {
            document.getElementById("Trademark").length = 1;
            if (data && data.length > 0) {
                $.each(data[0].Values, function (k, v) {
                    $("#Trademark").append("<option value=\"" + v + "\">" + v + "</option>");
                });
                if ("undefined" !== typeof product) {
                    $("#Trademark").find("option[value='" + product.Trademark + "']").attr("selected", true);
                }

                $("#Trademark").show();
            } else {
                $("#Trademark").hide();
            }
        });
    }
}

//填充其它属性项
function initProperties() {
    $.post("/Ajax/Properties", { "categoryId": $("#CategoryId").val() }, function (data) {
        $.each(data, function (k, v) {
            initSelectListItmes(v.Category, v.Values,v.DefaultValue);
        });
    });
}

//填充属性列表项
function initSelectListItmes(id, lists, dv) {
    var obj = document.getElementById(id);
    if (obj) {
        obj.length = 1;
        $.each(lists, function (k, v) {
            if (("undefined" !== typeof product && v === product[id]) || ("undefined" === typeof product && v === dv)) {
                $("#" + id).append("<option selected value=\"" + v + "\">" + v + "</option>");
            } else {
                $("#" + id).append("<option value=\"" + v + "\">" + v + "</option>");
            }
        });
    }
}

//添加重量明细
function addWeight(e) {
    if (counter === 1) {
        //验证基础数据
        var ck = $(".base_info").find("input,select").valid();
        if (!ck) {
            $.dialog.alert("提示：基础信息录入不完整！");
            return;
        }
    }

    var html = '<li class="jsWeightBox">';
    html += '<input id="Weights_' + weights + '_SingleWeight" name="Weights[' + weights + '].SingleWeight" placeholder="重量(吨)" type="text" value=""  class="wts required number"/>';
    html += '<input  id="Weights_' + weights + '_Tag" name="Weights[' + weights + '].Tag" placeholder="卷号" type="text" value="" />';
    html += '</li>';
    html += '<li class="btnWeight btnDel jsWeightBox" onclick="removeWeight(this)">&nbsp;</li>';
    $(e.currentTarget).before(html);
    weights++;

    if (++counter > 1) {
        $(".disabled").show();
        if (counter === 2) {
            //console.log(counter);
            $("#firstBtnWeight").remove();
            $("#weights li:eq(0)").after('<li class="btnWeight btnDel jsWeightBox" onclick="removeWeight(this)">&nbsp;</li>');
        }
    }
}

//删除重量明细
function removeWeight(obj) {
    $(obj).prev().remove();
    $(obj).remove();
    if (--counter === 1) {
        $(".disabled").hide();
        $("li.btnDel").remove();
    }
}

//初始化图片上传组伯
function initUploadify(input, box, btnImg, imgType) {
    /*
    var boxObj = input === 'upProductImg' ? 'productImgs' : 'qualityImgs';
    var upBoxObj = $('#' + boxObj).find('dt');

    console.log($(upBoxObj));
    $(upBoxObj).empty();
    console.log($(upBoxObj));
    $(upBoxObj).append('<input type="file" id="' + input + '"/>');
    */

    $("#" + input).uploadify({
        height: 80,
        swf: "/scripts/uploadify/uploadify.swf",
        uploader: "/Upload/Index",
        width: 105,
        buttonImage: "/content/images/" + btnImg + ".gif",
        formData: {infoId:$("#Id").val(), "imgType": imgType },
        fileTypeExts: "*.jpg;*.png;*.gif;*.bmp;*.jpeg",
        fileDesc: "仅限图像文件",
        rollover:false,
        onUploadSuccess: function (file, data, response) {
            if (response) {
                var html = "";
                html += "<dd>";
                html += "<img onclick=\"viewImage(this.src)\" src=\"" + data.toString() + "\" /> <a href=\"javascript:;\" class=\"delImages\" onclick=\"delUploadImage(this,'" + imgType + "','" + data.toString() + "')\">删除</a>";
                html += "</dd>";
                $("#" + box).append(html);
            }
        },
        onUploadError: function (file, errorCode, errorMsg, errorString) {
            //console.log(errorString);
            $.dialog.alert("文件上传失败，请刷新浏览器后再试！");
        }
    });
}

//删除上传的图片 
function delUploadImage(obj, imgType, url) {
    $.post("/upload/removeFile", { "path": url, "imgType": imgType, infoId: $("#Id").val() }, function (data) {
        if (data) {
            $(obj).parent().remove();
        } else {
            $.dialog.alert("文件删除失败，请刷新浏览器后再试！");
        }
    });
}

var order;

//查询卖出持仓
function readOrders() {
    no = $("li.selected").attr("data-billNo");
    $("#Price").val("");
    $("[value='商城价']").removeClass("priceSelected");
    $("[value='商城价']").attr("disabled", "disabled");
    $("#Price").attr("disabled", "disabled");
    $("[value='订货价']").addClass("priceSelected");
    $("#PriceGap").removeAttr("disabled");
    $("#PriceType").val("B");
    return;
    $.post("/Users/Sale/GetOrders", { 'varietyCode': no }, function (data) {
        if (data.State === "00000" && data.list) {
            $.each(data.list, function (k, v) {
                //console.log(v);
                if (v.subVarietyId === code) {
                    order = v;
                    $("#Price").val("");
                    $("[value='商城价']").removeClass("priceSelected");
                    $("[value='商城价']").attr("disabled", "disabled");
                    $("#Price").attr("disabled", "disabled");
                    $("[value='订货价']").addClass("priceSelected");
                    $("#PriceGap").removeAttr("disabled");
                    $("#PriceType").val("B");
                    return;
                }
            });
        } else {
            order = undefined;
            $("#PriceType").val("B");
            return;
        }
    });

}

$(document).ready(function() {
    initUploadify("upProductImg", "productImgs", "btn_product_upload", "products");
    initUploadify("upQualityImg", "qualityImgs", "btn_quality_upload", "qualitys");
    $(".submit").click(save);
    $(".saveAs").click(saveAs);
});

function changeDeadline() {
    if ($("#Guarantee_B").is(":checked")) {
        var maxDate = $("li.selected").attr("data-deadLine");
        $("#Deadline").val(maxDate);
        $("#Deadline").calendar({ format: 'yyyy-MM-dd', minDate: '%y-%M-%d', maxDate: maxDate, btnBar: false });
    } else {
        $("#Deadline").val(endDate);
        $("#Deadline").calendar({ format: 'yyyy-MM-dd', minDate: '%y-%M-%d', maxDate: '2020-12-31', btnBar: false });
    }
}

//存为待挂单
function saveAs() {
    $("#Status").val("A");
    $("#form0").submit();
}

var unFreezeOrder;

//提交挂单
function save() {
    if ($("#tradePassVerified").val() == "1") {
        $("#Status").val("B");
        $("#form0").submit();
    } else {
        enterTradePassDialog();
    }
}

var actionDialog;

function createLoadingDialog() {
    return $.dialog({
        lock: true,
        max: false,
        min: false,
        fixed: true,
        resize: false,
        drag: true,
        esc: false
    });
}

function enterTradePassDialog() {
    var html = "";
    html = "<div class=\"ui-member-dialog width500\">";
    html += "<div class=\"title\"><h3>请输入您的交易密码：</h3></div>";
    html += "<div class=\"form\" style=\"background:#fff;margin:0\">";
    html += "<div><input type=\"password\" size=\"35\" placeholder=\"在此输入交易密码\" id=\"pwd\" name=\"pwd\"/></div>";    
    html += "<div class=\"btns\"><a href=\"#\" class=\"width60 \" onclick='closeEnterTradePassDialog();'>取消</a><button id=\"transferBtn\" onclick=\"TradePassVerified(this)\" class=\"normal-blue-button\">确认</button></div>";
    html += "</div>";
    actionDialog = createLoadingDialog();
    actionDialog.content(html);
}

function closeEnterTradePassDialog() {
    actionDialog.close();
}

function TradePassVerified(obj) {
    var pwd = $("#pwd").val();
    if (pwd) {
        $("#transferBtn").text("验证中...");
        $.post("/account/tradePassVerified", { pwd: pwd }, function (response) {
            if (response.ret == '2') {
                window.top.location.href = "/home/warn";
            } else if (response.ret == '1') {
                $("#tradePassVerified").val("1");
                actionDialog.close();
                save();
            } else {
                alert('提示：交易密码输入有误，请重新输入！');
                $("#transferBtn").text("确认");
                $("#pwd").focus();
                $("#pwd").select();
            }
        });
    }
}

function closeUnFreezeOrder() {
    unFreezeOrder.close();
}

//继续挂单
function onContinue() {
    resetForm();
    postDialog.close();
}

//划转资金
function transfer(money, btnObj) {
    $(btnObj).prop("disabled", true);
    var url = "/Users/Fund/FreezeTransfer?money=" + money;
    $.get(url, function(result) {
        postDialog.content(result);
    });
}

//划转资金
function postTransfer(money, obj) {
    if (obj) {
        //锁定按钮，避免重复提交，需在调用该方法时传入按钮对象
        $(obj).prop("disabled", true);
        $(obj).css("cursor", "wait");
        $(obj).text("划转中...");
    }
    var url = "/Users/Fund/TransferDialog" ;
    $.post(url, {"money": money},function (result) {
        postDialog.content(result);
    });
}

var postDialog;
//提交表单
function postBegin() {
    //console.log("begin");
    postDialog = $.dialog({
        id: $("#Id").val(),
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
    postDialog.content("<h3 class='ui_loading'><img src='/Scripts/lhgcalendar/skins/icons/loading.gif' /> 挂单数据正在提交，请稍候...</h3>");
}

function CloseDialog() {
    postDialog.close();
}

//提交成功
function postSuccess(result) {
    postDialog.content(result);
}

//提交完成
function postComplete() {
    //console.log("complete");
}

//生产GUID
function guidGenerator() {
    var s4 = function () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return (s4() + s4() +  s4() + s4() + s4() + s4() + s4() + s4());
}

//图片预览
function viewImage(src) {
    $.dialog({
        title: "",
        min: false,
        max: false,
        lock: true,
        resize: false,
        fixed: true,
        cancelVal: '关闭',
        cancel: true,
        content:"<img src=\""+src+"\" style=\"height:400px\">"
    });
}

//重置表单
function resetForm() {
    weights = 1, counter = 1;
    $("#Id").val(guidGenerator());
    $("#weights").find("input").each(function() {
        $(this).val("");
    });
    $(".jsWeightBox").each(function () {
        if ($(this).hasClass("btnWeight"))--counter;
        $(this).remove();
    });
    $("#Price").val("");
    $("#PriceGap").val("");
    $("#PriceGap").attr("disabled", "disabled");
    $("input[value='订货价']").removeClass("priceSelected");
    $(".priceCounter").hide();
    $("#Deadline").val(endDate);
    $(".disabled").hide();
    $(".form-images").find("dd").each(function () {
        $(this).remove();
    });
    //firefox 下初始化上传组件
    initUploadify("upProductImg", "productImgs", "btn_product_upload", "products");
    initUploadify("upQualityImg", "qualityImgs", "btn_quality_upload", "qualitys");
    $(".input-validation-error").each(function() {
        //console.log($(this));
    });
}

function setCalculate(type) {
    if (type === "预估磅重") {
        $("#btn_AddWeigth").hide();
    } else {
        $("#btn_AddWeigth").show();
    }
}