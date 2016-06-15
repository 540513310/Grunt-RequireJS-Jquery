define(["jquery"], function ($) {
    (function (window) {
        window.SysInfo = {
            VituralPath: "",
            baseApiURL: "",
            baseNodeJS: "",
            baseGuid: '6d0ed124dd7a4e57',
            Paging: { VisiblePages: 1, DftPageSize: 7 },
            Ajax: { postMethod: 'post', getMethod: 'get', },
            SeriesSupport:
            {
                Board: '^1AD03CAB0564FFA1E050007F010079E7|1AD03CAB0565FFA1E050007F010079E7|1AD03CAB0566FFA1E050007F010079E7$',
                Pipe: '^226EFD6EFB2818E5E050007F01008594$',
                Bar: "^226EFD6EFB2918E5E050007F01008594$",
            },
        }
        function getUrl(path) {
            if (!window.location.origin) {
                window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
            }
            var baseurl = window.location.origin;
            if (path.charAt(0) != '/') {
                path = '/' + path;
            }
            return baseurl + SysInfo.VituralPath + path;
        }
        $.ajax({
            'url': getUrl("/Ajax/DgoodsConfig"),
            'dataType': 'json',
            'type': 'get',
            'async': false,
            success: function (rst) {
                SysInfo.baseApiURL = rst.DDApi;
                SysInfo.baseNodeJS = rst.DDSocket;
            },
        });
    })(window);
});