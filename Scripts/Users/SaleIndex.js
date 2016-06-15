
$(function () {
    //radioButton
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
    //清空搜索条件
    $("#filterClean").click(function () {
        $(".searchMore select").each(function () {
             $(this).prop('selectedIndex', 0);
        });

        $(".searchMore .i-date").each(function () {
            $(this).val("");
        });

        $(".searchMore input[type=checkbox]").each(function () {
            var ss = $(this);
            $(this).attr("checked", false);
        });
       // $("select option:first").attr("selected", "seleted");
        //$("#variety option:first").prop("selected", 'selected');
        //$("#material option:first").prop("selected", 'selected');
        //$("#surface option:first").prop("selected", 'selected');
        //$("#height option:first").prop("selected", 'selected');
        //$("#factory option:first").prop("selected", 'selected');
        //$("#store option:first").prop("selected", 'selected');
        //$("#quickDate option:first").prop("selected", 'selected');
        //$("#status option:first").prop("selected", 'selected');
        //$("#objectionStatus option:first").prop("selected", 'selected');
        //$("#startDate").val("");
        //$("#endDate").val("");
    });

    //搜索查看更多
    $("#btnSearchToggle").on("click",function () {
        $(".searchMore").slideToggle();
    });

    $("input#ckSelectAll").change(function () {
        var checked = $(this).is(":checked");
        $("input[name=id]").each(function () {
            $(this).prop("checked", checked);
        });
    });

    if ($("input[name=id]").length) {
        $("input[name=id]").change(function () {
            if (!$(this).is(":checked")) {
                $("input#ckSelectAll").prop("checked", false);
            }
        }); 
    }


    EditePriceInit();
})

//修改单个价格
function editePrice(id, type, oldPrice) {
    setTypeCk(type);
    $("#hdIds").val(id);
    $(".moreChange").text("调整");
    $(".bg-module").show();
    $(".fixedDiv").show();
    var priceText = (type == "A" ? "商城价" : "升贴水");
    $(".initPrice").show().text("原" + priceText + "：" + oldPrice+"元")
        .css("margin-right","200px");
    $(".priceSelecte").hide();
}

//批量修改价格
function editePriceMore() {
   var ids = getCheckId();
    if (!ids) {
        alert('提示：请选择您要修改的挂单！');
        return;
    }

    var result=validateType();
    if (!result) {
        alert('提示：挂单价格类型不一致，请重选！');
        return;
    }
   
    var priceType = "A";
    $("[name='id']:checked").each(function () {
        var self = $(this).attr("pricetype");
        priceType = self;
        if (self!="C") {
            return false;
        }

    });
    if (priceType) {
        setTypeCk(priceType);
        $("#hdIds").val(ids);
        $(".bg-module").show();
        $(".fixedDiv").show();
    }

}

function validateType() {
    var result = true;

    var $ckSelected = $("[name='id']:checked");
    $($ckSelected).each(function () {
        var type = $(this).attr("priceType");

        $($ckSelected).each(function () {
            var type2 = $(this).attr("priceType");
            if ((type=="A"&&type2=="B")||(type=="B"&&type2=="A")) {
                result = false;
                return false;
            }
        });
    })

    return result;
}

function editePricePost() {
    var priceType = $(".list input[type='radio']:checked").val();
    var price = $("#btnPrice").val();
    var ids = $("#hdIds").val().split(",");
    var req = {"Ids":ids,"PriceType":priceType,"EditePrice":price};

    if (price.length<=0) {
        alert("请填写价格幅度！");
        return;
    }
    createDialog();
    $.post("/Users/Sale/BillEditePrice", req, function(data) {
        actionDialog.content(data);
    });
}

function setTypeCk(type) {
    switch (type) {
        case 'A': $("#liOrder input").iCheck('disable'); $('#liMall input').iCheck('check'); $(".priceGap").text("商城价"); break;
        case 'B': $("#liMall input").iCheck('disable'); $("#liOrder input").iCheck('check'); $(".priceGap").text("升贴水"); break;
        default:

    }
}

//修改价格
//1.取消
function hidePriceDiv() {
    $(".fixedDiv").hide();
    $(".bg-module").hide();
}


//全选
function selectAll(target) {
    var $target = $(target ? target : ".nomalTable");
    $("input[type='checkbox']", $target).each(function () {
        $(this).prop("checked", !$(this).is(":checked"));
    });

   // ckChange();
}

//选中行样式 已废除
function ckChange() {
    $(".nomalTable input[type='checkbox']").each(function () {
        var self = $(this);
        if (self.is(":checked")) {
            addSelectTrStyle(self);
        }
        else {
            removeSelectTrStyle(self);
        }
    });
}

//tr选中样式
function addSelectTrStyle(src) {
    var $tr = $(src).closest("tr");
    $tr.addClass("trSelected");
    $tr.next().addClass("trSelected");
    $tr.next().next().addClass("trSelected");
}

function removeSelectTrStyle(src) {
    var $tr = $(src).closest("tr");
    $tr.removeClass("trSelected");
    $tr.next().removeClass("trSelected");
    $tr.next().next().removeClass("trSelected");
}

//查看详细
function showDetail(src) {
    var $tr = $(src).parents("tr").hide();
    var $detail = $tr.next(".detail").show();
    //$(".nomalTable th,.nomalTable td").css("overflow", "visible");//ie bug
}

var isViewPic=false;
//收起详细
function hideDetail(src) {
    if (!isViewPic) {
        var $tr = $(src).parents("tr").hide();
        $tr.prev("tr").css({ "border-bottom": "1px solid #e6e6e6" }).show();
    }
    else {
        isViewPic = false;
    }


    //$(".nomalTable th,.nomalTable td").css("overflow", "hidden");//ie bug
}

var actionDialog;
var billIdtoCancel;

//撤消挂单
function cancel(id) {
    billIdtoCancel = id;
    id = id ? id : getCheckId();
    if (!id) {
        alert('提示：请选择您要撤消的挂单！');
        return;
    }

    if ($("#tradePassVerified").val() != "1") {
        enterTradePassDialog(1);
        return;
    }

   createDialog();
    actionDialog.content("<h3 class='ui_loading'></h3>");
    $.post('/Users/Sale/BillCancel', { 'id': id }, function(data) {
        actionDialog.content(data);
    }).error(function() {
        $.dialog.alert('系统发生未处理异常，请刷新页面后再试！');
        actionDialog.close();
        actionDialog = null;
    });
}

//删除挂单
function removeBill(id) {
    if (!confirm("提示：确定要删除挂单?")) {
        return;
    }
    id = id ? id : getCheckId();
    if (!id) {
        alert('提示：请选择您要删除的挂单！');
        return;
    }
   createDialog();
    actionDialog.content("<h3 class='ui_loading'></h3>");
    $.post('/Users/Sale/BillRemove', { 'id': id }, function (data) {
        actionDialog.content(data);
    }).error(function () {
        $.dialog.alert('系统发生未处理异常，请刷新页面后再试！');
        actionDialog.close();
        actionDialog = null;
    });
}


function CloseDialog() {
    actionDialog.close();
    actionDialog = null;
}

function save() {
    reSubmit();
}

//重新提交挂单
function reSubmit(id) {
    if (id) {
        //选择这条挂单
        if ($("input[value=" + id + "]").length) {
            $("input[value=" + id + "]").prop("checked", true);
        }
    }

    id = id ? id : getCheckId();
    if (!id) {
        alert('提示：请选择您要操作的挂单！');
        return;
    }

    if ($("#tradePassVerified").val() != "1") {
        enterTradePassDialog(0);
        return;
    }

    if (!actionDialog) createDialog();
    actionDialog.content("<h3 class='ui_loading'></h3>");
    $.post('/Users/Sale/BillReSubmit', { 'id': id }, function (data) {
        actionDialog.content(data);
    }).error(function () {
        $.dialog.alert('系统发生未处理异常，请刷新页面后再试！');
        actionDialog.close();
        actionDialog = null;
    });
}

function enterTradePassDialog(flag) {
    var html = "";
    html = "<div class=\"ui-member-dialog width500\">";
    html += "<div class=\"title\"><h3>请输入您的交易密码：</h3></div>";
    html += "<div class=\"form\" style=\"background:#fff;margin:0\">";
    html += "<div><input type=\"password\" size=\"35\" placeholder=\"在此输入交易密码\" id=\"pwd\" name=\"pwd\"/></div>";    
    html += "<div class=\"btns\"><a href=\"#\" class=\"width60 \" onclick='window.top.location.reload();'>取消</a><button id=\"transferBtn\" onclick=\"TradePassVerified("+flag+")\" class=\"normal-blue-button\">确认</button></div>";
    html += "</div>";
    if (!actionDialog)
        createDialog();
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
                    reSubmit();
                } else {
                    cancel(billIdtoCancel);
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

//划转资金
function transfer(money) {
    var url = "/Users/Fund/FreezeTransfer?money=" + money;
    $.get(url, function (result) {
        actionDialog.content(result);
    });
}

function upInMoneyVoucher() {
    var url = "/Users/Fund/UploadInMoenyVoucher";
    $.get(url, function(result) {
        actionDialog.content(result);
    });
}

function upInMoneyVoucherSuccess(pic,inMoney) {
    $.post("/Users/Fund/UploadInMoenyVoucher", { image: pic,inMoney:inMoney }, function (response) {
        actionDialog.content(response);
        actionDialog.show();
    });
}

function CloseInMoneyVoucherDialog() {
    actionDialog.close();
}

//确认划转
function postTransfer(money, obj) {
    if (obj) {
        //锁定按钮，避免重复提交，需在调用该方法时传入按钮对象
        $(obj).attr("disabled", "disabled");
    }
    var url = "/Users/Fund/TransferDialog";
    $.post(url, { "money": money }, function (result) {
        actionDialog.content(result);
    });
}

function closeReSubmitDialog() {
    actionDialog.close();
    actionDialog = null;
}

function getCheckId() {
    var result = '';
    $("[name='id']").each(function () {
        var obj = $(this);
        if (obj.is(':checked')) {
            result += $(this).val();
            result += ',';
        }
    });
    if (result.length > 0)
        result = result.substring(0, result.length - 1);
    return result;
}

function createDialog() {
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

    return actionDialog;
}

//修改价格
function EditePriceInit() {
    
    var $price=$("#btnPrice");
   
    $("#btnPriceInc").click(function () {
        var price = parseFloat($price.val().length == 0 ? 0 : $price.val());
        $price.val(price + 10);
    });

    $("#btnPriceDown").click(function () {
        var price = parseFloat($price.val().length == 0 ? 0 : $price.val());
        $price.val(price - 10);
    })

    $('.list input').on('ifClicked', function (event) {
        var $select = $(this);
        var text = $select.attr("pricetext");
        $(".priceGap").text(text);
    });

    $(".nomalTable .money span").click(function () {
        var $tr=$(this).closest("tr");
        var $ck= $tr.find("input[type = 'checkbox']");
        $tr.siblings().find("input[type = 'checkbox']").each(function () {
            $(this).prop("checked", true);
            $(this).click();
        });
        $ck.removeAttr("checked");
        $ck.click();
    })
}

function CheckInputIntFloat(obj) {
    //得到第一个字符是否为负号  
    var t = obj.value.charAt(0);
    //先把非数字的都替换掉，除了数字和.   
    obj.value = obj.value.replace(/[^\d\.]/g, '');
    //必须保证第一个为数字而不是.     
    obj.value = obj.value.replace(/^\./g, '');
    //保证只有出现一个.而没有多个.     
    obj.value = obj.value.replace(/\.{2,}/g, '.');
    //保证.只出现一次，而不能出现两次以上     
    obj.value = obj.value.replace('.', '$#$').replace(/\./g, '').replace('$#$', '.');
    //如果第一位是负号，则允许添加  
    if (t == '-') {
        obj.value = '-' + obj.value;
    }
}


    //图片浏览 遮罩层
  $(function () {
        $(".reSizePic").hide();

        $("#btnCancle").click(function () {
            $(".module").hide();
            $(".reSizePic").hide();
        })


        //缩放
        $('.reSizePic').on("mousewheel", function () {
            return big(this);
        });
  })

//查看产品
  function viewProducts(src) {
      viewLock();
      var $parent = $(src).parent().parent();
      if ($parent.find(".prductsContainer").find("img").length <= 0) {
        alert("此挂单暂无商品图片！");
        return false;
    }

    $('.myGallery', $parent).galleryView();

    $(".module").show();

    //拖拽
    drag($(".prductsContainer", $parent));

    $(".prductsContainer", $parent).show();
    $(".qualitiesContainer", $parent).hide();
}

//查看质保书
  function viewQualities(src) {
      viewLock();
       var $parent = $(src).parent().parent();
       if ($parent.find(".qualitiesContainer").find("img").length <= 0) {
           alert("此挂单暂无质保书！");
           return false;
       };

    myGallery2 = $('.myGallery2', $parent).galleryView();

    $(".module").show();
    //拖拽
    drag($(".qualitiesContainer", $parent));

    $(".qualitiesContainer", $parent).show();
    $(".prductsContainer", $parent).hide();

  }

  function viewLock() {
      isViewPic = true;
  }

//检查合同
function checkContracts(t) {
    if (t && t === 'a') {
        //待对冲合同操作
        $("input[name='id']").each(function(k, v) {
            var isChk = $(v).is(":checked");
            if (isChk) {
                //这个合同需要对冲吗？
                var obj = $(v).parent().parent().find("a.contract_t_a");
                //console.log(obj);
                if (!obj) {
                    //只要有一个不需要对冲，则操作失败，并提示用户
                    $.dialog.confirm("请选择待对冲的合同后再操作", function() {
                        window.location.reload();
                    }, function() {
                        //no action.
                    });
                }
            }
        });
    }
    return true;
}

//显示重量明细
function showListWeights(src,billId) {
    actionDialog = createDialog();
    var html = $(src).closest("td").find(".list-weights").html();
    //console.log ($(src).closest("td").html());
    actionDialog.content(html);
}
