 define(["jquery",
    "respondscreen",
    "jqueryihgcalendar",
    "jqueryihgdialog", "MainPage"],
    function ($, respondscreen,
        jqueryihgcalendar, jqueryihgdialog,MainPage) {
        "use strict";
        var init = function () {
            MainPage.init();
            MainPage.bindEvents(userInfo);
        };
        return {
            init: init
        };
    }
);