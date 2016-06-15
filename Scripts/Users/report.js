$(document).ready(function ()
{
    var lastCloseDate = $("#LastCloseDate").val();    
    if(lastCloseDate != null && typeof (lastCloseDate) != "undefined")
    {
        lastCloseDate = lastCloseDate.substr(0, 4) + "-" + lastCloseDate.substr(4, 2) + "-" + lastCloseDate.substr(6, 2);      
        $('.i-date').calendar({ format: 'yyyy-MM-dd', minDate: '2015-12-18', maxDate: lastCloseDate, noToday: true, btnBar: false });//TODO 发布正式系统需要修改这个开始时间
    }
    else
    {
        $('.i-date').calendar({ format: 'yyyy-MM-dd', minDate: '2015-12-18', maxDate: '%y-%M-%d', noToday: true, btnBar: false });
    }

    
    var loadingGif = "<img src='../../Content/Users/Images/loading.gif' />";
    var result = $("#tab1");
    //查询日对账单
    $("#btnSearch").click(function ()
    {
        var reportDate = $.trim($("#reportDate").val());
        var result = $("#tab1");
        if (reportDate == null || reportDate == "")
        {
            $('#myTab a[href="#tab1"]').tab('show')
            result.html("请选择查询日期");
            return false;
        }

        $("#btnSearch").attr("disabled", true);
        $('#myTab a[href="#tab1"]').tab('show');        
        result.html(loadingGif);

        $.ajax({
            type: 'POST',
            url: "/Users/Report/DailyReportByFirm",
            data: { "date": reportDate.replace(/-/ig, '') },
            dataType: 'json',
            success: function (data)
            {
                if (data != null && typeof (data) != "undefined")
                {
                    if(data.Result == "1")
                    {                       
                        InitTable1(data.AccountMoney[0]);  //表1
                        InitTable2(data.IOMoney); //表2
                        InitTable3(data.Buy_CRTDetails,3); //表3
                        InitTable4(data.Buy_OrderDetails,4); //表4
                        InitTable3(data.Sell_CRTDetails,5); //表5
                        InitTable4(data.Sell_OrderDetails,6); //表6
                    }
                    else
                    {
                        TableClear();
                        result.html(data.Result);
                    }                    
                }
                else
                {
                    result.html("查询失败: 没有从WebApi获取到数据！");
                }
                $("#btnSearch").attr("disabled", false);
            },
            error: function (xmlHttpRequest, textStatus, errorThrown)
            {
                $("#btnSearch").attr("disabled", false);
                result.html("网络请求失败:" + errorThrown);
            }
        });

    });

    //下载
    $("#btnDownload").click(function ()
    {
        var reportDate = $.trim($("#reportDate").val());        
        if(reportDate == null || reportDate == "")
        {
            $('#myTab a[href="#tab1"]').tab('show')
            result.html("请选择日期");
            return false;
        }
        $("#searchForm").submit();
    });
});


var noData = "无对账单数据";
function TableClear()
{
    $("#tab2").html(noData);
    $("#tab3").html(noData);
    $("#tab4").html(noData);
    $("#tab5").html(noData);
    $("#tab6").html(noData);
}

//table1
function InitTable1(data)
{
    if(data != null)
    {       
        var table = $("<table class='normal-table statement-table'></table>");
        var thead = $("<thead></thead>");
        //0
        var tr0 = $("<tr></tr>")
        tr0.append("<th class='f-gray text-align-center' width='12%'>序号</th>");
        tr0.append("<th width='35%'>资金项目</th>");
        tr0.append("<th>资金</th>");
        thead.append(tr0);
        table.append(thead);
        //1
        var tr1 = $("<tr></tr>")
        tr1.append("<td class='f-gray'>1</td>");
        tr1.append("<td>期初资金</td>");
        tr1.append("<td>" + data.YES_MONEY + "</td>");
        table.append(tr1);
        //2
        var tr2 = $("<tr class='odd'></tr>")
        tr2.append("<td class='f-gray'>2</td>");        
        if(data.SYSTEM_TYPE == "A")
        {
            tr2.append("<td>+转账至商城</td>");
        }
        else
        {
            tr2.append("<td>+订单转现货</td>");
        }        
        tr2.append("<td>" + data.DD2SCMONEY + "</td>");
        table.append(tr2);
        //3
        var tr3 = $("<tr></tr>")
        tr3.append("<td class='f-gray'>3</td>");
        if(data.SYSTEM_TYPE == "A")
        {            
            tr3.append("<td>-转账至银行</td>");
        }
        else
        {
            tr3.append("<td>-现货转订单</td>");
        }        
        tr3.append("<td>" + data.SC2DDMONEY + "</td>");
        table.append(tr3);
        //4
        var tr4 = $("<tr class='odd'></tr>")
        tr4.append("<td class='f-gray'>4</td>");
        tr4.append("<td>+货款收入</td>");
        tr4.append("<td>" + data.SETINMONEY + "</td>");
        table.append(tr4);
        //5
        var tr5 = $("<tr></tr>")
        tr5.append("<td class='f-gray'>5</td>");
        tr5.append("<td>-货款支出</td>");
        tr5.append("<td>" + data.SETOUTMONEY + "</td>");
        table.append(tr5);
        //6
        var tr6 = $("<tr class='odd'></tr>")
        tr6.append("<td class='f-gray'>6</td>");
        tr6.append("<td>+交收补差</td>");
        tr6.append("<td>" + data.SETLOSE + "</td>");
        table.append(tr6);
        //7
        var tr7 = $("<tr></tr>")
        tr7.append("<td class='f-gray'>7</td>");
        tr7.append("<td>-交收手续费</td>");
        tr7.append("<td>" + data.SETCOMM + "</td>");
        table.append(tr7);
        //8
        var tr8 = $("<tr  class='odd'></tr>")
        tr8.append("<td class='f-gray'>8</td>");
        tr8.append("<td>-违约金</td>");
        tr8.append("<td>" + data.DEFMONEY + "</td>");
        table.append(tr8);

        //9
        var tr9 = $("<tr></tr>")
        tr9.append("<td class='f-gray separator' width='40'>9</td>");
        tr9.append("<td width='15%'>+补偿金</td>");
        tr9.append("<td>" + data.REDMONEY + "</td>");
        table.append(tr9);
        //10
        var tr10 = $("<tr  class='odd'></tr>")
        tr10.append("<td class='f-gray separator'>10</td>");
        tr10.append("<td>-市场风险金</td>");
        tr10.append("<td>" + data.FXJ + "</td>");
        table.append(tr10);
        //11
        var tr11 = $("<tr></tr>")
        tr11.append("<td class='f-gray separator'>11</td>");
        tr11.append("<td>-代扣费</td>");
        tr11.append("<td>" + data.DKF + "</td>");
        table.append(tr11);
        //12
        var tr12 = $("<tr class='odd'></tr>")
        tr12.append("<td class='f-gray separator'>12</td>");
        tr12.append("<td>+其他资金</td>");
        tr12.append("<td>" + data.OTHMONEY + "</td>");
        table.append(tr12);
        //13
        var tr13 = $("<tr></tr>")
        tr13.append("<td class='f-gray separator'>13</td>");
        tr13.append("<td>期末资金</td>");
        tr13.append("<td>" + data.TDY_MONEY + "</td>");
        table.append(tr13);
        //14
        var tr14 = $("<tr  class='odd'></tr>")
        tr14.append("<td class='f-gray separator'>14</td>");
        tr14.append("<td>期末冻结</td>");
        tr14.append("<td>" + data.TDY_FZE + "</td>");
        table.append(tr14);
        //15
        var tr15 = $("<tr></tr>")
        tr15.append("<td class='f-gray separator'>15</td>");
        tr15.append("<td>可用资金</td>");
        tr15.append("<td>" + data.ENABLE_MONEY + "</td>");
        table.append(tr15);
        //16
        var tr16 = $("<tr  class='odd'></tr>")
        tr16.append("<td class='f-gray separator'>16</td>");
        tr16.append("<td>可出资金</td>");
        tr16.append("<td>" + data.ENABLEOUTMONEY + "</td>");
        table.append(tr16);
        
        $("#tab1").html(table);
    }
    else
    {
        $("#tab1").html(noData);
    }
}

//table2出入金明细表
function InitTable2(data)
{   
    if(data != null && data.length > 0)
    {
        var table = $("<table class='normal-table statement-table'></table>")
        var thead = $("<thead></thead>")
        var tr = $("<tr></tr>");
        tr.append("<th>日期</th>");
        tr.append("<th>流水号</th>");
        tr.append("<th>资金类型</th>");
        tr.append("<th>变动类型</th>");
        tr.append("<th>转入资金</th>");
        tr.append("<th>转出资金</th>");
        thead.append(tr);
        var tbody = $("<tbody></tbody>")
        var inMoney = 0;
        var outMoney = 0;
        $.each(data, function (key, value)
        {
            inMoney += Number(value.IN_MONEY);
            outMoney += Number(value.OUT_MONEY);
            var tr = $("<tr></tr>")
            tr.append("<td>" + value.CLOSE_DATE + "</td>");
            tr.append("<td>" + value.ZF_SERIAL_NO + "</td>");
            tr.append("<td>" + value.FUND_TYPE_NAME + "</td>");
            tr.append("<td>" + value.CHG_TYPE + "</td>");
            tr.append("<td>" + value.IN_MONEY + "</td>");
            tr.append("<td>" + value.OUT_MONEY + "</td>");
            tbody.append(tr);
        });

        var heji = $("<tr class='footer'></tr>")
        heji.append("<td colspan='4' class='text-right'>合计</td>");
        //heji.append("<td>" + inMoney + "</td>");
        //heji.append("<td>" + outMoney + "</td>");
        heji.append("<td class='fontRed'>" + parseFloat(inMoney).toFixed(2) + "</td>");
        heji.append("<td class='fontRed'>" + parseFloat(outMoney).toFixed(2) + "</td>");
        tbody.append(heji);
        
        table.append(thead);
        table.append(tbody);
        $("#tab2").html(table);
    }
    else
    {
        $("#tab2").html(noData);
    }
}

//table3买入合同成交明细表
function InitTable3(data,i)
{
    if(data != null && data.length > 0)
    {
        //<div style="overflow:auto;">
        var showDiv =$("<div style='overflow:auto;'></div>");

        var table = $("<table style='width:1500px;' class='normal-table statement-table'></table>")
        var thead = $("<thead></thead>")
        var tr = $("<tr></tr>");
        tr.append("<th width='100'>合同编号</th>");
        tr.append("<th>材质</th>");
        tr.append("<th>表面</th>");
        tr.append("<th>生产厂家</th>");
        tr.append("<th>厚度(参厚)</th>");
        tr.append("<th>宽度</th>");
        tr.append("<th>毛切边</th>");
        tr.append("<th>等级</th>");
        tr.append("<th>成交量</th>");
        tr.append("<th>成交方式</th>");
        tr.append("<th>商城价</th>");
        tr.append("<th>升贴水</th>");
        tr.append("<th>合同货款</th>");
        tr.append("<th>交收补差</th>");

        if(i == 3)
        {
            tr.append("<th>已付货款</th>");
        }
        else
        {
            tr.append("<th>已收货款</th>");
        }

        tr.append("<th>交收手续费</th>");
        thead.append(tr);
        var tbody = $("<tbody></tbody>")

        var TOTAL_WEIGHT = 0;
        var TOTAL_CRT_MONEY = 0;
        var JSBC = 0;
        var PAYED_MONEY = 0;
        var FEE = 0;
        $.each(data, function (key, value)
        {
            TOTAL_WEIGHT += Number(value.TOTAL_WEIGHT);
            TOTAL_CRT_MONEY += Number(value.TOTAL_CRT_MONEY);
            JSBC += Number(value.JSBC);
            PAYED_MONEY += Number(value.PAYED_MONEY);
            FEE += Number(value.FEE);

            var tr = $("<tr></tr>")
            tr.append("<td>" + value.CRT_NO + "</td>");
            tr.append("<td>" + value.QUALITY + "</td>");
            tr.append("<td>" + value.SURFACE + "</td>");
            tr.append("<td>" + value.MNFCT_NAME + "</td>");
            tr.append("<td>" + value.THICK + "(" + value.STD_THICK + ")" + "</td>");
            tr.append("<td>" + value.WIDTH + "</td>");
            tr.append("<td>" + value.EDGE + "</td>");
            tr.append("<td>" + value.GRADE + "</td>");
            tr.append("<td>" + value.TOTAL_WEIGHT + "</td>");
            tr.append("<td>" + value.PRICE_TYPE + "</td>");
            tr.append("<td>" + value.STORE_PRICE + "</td>");
            tr.append("<td>" + value.FLOAT_PRICE + "</td>");
            tr.append("<td>" + value.TOTAL_CRT_MONEY + "</td>");
            tr.append("<td>" + value.JSBC + "</td>");
            tr.append("<td>" + value.PAYED_MONEY + "</td>");
            tr.append("<td>" + value.FEE + "</td>");
            tbody.append(tr);
        });

        var heji = $("<tr class='footer'></tr>")
        heji.append("<td colspan='8' class='text-right'>合计</td>");        
        heji.append("<td class='fontRed'>" + parseFloat(TOTAL_WEIGHT).toFixed(3) + "</td>"); //成交量保留3位小数
        heji.append("<td> </td>");
        heji.append("<td> </td>");
        heji.append("<td> </td>");
        heji.append("<td class='fontRed'>" + parseFloat(TOTAL_CRT_MONEY).toFixed(2) + "</td>");
        heji.append("<td class='fontRed'>" + parseFloat(JSBC).toFixed(2) + "</td>");
        heji.append("<td class='fontRed'>" + parseFloat(PAYED_MONEY).toFixed(2) + "</td>");
        heji.append("<td class='fontRed'>" + parseFloat(FEE).toFixed(2) + "</td>");
        tbody.append(heji);
        
        table.append(thead);
        table.append(tbody);
        
        showDiv.append(table);

        if(i == 3)
        {
            $("#tab3").html(showDiv);
        }
        else
        {
            $("#tab5").html(showDiv);
        }
    }
    else
    {
        if(i == 3)
        {
            $("#tab3").html(noData);
        }
        else
        {
            $("#tab5").html(noData);
        }        
    }
}

//table4买入合同交收订单明细表
function InitTable4(data,i)
{
    if(data != null && data.length > 0)
    {
        var table = $("<table class='normal-table statement-table'></table>")
        var thead = $("<thead></thead>")
        var tr = $("<tr></tr>");
        tr.append("<th width='100'>合同编号</th>");
        tr.append("<th>成交日期</th>");
        tr.append("<th>成交编号</th>");
        tr.append("<th>会员编号</th>");
        tr.append("<th>品种代码</th>");
        tr.append("<th>买卖</th>");
        tr.append("<th>成交价(元/手)</th>");
        tr.append("<th>交收数量(手)</th>");
        tr.append("<th>交收价(元/手)</th>");
        tr.append("<th>交收补差(元)</th>");        
        thead.append(tr);
        var tbody = $("<tbody></tbody>")

        var DEAL_NUM = 0;
        var DEAL_PRICE = 0;
        var JSBC = 0;
        $.each(data, function (key, value)
        {
            DEAL_NUM += Number(value.DEAL_NUM);
            DEAL_PRICE += Number(value.DEAL_PRICE);
            JSBC += Number(value.JSBC);           

            var tr = $("<tr></tr>")
            tr.append("<td>" + value.CRT_NO + "</td>");
            tr.append("<td>" + value.DEAL_DATE + "</td>");
            tr.append("<td>" + value.DEAL_NO + "</td>");
            tr.append("<td>" + value.FIRM_ID1 + "</td>");
            tr.append("<td>" + value.ORDER_CRT_CODE + "</td>");
            tr.append("<td>" + value.BS_FLAG + "</td>");
            tr.append("<td>" + value.YTD_CLOSE_PRICE + "</td>");
            tr.append("<td>" + value.DEAL_NUM + "</td>");
            tr.append("<td>" + value.DEAL_PRICE + "</td>");
            tr.append("<td>" + value.JSBC + "</td>");
            tbody.append(tr);
        });

        var heji = $("<tr class='footer'></tr>")
        heji.append("<td colspan='7' class='text-right'>合计</td>");        
        heji.append("<td class='fontRed'>" + parseFloat(DEAL_NUM).toFixed(0) + "</td>"); //交收数量        
        heji.append("<td> </td>");
        //heji.append("<td class='fontRed'>" + parseFloat(DEAL_PRICE).toFixed(2) + "</td>");
        heji.append("<td class='fontRed'>" + parseFloat(JSBC).toFixed(2) + "</td>"); //交收补差
        tbody.append(heji);

        table.append(thead);
        table.append(tbody);

        if(i == 4)
        {
            $("#tab4").html(table);
        }
        else
        {
            $("#tab6").html(table);
        }
    }
    else
    {
        if(i == 4)
        {
            $("#tab4").html(noData);
        }
        else
        {
            $("#tab6").html(noData);
        }
        
    }

}

//卖出合同成交明细表
//卖出合同交收订单明细表
