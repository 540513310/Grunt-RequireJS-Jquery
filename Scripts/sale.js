(function () {
    var tabs = $(".saleTabs").children("ul").children("li");
    $(tabs).click(function () {
        var tab = $(this);
        var title = tab.text();
        var index = 0;
        $.each(tabs, function (k, v) {
            if ($(v).text() === title)
                index = k;
            $(v).removeClass("onTabSelected");
        });
        tab.addClass("onTabSelected");
        $(".saleInits").children("div").each(function (k, v) {
            if (k === index) {
                $(v).show();
            } else {
                $(v).hide();
            }
        });
    });

    $("div.droplist").children("input").focus(function () {
        closeDropList();
        $(this).addClass("up").removeClass("down");
        $(this).parent().children("div").show();
        $(this).css("z-index", "1");
        $(this).parent().children("div").css("z-index", "2");
    });

    initDropDownList();
    initUploadify("upProductImg", "productImgs", "btn_product_upload", "products");
    initUploadify("upQualityImg", "qualityImgs", "btn_quality_upload", "qualitys");

    $("#form0").validate({
        //errorLabelContainer: "#validateBox",
        highlight: function (element, errorClass) {
            $(element).addClass(errorClass);
            //$(element.form).find("label[for=" + element.id + "]").addClass(errorClass);
        },
        unhighlight: function (element, errorClass) {
            $(element).removeClass(errorClass);
            //$(element.form).find("label[for=" + element.id + "]").removeClass(errorClass);
        },
        errorPlacement: function(error, element) {
            //error.appendTo(element.parent("li").next("label"));
        }
    });
}());

function closeDropList() {
    $("div.droplist").children("input").addClass("down").removeClass("up");
    $("div.droplist").children("div").hide();
    $("div.droplist").children("input").css("z-index", "1");
    $("div.droplist").children("div").css("z-index", "-1");
}

function initDropDownList() {
    $("div.droplist").children("div").children("ul").children("li").children("a").bind("click", function () {
        var parent = $(this).parent().parent().parent().parent();
        var input = $(parent).children()[0];
        var lists = $(parent).children()[1];
        $(input).val($(this).text());
        $(input).addClass("down").removeClass("up");
        $(lists).hide();
    });
}

function setMaterial(id, val, surfaces) {
    $("#material").val(val);
    $("#materialId").val(id);
    var surfaceHtml = "";
    $.each(surfaces.split(","), function (k, v) {
        surfaceHtml += "<a href=\"javascript:;\" onclick=$(\"#surface\").val(\"" + v + "\")>" + v + "</a>";
    });
    $("#tab_surfaces").html(surfaceHtml);
    initTrademark(val);
}

function initTrademark(material) {
    $("#surface").val("");
    if (!$("#Trademark")) return;
    $("#Trademark").val("");
    var responseJson = $.ajax({
        url: "/Ajax/Trademarks",
        data: { "material": material},
        type: "post",
        dataType: "json",
        async: false,
        cache: false
    }).responseJSON;

    if (undefined !== responseJson && null !== responseJson && responseJson.length > 0) {
        var html = "";
        $.each(responseJson[0].Values, function (k, v) {
            html += "<li><a href=\"javascript:;\">" + v + "</a></li>";
        });
        $("#drop_Trademark").html(html);
        initDropDownList();
    }
}

function setFactory(id, val) {
    $("#ManufacturerID").val(id);
    $("#manufacturer").val(val);
}

function setStock(id, val) {
    $("#StockID").val(id);
    $("#stock").val(val);
}

function setArea(obj, areaId) {
    obj = $(obj);
    if (obj.val()) {
        $("#AreaID").val(areaId);
        switch (obj.attr("id")) {
            case "city":
                document.getElementById("region").length = 1;
                initRegion(areaId);
                break;
            case "province":
                document.getElementById("city").length = 1;
                document.getElementById("region").length = 1;
                initCity(areaId);
                break;
            default:
                break;;
        }

        refreshStock(areaId);
    }
}

function initCity(pid) {
    var data = getAreaData(pid);
    $.each(data, function (k, v) {
        $("#city").append("<option value=\"" + v.Id + "\">" + v.Name + "</option>");
    });
}

function initRegion(pid) {
    var data = getAreaData(pid);
    $.each(data, function (k, v) {
        $("#region").append("<option value=\"" + v.Id + "\">" + v.Name + "</option>");
    });
}

function getAreaData(pid) {
    var responseJson = $.ajax({
        url: "/Ajax/Areas",
        data: { "parentId": pid },
        type: "post",
        dataType: "json",
        async: false,
        cache: false
    }).responseJSON;

    return responseJson;
}

function refreshStock(areaId) {
    var responseJson = $.ajax({
        url: "/Ajax/Stocks",
        data: { "areaId": areaId, "subVarietyId": vid },
        type: "post",
        dataType: "json",
        async: false,
        cache: false
    }).responseJSON;

    if (undefined !== responseJson) {
        var html = "";
        $.each(responseJson, function (k, v) {
            html += "<a href=\"javascript:;\" onclick=\"setStock('" + v.Id + "', '" + v.Name + "')\">" + v.Name + "</a>";
        });

        $(".stocks").html(html);
    }
}
var weight = 0;
function addWeight(obj) {
    var html = "<li>";
    html += "<div class=\"btn_weight\">";
    html += "<input type=\"button\" value=\"删除\" onclick=\"removeWeight(this)\"/>";
    html += "</div>";
    html += "<span class=\"txtLeft\"><label>*</label>重量</span>";
    html += "<div class=\"weight\">";
    html += "<input type=\"text\" placeholder=\"重量\" class=\"text required number\" name=\"weight[" + (weight + 1) + "].weight\">";
    html += "<input type=\"text\" placeholder=\"卷号\" class=\"text mtop15\" name=\"weight[" + (weight + 1) + "].tag\">";
    html += "</div>";
    html += "</li>";
    $("#ls_weights").append(html);
    weight += 1;
}

function removeWeight(obj) {
    if (confirm("提示：确认要删除这条重量明细吗？")) {
        $(obj).parent().parent().remove();
    }
}

function setPostType(obj) {
    $(".selectedButton").removeClass("selectedButton").addClass("middleButton");
    obj = $(obj);
    if (obj.val() === "保证金挂单") {
        $("#Guarantee").val("A");
        obj.addClass("selectedButton").removeClass("middleButton");
    } else {
        $("#Guarantee").val("B");
        obj.addClass("selectedButton").removeClass("middleButton");
    }
}

function initUploadify(input,box,btnImg,imgType)
{
    $("#" + input).uploadify({
        height: 80,
        swf: "/scripts/uploadify/uploadify.swf",
        uploader: "/Upload/Index",
        width: 105,
        buttonImage: "/content/images/" + btnImg + ".gif",
        formData: { "sid": sid, "imgType": imgType },
        onUploadSuccess: function (file, data, response) {
            if (response) {
                var html = "";
                html += "<dd>";
                html += "<img src=\"" + data.toString() + "\" /> <br /> <a href=\"javascript:;\" onclick=\"delUploadImage(this,'"+data.toString()+"')\">删除</a>";
                html += "</dd>";
                $("#" + box).append(html);
            }
        }
    });
}

function delUploadImage(obj, url) {
    $.post("/upload/removeFile", {"path":url}, function(data) {
        if (data) {
            $(obj).parent().remove();
        } else {
            alert(data);
        }
    });
}

var dialog;
var freeze = 0;
function OnBegin() {
    $("input[type=submit]").attr("disabled", "disabled");
    dialog = ShowDialog();
    dialog.title("wating...");
    dialog.content("<h3 class='ui_loading'><img src='/Scripts/lhgcalendar/skins/icons/loading.gif' /> 挂单数据正在提交，请稍候...</h3>");
    dialog.show();
}

function OnSuccess(data) {
    $("input[type=submit]").removeAttr("disabled");
    if (data.Type === "A") {
        SaveAsResult(data);
        return;
    }

    var html = "";
    if (data.Status === "00000") {
        dialog.title("");
        html = "<div class=\"ui-member-dialog width500\">";
        html += "<div class=\"title success\"><h3>挂单成功!</h3></div>";
        html += "<div class=\"msg\">提单需要冻结少量保证金，详见《<a href=\"@Url.Action('Index','HelperCenter',new{Area =''})\" target='_blank'>挂单保证金冻结规则</a>》</div>";
        html += "<div class=\"msg freeze mtop5\">本次挂单已冻结保证金：<strong>" + data.Deposits.toFixed(2) + "</strong>元</div>";
        html += "<div class=\"btns\">";
        html += "<a href=\"javascript:;\" onclick=\"CloseDialog();\">返回</a>";
        html += "<a href=\"/Member/Sale?Status=B\">查看已挂单</a>";
        html += "<input type=\"button\" value=\"继续挂单\" onclick=\"location.reload(false);\" class=\"normal-blue-button\"/>";
        html += "</div>";
        html += "</div>";
    } else {
        dialog.title("");
        html = "<div class=\"ui-member-dialog width500\">";
        html += "<div class=\"title errors\"><h3>挂单失败!</h3></div>";
        html += "<div class=\"msg\">提单需要冻结少量保证金，详见《<a href=\"@Url.Action('Index','HelperCenter',new{Area =''})\" target='_blank'>挂单保证金冻结规则</a>》</div>";
        for (var i = 0; i < data.Messages.length; i++) {
            //console.log(data.Messages[i]);
        }
        if (data.Status.toString() === "00004") {
            if (data.Money >= 0) {
                html += "<div class=\"msg freeze mtop5\">当前帐户所缺挂单保证金为：<strong>" + (parseFloat(data.Deposits) - parseFloat(data.Money)).toFixed(2) + "</strong>元</div>";
            } else {
                html += "<div class=\"msg freeze mtop5\">当前帐户所缺挂单保证金为：<strong>" + parseFloat(data.Deposits).toFixed(2) + "</strong>元</div>";
            }
        } else {
            html += "<div class=\"msg\">系统发生未处理异常，请与客服人员联系！</div>";
        }
        html += "<div class=\"btns\">";
        html += "<a href=\"javascript:;\" onclick=\"CloseDialog();\">返回</a>";
        html += "<a href=\"javascript:;\" onclick=\"SaveAs();\">存入先挂单</a>";
        if (data.Money >= 0) {
            html += "<input type=\"button\" value=\"划转资金\" onclick=\"TransferTo(" + (parseFloat(data.Deposits) - parseFloat(data.Money)) + ");\" class=\"normal-blue-button\"/>";
        } else {
            html += "<input type=\"button\" value=\"划转资金\" onclick=\"TransferTo(" + parseFloat(data.Deposits) + ");\" class=\"normal-blue-button\"/>";
        }
        html += "</div>";
        html += "</div>";
    }

    //保存保证金金额
    freeze = data.Deposits;
    dialog.content(html);
}

function OnFailure(data) {
    $("input[type=submit]").removeAttr("disabled");
    dialog.title("");
    var html = "<div class=\"ui-member-dialog width500\">";
    html += "<div class=\"title errors\"><h3>系统发生未处理异常</h3></div>";
    html += "<div class=\"msg\">给您带来不便，敬请谅解，请稍候再试</div>";
    html += "<div class=\"msg freeze mtop5\">技术狗们正在抓紧时间修复</div>";
    html += "<div class=\"btns\">";
    html += "<a href=\"javascript:;\" onclick=\"CloseDialog();\" class=\"normal-blue-button\">返回</a>";
    html += "</div>";
    html += "</div>";
    dialog.content(html);
}

function SaveAs() {
    dialog = null;
    $("#Status").val("A");
    $("#form0").submit();
}

function SaveAsResult(data) {
    var html = "";
    if (data.Status === "00000") {
        dialog.title("");
        html += "<div class=\"ui-member-dialog width500\">";
        html += "<div class=\"title success\"><h3>存入挂单成功!</h3></div>";
        html += "<div class=\"btns\">";
        html += "<a href=\"/Member/Sale?Status=A\">查看待挂单</a>";
        html += "<input type=\"button\" value=\"继续挂单\" onclick=\"location.reload(false);\" class=\"normal-blue-button\"/>";
        html += "</div>";
        html += "</div>";
    } else {
        dialog.title("");
        html += "<div class=\"ui-member-dialog width500\">";
        html += "<div class=\"title errors\"><h3>存入挂单失败!</h3></div>";
        for (var i = 0; i < data.Messages.length; i++) {
            html += "<div class=\"msg\">" + data.Messages[i] + "</div>";
        }
        html += "<div class=\"btns\">";
        html += "<a href=\"javascript:;\" onclick=\"CloseDialog();\">返回</a>";
        html += "</div>";
        html += "</div>";
    }

    dialog.content(html);
}

function TransferTo(money) {
    dialog.title("");
    var html = "<div class=\"ui-member-dialog width500\">";
    html += "<div class=\"title\"><h3>资金划转</h3></div>";
    html += "<div class=\"msg\">提示：当前所缺的挂单保证金为：<strong>" + money.toFixed(2) + "</strong>元，补足后即可提交货品到商城上销售！</div>";
    html += "<div class=\"form\">";
    html += "<p><label>划转类型：</label>订单转现货</p>";
    html += "<p><label>划转金额：</label><input type=\"text\" value=\"" + money + "\" id=\"money\" onFocus=\"this.style.color='#333'\"/> <span class=\"f_gary\">元</span></p>";
    html += "</div>";
    html += "<div class=\"btns\"><a href=\"javascript:;\" onclick=\"CloseDialog();\">取消</a><input type=\"button\" value=\"确定划转\" onclick=\"Transfer()\" class=\"normal-blue-button\"/></div>";
    html += "</div>";
    dialog.content(html);
}

function Transfer() {
    var money = $("#money").val();
    $.ajax({
        url: "/Member/Fund/TransferDialog",
        data: { "money": money },
        type: "post",
        dataType: "json",
        async: false,
        cache: false,
        success: function (data) {
            var html = "";
            if (data.Code === 1) {
                html += "<div class=\"ui-member-dialog width500\">";
                html += "<div class=\"title success\"><h3>资金划转成功!</h3></div>";
                html += "<div class=\"msg\">您可以提交挂单了，提交后将冻结挂单保证金：<strong>" + freeze.toFixed(2) + "</strong>元</div>";
                html += "<div class=\"btns\">";
                html += "<a href=\"javascript:;\" onclick=\"CloseDialog();\">返回</a>"
                html += "<input type=\"button\" value=\"提交挂单\" onclick=\"OnPost();\" class=\"normal-blue-button\"/>";
                html += "</div>";
                html += "</div>";
            } else {
                html += "<div class=\"ui-member-dialog width500\">";
                html += "<div class=\"title errors\"><h3>资金划转失败!</h3></div>";
                html += "<div class=\"msg\">失败提示：" + data.Message + "</div>";
                html += "<div class=\"btns\">";
                html += "<a href=\"javascript:;\" onclick=\"CloseDialog();\" class=\"normal-blue-button\">返回</a>";
                html += "</div>";
                html += "</div>";
            }
            dialog.content(html);
        }
    });
}

function OnPost() {
    dialog = null;
    $("#Status").val("B");
    $("#form0").submit();
}

function ShowDialog() {
    var result = $.dialog({
        lock: true,
        max: false,
        min: false,
        fixed: true,
        resize: false,
        drag: true,
        esc:true
    });

    result.hide();
    return result;
}
function CloseDialog() {
    dialog.close();
}