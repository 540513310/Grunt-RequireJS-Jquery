define(["jquery", "jquerytmpl", "jquerynotify", "jqueryhisotry", 'NavibarCtl',
    "../utils/SysUrl", '../utils/ModelDailog', "../utils/Common",
    "../utils/SysConfig", '../utils/ConsumeLevel', "../moduler/rs_QuoteGoods",
    "../viewmodel/Require_QuoteViewModel", "../viewmodel/QuoteGoodsViewModel",
    "../viewmodel/IgnoreRequireViewModel"],
    function ($, jquerytmpl, jquerynotify, jqueryhisotry, NavibarCtl, SysUrl, ModelDailog, Common, SysConfig, ConsumeLevel,
        rs_QuoteGoods, Require_QuoteViewModel, QuoteGoodsViewModel, IgnoreRequireViewModel) {
        var QuotedCtrl = function (user, geolocation, requireid) {
            //百度gps
            this.GeoLocation = geolocation;
            //登录用户
            this.LoginUser = user;

            //报价对象
            this.QuoteGoods = function () { };
            this.QuoteGoods.prototype = rs_QuoteGoods.Req;
            //获取报价中的找货信息列表模型 2027
            this.QuotingModel = new Require_QuoteViewModel();
            this.QuotPageSize = window.SysInfo.Paging.DftPageSize;
            this.QuotPageNo = window.SysInfo.Paging.VisiblePages;
            //报价模型
            this.QuotGoodsModel = new QuoteGoodsViewModel();
            //忽略此求购模型
            this.IngnoreGoodsModel = new IgnoreRequireViewModel();


            //标签
            this.tempPanel = $(".findD-none");
            this.TmplQuoteTemplate = $('#QuotedTemplate');
            this.QuotedPannel = $(".quote-ul");

            //总抢单中数
            this.TotalVieing = 0;

            //抢单中
            this.TotalVied = 0;

            //抢单列表
            this.CurrentQuotingLst = [];
            this.CurrentQuotingID = null;
            this.CurrentQuoting = {};
            this.CurrentListPosition = -1;

            //地址
            this.Address = { city: "无锡市", province: "江苏省", district: '' };
            //经度
            this.CurrentLt = "31.57003745";
            //纬度
            this.CurrentLg = "120.30545590";

            //第一次加载
            this.IsFirstQuery = true;

            this.IsDDUser = true;
            //Navivar 菜单栏位
            this.navibar = new NavibarCtl(user);

            if (typeof requireid != 'undefined') {
                this.CurrentQuotingID = requireid;
            }
            this.init();
        }

        QuotedCtrl.prototype = {
            init: function () {
                var self = this;
                self.navibar.isIdentify();
                self.navibar.buildNavibar(function (data) {
                    if (data.STATE != 0) {
                        self.IsDDUser = false;
                    }
                    self.beginQuery();
                    self.navibar.buildScroll();
                    //改变主菜单active状态
                    $('.TotalViening').first().closest('dd').addClass('active');
                });

                History.pushState("", "抢单- 去报价- 东方商城", "/DGoods/VieOrder/Quoted");
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
            },
            bindEvent: function () {
                var self = this;
                //Check IE 8 Place Holder
                Common.PlaceHolder();
                //----------------
                if (self.IsFirstQuery) {
                    if (self.CurrentQuotingLst.length == 0) {
                        self.tempPanel.css("display", "block");
                    }
                    else {
                        self.QuotedPannel.css("display", "block");
                    }
                }
                if (!self.IsDDUser) {
                    $('.TotalViening').text(self.CurrentQuotingLst.length);
                }
                self.IsFirstQuery = false;
                self.QuotedPannel.find("li").unbind("click");
                self.QuotedPannel.find("li").click(function () {
                    self.QuotedPannel.find("li").removeClass("active");
                    $(this).addClass("active");
                    //Get Current
                    self.CurrentQuotingID = $(this).attr("data-id");
                    for (var i = 0; i < self.CurrentQuotingLst.length; i++) {
                        if (self.CurrentQuotingLst[i].REQUIREID == self.CurrentQuotingID) {
                            self.CurrentQuoting = self.CurrentQuotingLst[i];
                            self.CurrentListPosition = i;
                            break;
                        }
                    }
                });

                //报价
                $(".btn-Quoting").unbind("click");
                $(".btn-Quoting").click(function () {
                    self.quotingGoods(this, $(this).closest('form'));
                })

                //忽略
                $(".btn-Ingnore").unbind("click");
                $(".btn-Ingnore").click(function () {
                    self.ingnoreGoods(this, $(this).closest('form'));
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


                var loading = false;
                self.TotalVieing = parseInt($('.TotalViening').last().text());
                $(self.QuotedPannel).scroll(function () {
                    if (!loading && ($(self.QuotedPannel).scrollTop() > self.QuotedPannel.prop('scrollHeight') - self.QuotedPannel.height() - 20)) {
                        loading = true;
                        //如果当前加载量 小于总数量 加载
                        if (self.TotalVieing - self.CurrentQuotingLst.length > 0) {
                            var html = '<li class="loadMore" style="text-align:center;' +
                                'position:absolute;bottom: 21px;width: 93.5%;z-index: 100;background: white;padding: 10px;">信息加载中...</li>';
                            $(html).insertAfter(self.QuotedPannel.find("li").last());
                            self.QuotPageNo += 1;
                            self.beginQuery();
                            $('.loadMore').fadeOut(2000, function () {
                                $(this).addClass("active");
                                $(this).remove();
                            });
                        }
                    }
                });


            },
            beginQuery: function () {
                var self = this;
                self.QuotingModel.setterSeries(self.LoginUser.DDUserId, '', self.QuotPageNo, self.QuotPageSize);
                self.QuotingModel.getRequiringBySeries(function (rst) {
                    if (rst.isSuccess == true) {
                        if (rst.Data.DATAS.length > 0) {
                            for (var i = 0; i < rst.Data.DATAS.length; i++) {
                                rst.Data.DATAS[i].ImageLst = ConsumeLevel(rst.Data.DATAS[i].BCREDIT, true);
                            }
                            if (self.IsFirstQuery == true) {
                                if (self.CurrentQuotingID != null) {
                                    for (var i = 0; i < rst.Data.DATAS.length; i++) {
                                        if (rst.Data.DATAS[i].REQUIREID == self.CurrentQuotingID) {
                                            var data = rst.Data.DATAS[i];
                                            rst.Data.DATAS[i] = rst.Data.DATAS[0];
                                            rst.Data.DATAS[0] = data;
                                            break;
                                        }
                                    }
                                }
                                //Set active record to the top.
                                rst.Data.DATAS[0].ISACTIVE = "active";
                                self.CurrentQuoting = rst.Data.DATAS[0];
                            }
                            self.CurrentQuotingLst = self.CurrentQuotingLst.concat(rst.Data.DATAS);
                            //build template
                            self.TmplQuoteTemplate.tmpl(rst.Data.DATAS).appendTo(".quote-ul");
                        }
                        self.bindEvent();
                    }
                });
            },
            quotingGoods: function (curelement, element) {
                var self = this;
                var location = self.CurrentLt + ',' + self.CurrentLg + ',' +
                    '[' + self.Address.province + ',' + self.Address.city + ',' + self.Address.district + ',' + 'ADDR' + ']';
                var note = element.find('.QuotedNote').val();
                var price = element.find(".QuotedPrice").val();
                if (!self.showinfo(curelement)) {
                    return;
                }
                if (isNaN(price) == true || price.length == 0) {
                    element.find(".QuotedPrice").notify("请输入价格信息和备注再确认发送.", { position: "left" });
                    return;
                }
                if (note == element.find('.QuotedNote').attr("placeholder")) {
                    note = "";
                }
                self.QuotGoodsModel.setter(self.LoginUser.DDUserId, self.CurrentQuoting.REQUIREID, '', price, 0, note, location);
                self.QuotGoodsModel.quoteGoods(function (rst) {
                    if (rst.isSuccess == true && rst.Data.STATE == 0) {
                        //诸葛io日志记录
                        Common.WriteAnalyze("去报价-报价", { "求购类型": self.CurrentQuoting.SERIES, "报价信息": price });
                        $(element).notify("报价信息已发送成功！", { position: "left", className: "success", autoHideDelay: 1500 });
                        setTimeout(function () {
                            element.parent().slideUp("normal", function () { $(this).remove(); });
                            self.removeGoods();
                        }, 2500);
                    }
                });
            },
            showinfo: function (curelement) {
                var self = this;
                var isChecked = true;
                if (!self.navibar.IsValidate) {
                    $(curelement).notify("手机号未绑定，请到“设置”->“账号绑定处”,或单击我跳转。", { position: "left", className: "info" });
                    $(curelement).parent().find(".notifyjs-container").click(function () {
                        window.open(SysUrl.getUrl("Users/Setting/BindMobile"), "_blank");
                    });
                    isChecked = false;
                    return isChecked;
                }
                else if (!self.navibar.Cert_Pass) {
                    $(curelement).notify("您的资料未通过审核，请到“会员中心”->“认证” 重新认证,或单击我跳转。", { position: "left", className: "info" });
                    $(curelement).parent().find(".notifyjs-container").click(function () {
                        window.open(SysUrl.getUrl("Users/ValidateInfo/BaseInfo?type=D"), "_blank");
                    });
                    isChecked = false;
                    return isChecked;
                }
                else if (!self.navibar.Cert_Done) {
                    $(curelement).notify("您当前未进行认证”->“认证” 去认证,或单击我跳转。", { position: "left", className: "info" });
                    $(curelement).parent().find(".notifyjs-container").click(function () {
                        window.open(SysUrl.getUrl("Users/ValidateInfo/BaseInfo?type=D"), "_blank");
                    });
                    isChecked = false;
                    return isChecked;
                }
                else if (!self.navibar.Cert_Doing) {
                    $(curelement).notify("您的资料正在审核中，请耐心等待”->“认证” 去查看,或单击我跳转。", { position: "left", className: "info" });
                    $(curelement).parent().find(".notifyjs-container").click(function () {
                        window.open(SysUrl.getUrl("Users/ValidateInfo/BaseInfo"), "_blank");
                    });
                    isChecked = false;
                    return isChecked;
                }
                return isChecked;
            },
            ingnoreGoods: function (curelement, element) {
                var self = this;
                if (!self.showinfo(curelement)) {
                    return;
                }
                self.IngnoreGoodsModel.setter(self.LoginUser.DDUserId, self.CurrentQuoting.REQUIREID);
                self.IngnoreGoodsModel.ignoreRequire(function (rst) {
                    if (rst.Data.STATE == 0) {
                        //诸葛io日志记录
                        Common.WriteAnalyze("去报价-忽略", { "求购类型": self.CurrentQuoting.SERIES });
                        $(element).notify("该找货信息已忽略！", { position: "left", className: "info", autoHideDelay: 1500 });
                        setTimeout(function () {
                            element.parent().slideUp("normal", function () { $(this).remove(); });
                            self.removeGoods();
                        }, 2000);
                    }
                });
            },
            removeGoods: function () {
                var self = this;
                if (self.CurrentListPosition != -1) {
                    self.CurrentQuotingLst.splice(self.CurrentListPosition, 1);
                }
                self.TotalVieing -= 1;
                $('.TotalViening').text(self.TotalVieing);
                //抢单中+一条信息  vied information add a new record
                self.TotalVied = parseInt($('.TotalVied').last().text());
                self.TotalVied += 1;
                $('.TotalVied').text(self.TotalVied);
                $('.TotalViening').text(self.TotalVieing);

                if (self.CurrentQuotingLst.length == 0) {
                    self.tempPanel.css("display", "block");
                    self.QuotedPannel.css("display", "none");

                }
            }
        }
        return QuotedCtrl;
    })