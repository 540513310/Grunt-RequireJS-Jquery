
var CtlOption = (function () {
    var OpenedWindow = new Array();

    function getchildElement() {
        var element = null;
        if (document.getElementsByClassName) {
            element = document.getElementsByClassName("Sys-SettingMenu")[0];
        }
        else {
            element = document.querySelectorAll(".Sys-SettingMenu")[0];
        }
        var childelement = element.getElementsByTagName('a');
        return childelement;
    }

    function openUrl(event) {
        var e = window.event || event;
        var target = e.target || e.srcElement;
        var url = target.getAttribute("data-url");
        var isExist = false;
        for (var i = 0; i < OpenedWindow.length; i++) {
            if (typeof OpenedWindow[i].location.pathname == "unknown") {
                OpenedWindow.splice(i, 1);
                continue;
            }
            var opendurl = OpenedWindow[i].location.pathname;
            if (opendurl) {
                if (opendurl == url) {
                    OpenedWindow[i].focus();
                    OpenedWindow[i].location.reload();
                    isExist = true;
                    break;
                }
            }
        }
        if (!isExist) {
            var winRef = window.location=url;
            OpenedWindow.push(winRef);
        }
    }

    function fireEvent(ele, event, func) {
        //for ie
        if (ele.attachEvent) {
            ele.attachEvent("on" + event, func);
        }
            //for other 
        else {
            ele.addEventListener(event, func);
        }
    }

    Start = function () {
        var childelements = getchildElement();
        for (var index = 0; index < childelements.length; index++) {
            fireEvent(childelements[index], 'click', openUrl);
        }
    },

    SetStyle = function () {
        var childelements = getchildElement();
        for (var index = 0; index < childelements.length; index++) {
            var csname = childelements[index].parentElement.className;
            childelements[index].parentElement.className = csname;
            if (childelements[index].getAttribute("data-url").indexOf(window.location.pathname) != -1) {
                childelements[index].parentElement.className += " active";
                return;
            }
        }
    }
    return {
        Start: Start,
        SetStyle: SetStyle,
    }
})();


//设置header栏位状态
function activeHeaderMenu(headerName) {
    $('.global_header-wrapper-menu-item').find('a')
        .each(function(i, item) {
            if ($(item).attr("data-url") == headerName) {
                $(item).addClass(" active");
                return;
            }
        });
}


//控制Url跳转 | active
(function (ctl) {
    ctl.Start();
    ctl.SetStyle();

})(CtlOption);