define(["jquery", "jquerytmpl", "jquerynotify", 'NavibarCtl', "../utils/SysUrl", '../utils/Common', '../utils/ModelDailog',
    "../utils/SysConfig", '../utils/ConsumeLevel', "../moduler/rs_QuoteGoods",
    "../viewmodel/Require_QuoteViewModel", "../viewmodel/QuoteGoodsViewModel",
    '../viewmodel/QuotedInfoViewModel', "../viewmodel/DismissQuoteViewModel"],
    function ($, jquerytmpl, jquerynotify, NavibarCtl, SysUrl, Common, ModelDailog, SysConfig, ConsumeLevel,
        rs_QuoteGoods, Require_QuoteViewModel, QuoteGoodsViewModel,
        QuotedInfoViewModel, DismissQuoteViewModel) {
        var QuotedCtrl = function (user, geolocation) {
            //百度gps
            this.GeoLocation = geolocation;

            //登录用户
            this.LoginUser = user;

            //报价对象
            this.QuoteGoods = function () { };
            this.QuoteGoods.prototype = rs_QuoteGoods.Req;

            //获取报价中的找货信息列表模型 2023
            this.QuotingModel = new QuotedInfoViewModel();
            this.QuotPageSize = window.SysInfo.Paging.DftPageSize;
            this.QuotPageNo = window.SysInfo.Paging.VisiblePages;

            //修改报价模型
            this.QuoteModel = new QuoteGoodsViewModel();

            //撤销求购模型
            this.DimissModel = new DismissQuoteViewModel();

            //标签
            this.tempPanel = $(".findD-none");
            this.TmplQuoteTemplate = $('#VieTemplate');
            this.QuotedPannel = $(".quote-ul");

            //总抢单中数
            this.TotalVied = 0;

            //抢单列表
            this.CurrentQuotingLst = [];
            this.CurrentQuotingID = null;
            this.CurrentQuoting = {};

            //Navivar 菜单栏位
            this.navibar = new NavibarCtl(user);

            //地址
            this.Address = { city: "无锡市", province: "江苏省", district: '' };
            //经度
            this.CurrentLt = "31.57003745";
            //纬度
            this.CurrentLg = "120.30545590";

            this.init();
        }

        QuotedCtrl.prototype = {
            init: function () {
                var self = this;
                //Redirect When the user isn't login system.
                if (typeof self.LoginUser != "object" || self.LoginUser == undefined) {
                    window.location = SysUrl.getUrl("/Account/Login?ReturnUrl=" + window.location.pathname);
                }

                self.navibar.buildNavibar(function (data) {
                    if (data.BIDDED > 0 && data.STATE == 0) {
                        self.beginQuery();
                    }
                    if (data.BIDDED == 0 || data.STATE != 0) {
                        self.tempPanel.css("display", "block");
                    }
                    else {
                        self.QuotedPannel.css("display", "block");
                    }
                    self.navibar.buildScroll();
                    //改变主菜单active状态
                    $('.TotalVied').first().closest('dd').addClass('active');
                });
                self.CurrentQuotingLst = [];
            },
            bindEvent: function () {
                var self = this;

                //GPS location定位
                $(function () {
                    var geolocation = new BMap.Geolocation();
                    self.GeoLocation.getCurrentPosition(function (r) {
                        if (this.getStatus() == BMAP_STATUS_SUCCESS) {
                            self.CurrentLt = r.latitude;
                            self.CurrentLg = r.longitude;
                            self.Address = r.address;
                        }
                        else {
                            alert('failed' + this.getStatus());
                        }
                    }, { enableHighAccuracy: true })
                });

                self.QuotedPannel.find("li").unbind("click");
                self.QuotedPannel.find("li").click(function () {
                    self.QuotedPannel.find("li").removeClass("active");
                    $(this).addClass("active");
                    //Get Current
                    self.CurrentQuotingID = $(this).attr("data-id");
                    for (var i = 0; i < self.CurrentQuotingLst.length; i++) {
                        if (self.CurrentQuotingLst[i].REQUIREID == self.CurrentQuotingID) {
                            self.CurrentQuoting = self.CurrentQuotingLst[i];
                            break;
                        }
                    }
                });

                //修改按钮
                $(".btn-Change").unbind("click");
                $(".btn-Change ").click(function () {
                    var colseSelf = $(this).closest("li");
                    $(".quote-ul li").removeClass("active");
                    colseSelf.addClass("active");
                    colseSelf.find(".quote-change").css("display", "none");
                    colseSelf.find(".quote-confirm").css("display", "block");
                    colseSelf.find(".QuotedPrice").focus();
                })

                $(".QuotedPrice").keydown(function (e) {
                    // Allow: backspace, delete, tab, escape, enter and .
                    if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
                        // Allow: Ctrl+A, Command+A
                        (e.keyCode == 65 && (e.ctrlKey === true || e.metaKey === true)) ||
                        // Allow: home, end, left, right, down, up
                        (e.keyCode >= 35 && e.keyCode <= 40)) {
                        // let it happen, don't do anything
                        return;
                    }
                    // Ensure that it is a number and stop the keypress
                    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                        $(this).notify("请输入数字", { position: "right", autoHideDelay: 1000, hideDuration: 200, className: "error" });
                        e.preventDefault();
                    }
                });


                $(".btn-Cancel").unbind("click");
                $(".btn-Cancel").click(function () {
                    var colseSelf = $(this).closest("li");
                    colseSelf.find(".quote-change").css("display", "block");
                    colseSelf.find(".quote-confirm").css("display", "none");
                })


                //修改报价
                $(".btn-Submit").unbind("click");
                $(".btn-Submit").click(function () {
                    self.quotingGoods($(this).parent());
                })

                //撤销报价
                $(".btn-Dimiss").unbind("click");
                $(".btn-Dimiss").click(function () {
                    self.DimissGoods($(this).parent());
                })

                var loading = false;
                self.TotalVied = parseInt($('.TotalVied').last().text());
                $(self.QuotedPannel).scroll(function () {
                    if (!loading && ($(self.QuotedPannel).scrollTop() > self.QuotedPannel.prop('scrollHeight') - self.QuotedPannel.height() - 20)) {
                        loading = true;
                        //如果当前加载量 小于总数量 加载
                        if (self.TotalVied - self.CurrentQuotingLst.length > 0) {
                            var html = '<li class="loadMore" style="text-align:center;' +
                                'position:absolute;bottom: 21px;width: 54.4%;z-index: 100;background: white;">信息加载中...</li>';
                            $(html).insertAfter(self.QuotedPannel.find("li").last());
                            self.QuotPageNo += 1;
                            self.beginQuery();
                            $('.loadMore').fadeOut(2000, function () {
                                //查询报价信息事件
                                $(this).remove();
                            });
                        }
                    }
                });

            },
            beginQuery: function () {
                var self = this;
                self.QuotingModel.setter(self.LoginUser.DDUserId, 'A', self.QuotPageNo, self.QuotPageSize);
                self.QuotingModel.quoteGoods(function (rst) {
                    if (rst.isSuccess == true) {
                        if (rst.Data.DATAS.length > 0) {
                            for (var i = 0; i < rst.Data.DATAS.length; i++) {
                                rst.Data.DATAS[i].ImageLst = ConsumeLevel(rst.Data.DATAS[i].BCREDIT, true);
                            }
                            //Set active record to the top.
                            rst.Data.DATAS[0].ISACTIVE = "active";
                            self.CurrentQuoting = rst.Data.DATAS[0];
                            self.CurrentQuotingLst = self.CurrentQuotingLst.concat(rst.Data.DATAS);
                            //build template
                            self.TmplQuoteTemplate.tmpl(rst.Data.DATAS).appendTo(".quote-ul");
                            self.bindEvent();
                        }
                    }
                });
            },
            quotingGoods: function (element) {
                var self = this;
                var viepanel = element.closest('.VieingMarkUp');
                var location = self.CurrentLt + ',' + self.CurrentLg + ',' +
                    '[' + self.Address.province + ',' + self.Address.city + ',' + self.Address.district + ',' + 'ADDR' + ']';
                var note = element.find('.QuotedNote').val();
                var price = parseFloat(element.find(".QuotedPrice").val());

                if (isNaN(price) == true || price.length == 0) {

                    var msg = {
                        title: "提示",
                        desc: '价格信息不正确，请检查后再发送！',
                        button: {
                            enterBtn: {
                                text: '关闭',
                            }
                        }
                    };
                    var cus = new Common.CustDialog(msg);
                    cus.showNoCertDialog();
                    return;
                }
                if (note == element.find('.QuotedNote').attr("placeholder")) {
                    note = "";
                }
                self.QuoteModel.setter(self.LoginUser.DDUserId, self.CurrentQuoting.REQUIREID, self.CurrentQuoting.OFFERID, price, 0, note, location);
                self.QuoteModel.quoteGoods(function (rst) {
                    if (rst.isSuccess == true && rst.Data.STATE == 0) {
                        if (price <= 100) {
                            price = price * 1000;
                        }
                        //诸葛io日志记录
                        Common.WriteAnalyze("抢单中-改价", { "求购类型": self.CurrentQuoting.SERIES, "报价信息": price });
                        viepanel.find('.quote-right').notify("改价成功！", { position: "left", className: "success", autoHideDelay: 1500 });
                        viepanel.find('.LbPrice').text(price);
                        viepanel.find('.LbDesc').text(note);
                        element.closest('.VieingMarkUp').slideUp("fast", function () { //Showing
                            viepanel.find('.btn-Cancel').trigger("click");
                        });
                        element.closest('.VieingMarkUp').slideDown("normal");
                    }
                });
            },
            DimissGoods: function (element) {
                var self = this;
                var msg = {
                    title: "DD找货提示",
                    desc: '您确认撤销该报价信息吗？',
                    button: {
                        cleanBtn: {
                            visable: true,
                            text: '取消',
                        },
                        enterBtn: {
                            text: '确认',
                            url: '',
                            onConfrim: function () {
                                self.DimissModel.setter(self.LoginUser.DDUserId, self.CurrentQuoting.OFFERID);
                                self.DimissModel.quotedDimmiss(function (rst) {
                                    if (rst.Data.STATE == 0) {
                                        //诸葛io日志记录
                                        Common.WriteAnalyze("抢单中-撤单", { "求购类型": self.CurrentQuoting.SERIES });
                                        $(element).notify("撤价成功！", { position: "left", className: "success", autoHideDelay: 1500 });
                                        setTimeout(function () {
                                            element.closest('.VieingMarkUp').slideUp("normal", function () {
                                                $(this).remove();
                                            });
                                            self.TotalVied -= 1;
                                            $('.TotalVied').text(self.TotalVied)
                                        }, 2000);
                                    }
                                });
                            }
                        }
                    }
                };
                var cus = new Common.CustDialog(msg);
                cus.showNoCertDialog();
            }
        }
        return QuotedCtrl;
    })