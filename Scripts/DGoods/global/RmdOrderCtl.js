define(['jquery', 'jquerytmpl', 'NavibarCtl', '../utils/SysUrl', "../utils/Common",
    '../utils/SysConfig', '../viewmodel/RmdOrderViewModel'],
    function ($, jquerytmpl, NavibarCtl, SysUrl, Common, SysConfig, RmdOrderViewModel) {
        var RmdOrderCtl = function (user, requireidlst) {
            this.Currentlst = [];
            this.Current = {};
            this.LoginUser = user;
            this.RequireIdLst = requireidlst;
            //推荐商品
            this.RmdModel = new RmdOrderViewModel();
            this.RmdTemplate = $('#RmdTemplate');
            this.FollowContent = $(".follow-content");
            this.FollowNone = $(".follow-none");
            this.RmdMarkup = $(".RmdMarkup");
            this.TotalRmdOrder = $(".TotalRmdOrder");
            this.TotalLst = [];
            this.init();
            this.queryinfo();
        }

        RmdOrderCtl.prototype = {
            //初始化
            init: function () {
                var self = this;
                var navibar = new NavibarCtl(self.LoginUser);
                navibar.buildNavibar(function () { });
            },
            //查询
            queryinfo: function () {
                var self = this;
                var totalrstcount = 0;
                self.TotalLst = [];
                for (var rdindex = 0; rdindex < self.RequireIdLst.length; rdindex++) {
                    self.RmdModel.setter(self.LoginUser.DDUserId, self.RequireIdLst[rdindex]);
                    self.RmdModel.getRecommandOrder(function (rst) {
                        totalrstcount += 1;
                        if (rst.isSuccess && rst.Data.STATE == 0) {
                            if (rst.Data.DATAS.length > 0) {
                                for (var i = 0; i < rst.Data.DATAS.length; i++) {
                                    rst.Data.DATAS[i].ROWTYPE = 'even';
                                    if (i % 2 == 0) {
                                        rst.Data.DATAS[i].ROWTYPE = 'odd';
                                    }
                                    rst.Data.DATAS[i].PCTYPENAME = 'Dh';
                                    if (rst.Data.DATAS[i].PRICETYPE == "A")
                                        rst.Data.DATAS[i].PCTYPENAME = 'Sc';
                                }
                                self.TotalLst = self.TotalLst.concat(rst.Data.DATAS);
                            }
                        }
                        if (totalrstcount == self.RequireIdLst.length) {
                            var temp = [];
                            var tempid=[];
                            $.each(self.TotalLst, function (key, value) {
                                if ($.inArray(value.PROID, tempid) === -1) {
                                    temp.push(value);
                                    tempid.push(value.PROID);
                                }
                            });
                            self.TotalLst = temp;
                            self.RmdTemplate.tmpl(self.TotalLst).appendTo(".rmd-tbody");
                            self.TotalRmdOrder.text(self.TotalLst.length);
                            self.bindEvent();
                        }
                    });
                }
            },
            //事件binding
            bindEvent: function () {
                var self = this;
                if (self.TotalLst.length > 0) {
                    $(self.FollowContent).css("display", "block");
                }
                else {
                    $(self.FollowNone).css("display", "block");
                }
                $('.btn-Detail').unbind('click');
                $('.btn-Detail').click(function () {
                    var element = $(this).closest('.RmdMarkup');
                    if (typeof element != 'undefined') {
                        var id = element.attr('data-id');
                        window.open(SysUrl.getUrl("/product/detail/" + id));
                    }
                });
            },
        }
        return RmdOrderCtl;
    });