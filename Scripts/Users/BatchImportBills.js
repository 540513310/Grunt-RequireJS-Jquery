 $(function () {

         var uploadCkDialog;
         var ckUploadDataDialog;

         $(".categorybtn").click(function () {
             $("#cid").val($(this).attr("data-categoryId"));
             $("#chooseVariety").css("display", "none");
             $("#upload").css("display", "block");
             $("#cv").removeClass("selected");
             $("#ub").addClass("selected");

             $("#csVarietyName").text("您已选择" + $(this).val());
             $("#template").text("《" + $(this).val() + "商城价挂单模板》");
             $("#template").attr('href', "/Content/templates/" + $(this).val()+"-商城价.xlsx");
             $("#templates").text("《" + $(this).val() + "订货价/双价挂单模板》");
             $("#templates").attr('href', "/Content/templates/"+$(this).val()+"-订货价双价.xlsx");
             $("#cvName").text($(this).val() +"-商城价");

             /*初始化上传文件*/
             initUploadify();
         });

         /*上传返回*/
         $("#bcbtn").click(function () {

             /*显示选择品种 Div*/
             $("#upload").css("display", "none");
             $("#chooseVariety").css("display", "block");
             $("#confirm-import").css("display", "none");

             /*设置导航条*/
             $("#ub").removeClass("selected");
             $("#cv").addClass("selected");
             $("#ci").removeClass("selected");

             /*重置类别名称*/
             $("#csVarietyName").text("");
             /*重置文件名*/
             $("#fileName").val("");
             
             /*重置下载链接和文字*/
             $("#template").text("");
             $("#templates").text("");
             $("#template").attr("href", "");
             $("#templates").attr("href", "");


         });

         /* 预导入文件 下一步*/
           
         $("#ntbtn").click(function () {

             /*设置导航条*/
             $("#ub").removeClass("selected");
             $("#cv").removeClass("selected");
             $("#ci").addClass("selected");

             /*显示确认导入Div*/
             $("#chooseVariety").css("display", "none");
             $("#upload").css("display", "none");

             /*预导入Excel 数据*/

             var totalFiles = $("#FileUpload").data('uploadify').queueData.queueLength;
             if (totalFiles == 0) {
                 checkUploadFileDialog();
                 $("cv").removeClass("selected");
                 $("#ub").addClass("selected");
                 $("#ci").removeClass("selected");
                 $("#upload").css("display", "block");
                 $("#importresult").css("display", "none");
                 return false;
             }
             else {
                 $('#FileUpload').uploadify('upload', '*');
             }

         });


         /*确认导入 返回*/

         $("#cntbtn").click(function () {
             /*设置导航条*/
             $("#cv").removeClass("selected");
             $("#ci").removeClass("selected");
             $("#ub").addClass("selected");

             /*显示上传挂单Div*/
             $(".selected-variety").css("display", "nonen");
             $(".confirm-import").css("display", "none");
             $(".upload-order").css("display", "block");

             /*清空 导入数据*/
             $('#FileUpload').uploadify('cancel', '*');
             $(".order-infor").empty();
             $("#fileName").val("");
             $("#ckImportDatatResult").val("");

         });

         /*确认导入*/
         $("#importbtn").click(function () {
             var result = $("#ckImportDatatResult").val();
             if (result == "N") {
                 checkUploadData();
                 return false;
             }
             else
             {
                 $.ajax({
                     type: "POST",
                     url: '/Users/Sale/ImportBills',
                     dataType: 'json',
                     contentType:'application/json',
                     success: function (data) {
                         if (data.result) { 
                             window.location.href = '/Users/Sale/Index?Status=A';
                         } else
                         {
                             UploadErrorDialog();
                         }
                     },
                     error: function (error) {
                         alert("errror");
                     }
                 });
             }
         });
     })


/*检验是否上传文件*/
function checkUploadFileDialog() {
    uploadCkDialog = ShowDialog();

    var html = "<div class=\"ui-member-dialog width500\">"
                       +"<div class=\"title errors\">"
                       + "<h3>上传失败</h3>"
                       +" </div>"
                      +"<p class=\"msg\">" + "请选择你需要上传的文件" + "</p>"
                      + "<div class=\"btns\"><a href=\"#\" class=\"normal-blue-button\"  onclick= \"uploadCkDialog.hide(); \">返回</a></div>"
                      +"</div>";

    uploadCkDialog.content(html);
    uploadCkDialog.show();
}

/*导入成功*/
function UploadErrorDialog() {  
    ckUploadDataDialog = ShowDialog();
    var html = "<div class=\"ui-member-dialog width500\">" +
                "<div class=\"title errors\">" +
        "<h3>导入失败！</h3>" +
       "</div>" +
       "<p class=\"msg\">您上传的挂单导入失败，请重试</p>" +
       "<div class=\"btns\"><a href=\"#\" class=\"normal-blue-button\"  onclick= \"ckUploadDataDialog.hide(); \">返回</a></div>"
    "</div>";
    ckUploadDataDialog.content(html);
    ckUploadDataDialog.show();
}


/*检验上传数据是否符合导入要求*/
function checkUploadData() {
    ckUploadDataDialog=ShowDialog();
    var html="<div class=\"ui-member-dialog width500\">"+
                     "<div class=\"title errors\">"+
             "<h3>导入失败！</h3>"+
            "</div>"+
            "<p class=\"msg\">您上传的挂单含错误数据，无法导入，请核对修改数据再提交。</p>"+
            "<div class=\"btns\"><a href=\"#\" onclick= \"ckUploadDataDialog.hide(); \" class=\"normal-blue-button\">返回</a></div>"
    "</div>";
    ckUploadDataDialog.content(html);
    ckUploadDataDialog.show();

}

/*新建dialog*/
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
        esc: false
    });
    result.hide();
    return result;
}

/*初始化上传*/
function initUploadify() {
    $("#FileUpload").uploadify({
        height: 20,
        method: 'post',
        swf: "/scripts/uploadify/uploadify.swf",
        'uploader': '/Users/Sale/UploadBills',
        width: 40,
        buttonText:"浏览",
        formData: { "cid": $("#cid").val(), "vid": $("#vid").val() },
        fileTypeExts:'*.xlsx;*.xls',
        rollover: false,
        auto: false,
        multi: false,
        queueID: 'fileQueue',
        preventCaching:true,
        successTimeout:60,
        fileDataName:"FileUploadData",
        'onSelect': function (file) {
            $("#fileName").val(file.name);
        },
        'onUploadSuccess': function (file, data, response)
        {
            var resultData = JSON.parse(data);
            var content = resultData.content

            $(".order-infor").append(content);

            if (resultData.result) {
                $(".success").css("display", "block");
                /*验证数据成功*/
                $("#ckImportDatatResult").val("Y");
            } else {
                $(".fail").css("display", "block");
                /*验证数据失败*/
                $("#ckImportDatatResult").val("N");
            }
            $("#importresult").css("display", "block");
        }
    });
}
