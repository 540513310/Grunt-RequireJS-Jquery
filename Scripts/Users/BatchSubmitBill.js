$(document).ready(function() {
    if ($("#FileUpload")) {
        initFileUpload();
    }
    $("#importbtn").click(function () {
        var dialog = $.dialog({
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

        $.post("/Users/Sale/SaveExcelData", {}, function (data) {
            var dialogHtml = '<div class="ui-member-dialog width500">';
            if( data.Error>0 ){
                 dialogHtml += '<div class="title errors"><h3>导入失败！</h3></div>';
            }
            else {
                 dialogHtml += '<div class="title success"><h3>导入完成！</h3></div>';
                 }

            dialogHtml += '<div class="msg">您已成功提交待挂单：<label>' + data.Success + '</label>条，失败：<label>' + data.Error + '</label>条。</div>';
            dialogHtml += ' <div class="btns">';
            dialogHtml += '<a href="javascript:;" onclick="window.location.href=window.location.href">继续导入</a>';
            dialogHtml += '<a href="/Users/Sale?Status=A" class="normal-blue-button">查看待挂单</a>';
            dialogHtml += '</div>';
            dialog.content(dialogHtml);
        });
    });
});

function initFileUpload()
{
    $("#FileUpload").uploadify({
        height: 20,
        method: 'post',
        swf: "/scripts/uploadify/uploadify.swf",
        uploader: '/Users/Sale/BatchSubmitUploadFile',
        width: 40,
        buttonText: "",
        formData: {},
        fileTypeExts: '*.xlsx;*.xls',
        rollover: false,
        auto: true,
        multi: false,
        queueID: 'fileQueue',
        preventCaching: true,
        successTimeout: 60,
        fileDataName: "FileUploadData",
        onUploadSuccess: function (file, data) {
            data = $.parseJSON(data);
            $("#fileName").val(data.fileName);
            $("#localFileName").val(data.localFileName);
            $("input[type='submit']").removeAttr('disabled');
        }
    });
}