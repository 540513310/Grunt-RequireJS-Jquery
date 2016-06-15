$(document).ready(function () {
    
    resetMarketPrice();

    if ($(".btn-choose-all").length) {
        $(".btn-choose-all").click(function () {
            $(this).parent().next("div.choose-all-content").toggle();
        });
    }

    $(".choose-result label.dismiss").click(function () {
        $(this).parent().next("input").remove();
        $(this).parent().remove();

        $("#search-condition-form").submit();
    });

    if ($("#sel-edge").length) {
        $("#sel-edge").change(function () {
            add_condition("edge", $(this).val());
        });

        $("#sel-level").change(function () {
            add_condition("level", $(this).val());
        });

        $("#sel-factory").change(function () {
            add_condition("factory", $(this).val());
        });

        $("#sel-city").change(function () {
            add_condition("city", $(this).val());
        });
    }

    if ($(".slideTxtBox").length) {
        //东方商城首页--搜货、获取材质
        if ($(".slideTxtBox").slide) {
            $(".slideTxtBox").slide({ trigger: "click" });
        }
        $(".slideTxtBox .hd li").click(function () {
            document.getElementById("material").length = 1;
            document.getElementById("height").length = 1;
            document.getElementById("factory").length = 1;
            document.getElementById("surface").length = 1;
            document.getElementById("width").length = 1;
            document.getElementById("city").length = 1;
            fillFormControl($(this).attr("data-categoryId"));
        });
    }

    if ($(".fullSlide").length) {
        $(".fullSlide").slide({interTime:5000, delayTime:500, titCell:".hd li", mainCell: ".bd ul",effect:"left",autoPlay:true });
    }
});

//重置商城价格
function resetMarketPrice() {
    var spans = $("span.gap");
    if (spans.length > 0) {
        $.post("/Ajax/MarketAllPrice", null, function(result) {
            $.each(spans, function(k, v) {
                var code = $(v).attr("code");
                var gap = $(v).attr("gap");

                $.each(result, function(x, y) {
                    if ("0" === y.STATE && "1" === y.MSG && code === y.WAREID) {
                        var price = y.DATAS[0].SALPRICE1;
                        if ("" === price || "0" == price)
                            price = y.DATAS[0].NEWPRICE;
                        if ("" === price||"0"==price)
                            price = y.DATAS[0].SETPRICE;

                        $(v).text(parseInt(price) + parseInt(gap));
                        try {
                            $("." + y.WAREID).text(price);
                        } catch (e) {

                        }
                    }
                });
            });
        });
    }

    setTimeout(resetMarketPrice, 5000);
}



function fillFormControl(id) {
    $.post("/Home/GetAllSearchQueries", { categoryId: id }, function (result) {
        $("input[name='vid']").val(id);
        $.each(result, function (k, v) {
            var obj = $("#" + k);
            var optionHtml = "";
            $.each(v, function (x, y) {
                if (y.Value && y.Text) {
                    if (y.Selected) {
                        optionHtml += "<option value=\"" + y.Value + "\" selected>" + y.Text + "</option>";
                    } else {
                        optionHtml += "<option value=\"" + y.Value + "\">" + y.Text + "</option>";
                    }
                }
            });
            obj.append(optionHtml);
        });
    });
}

function getSurfaces(material) {
    document.getElementById("surface").length = 1;
    $.post("/Home/GetSurfacesByMaterial", { material: material }, function (data) {
        $.each(data, function (k, v) {
            $("select[name='surface']").append("<option value='" + v + "'>" + v + "</option>");
        });
    });
}


//商城列表页--获取仓库区域、价格排序（厚度作为参考）
function getCounties(cityId) {
    document.getElementById("county").length = 1;
    if (cityId) {
        $.post("/Home/GetCountiesByCityId", { cityId: cityId }, function (data) {
            $.each(data, function (k, v) {
                $("select[name='county']").append("<option value='" + v.Id + "'>" + v.Name + "</option>");
            });
        });
    }
    getStocks(cityId, true);
}

function getStocks(areaId, flag) {
    document.getElementById("stock").length = 1;
    if (areaId) {
        $.post("/Home/GetStocksByAreaId", { areaId: areaId, flag: flag }, function (data) {
            $.each(data, function (k, v) {
                $("select[name='stock']").append("<option value='" + v.Id + "'>" + v.Name + "</option>");
            });
        });
    }
}

function setPriceOrder(isDesc) {
    if (undefined === isDesc || "" === isDesc) {
        $('#s_isDesc').val('false');
    } else {
        $('#s_isDesc').val((!isDesc).toString());
    }
    $('#s_orderBy').val('THICK');
    $('#searchForm').submit();
}

function setOrder(field, isDesc) {
    if (undefined === isDesc || "" === isDesc) {
        $('#s_isDesc').val('');
    } else {
        $('#s_isDesc').val((! isDesc).toString());
    }
    $('#s_orderBy').val(field);
    $('#searchForm').submit();
}

//搜索页--添加搜索条件
function add_condition(key, val) {
    if ($("#search-condition-form").find("input[name='" + key + "']").length) {
        $("#search-condition-form").find("input[name='" + key + "']").val(val);
    } else {
        $("#search-condition-form").append('<input type="hidden" name="' + key + '" value="' + val + '" />');
        if ("thick" == key && $("#search-condition-form").find("input[name='refthick']").length==0) {
            set_order("A");
            return;
        } else if ("refthick" == key && $("#search-condition-form").find("input[name='thick']").length==0) {
            set_order("A")
            return;
        }
    }
   
    $("#search-condition-form").submit();
}

function add_refthick_condition() {
    var thick_min = parseFloat($("#refthick-min").val());
    var thick_max = parseFloat($("#refthick-max").val());
    if (thick_min > 0) {
        if (thick_max > thick_min) {
            add_condition("refthick", thick_min + "-" + thick_max);
        } else {
            add_condition("refthick", thick_min + "<")
        }
    } else if (thick_max > 0) {
        add_condition("refthick", thick_max + ">");
    }
    else {
        $("#thick-min").focus().select();
    }
}

function add_thick_condition() {
    var thick_min = parseFloat($("#thick-min").val());
    var thick_max = parseFloat($("#thick-max").val());
    if (thick_min > 0) {
        if (thick_max > thick_min) {
            add_condition("thick", thick_min + "-" + thick_max);
        } else {
            add_condition("thick", thick_min + "<")
        }
    } else if (thick_max > 0) {
        add_condition("thick", thick_max + ">");
    }
    else {
        $("#thick-min").focus().select();
    }
}

function add_width_condition() {
    var width_min = parseFloat($("#width-min").val());
    var width_max = parseFloat($("#width-max").val());
    if (width_min > 0) {
        if (width_max > width_min) {
            add_condition("width", width_min + "-" + width_max);
        } else {
            add_condition("width",width_min+"<")
        }
    } else if (width_max > 0) {
        add_condition("width", width_max+">" );
    }
    else {
        $("#width-min").focus().select();
    }
}

function add_price_type_condition() {
    if ($("#onlyOrder").prop("checked")) {
        if ($("#onlyMall").prop("checked")) {
            add_condition("priceType", "C");
        }
        else {
            add_condition("priceType", "B");
        }
    } else {
        if ($("#onlyMall").prop("checked")) {
            add_condition("priceType", "A");
        } else {
            add_condition("priceType", "D");
        }
    }
}

function add_weight_condition() {
    var weight_min = parseFloat($("#weight-min").val());
    var weight_max = parseFloat($("#weight-max").val());
    if (weight_min > 0) {
        if (weight_max > weight_min) {
            add_condition("weight", weight_min + "-" + weight_max);
        } else {
            add_condition("weight", weight_min + "<")
        }
    } else if (weight_max > 0) {
        add_condition("weight", weight_max + ">");
    }
    else{
        $("#weight-min").focus().select();
    }
}

function set_order(order) {
    if (undefined === order || "" === order) {
        add_condition("order", "N");
    } else {
        add_condition("order", order);
    }
}