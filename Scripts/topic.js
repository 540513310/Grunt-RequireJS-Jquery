var postDialog = null;

function OnBegin() {
    var result = true;

    $("input[type=text],textarea").each(function () {
        if ($(this).attr("placeholder") == $(this).val()) {
            $(this).addClass("error")
                .focus(function () {
                    $(this).removeClass("error");
            });
            result = false;
        }
    });

    return result;
}

function OnSuccess(data) {
    if (!data) {
        return;
    }
    postDialog = createDialog();
    postDialog.content(data);
    postDialog.show();
}

function closePostDialog() {
    if (postDialog) {
        postDialog.close();
    }
}

function createDialog() {
   var dialog= $.dialog({
        content: '',
        title: "",
        min: false,
        max: false,
        lock: true,
        resize: false,
        fixed: true,
        close: true
   });
   dialog.hide();
   return dialog;
}

//添加合作商
var companyDialog;
function AddCompanyInfo(type) {
    companyDialog = $.dialog({
        content: 'url:/Topic/AddCompanyInfoDialog?type=' + type,
        title: "",
        min: false,
        max: false,
        lock: true,
        resize: false,
        fixed: true,
        close: true
    });
}

function closeCompanyDialog() {
    if (companyDialog) {
        companyDialog.close();
    }
}

function AddCompanyInfoSuccess(data) {
    window.parent.companyDialog.hide();
    parent.postDialog = createDialog();
    parent.postDialog.content(data);
    parent.postDialog.show();
}
