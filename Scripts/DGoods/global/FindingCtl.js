define(["jquery", "jquerytmpl", 'jqueryhisotry', 'NavibarCtl', "../utils/SysUrl", '../utils/ConsumeLevel',
    "../utils/SysConfig", '../utils/Common', '../moduler/rs_Required_Quoted',
    "../viewmodel/ReqMyGdViewModel", '../viewmodel/Dis_DelRequireViewModel',
    "../viewmodel/Require_QuoteViewModel", "../viewmodel/CfmQuoteViewModel"],
    function ($, jquerytmpl, jqueryhisotry, NavibarCtl, SysUrl, ConsumeLevel, SysConfig, Common, rs_Required_Quoted,
        ReqMyGdViewModel, Dis_DelRequireViewModel, Require_QuoteViewModel, CfmQuoteViewModel) {
        var Finding = function (user, requireid) {
            //当前页控件
            this.tempPanel = $(".findD-none");
            this.LeftPanel = $(".vien-left");
            this.RightPanel = $(".vien-right");
            this.tempDiv = '<div class="findD-none">您没有抢过的单子哦</div>';

            //右边提示窗口
            this.lbOfferCount = $('.LbOfferCount');
            this.lbfindingCount = $('.TotalFinding');
            this.lbEndTime = $(".LbEndTime");
            this.lbSeries = $('.LbSeries');
            this.lbDetail = $('.LbDetail');
            //总找货中
            this.TotalFinding = 0;

            //找货模板--2011
            this.TmplRequireMarkUp = $("#RequireTemplate");
            this.RequireMarkUp = $(".RequireMarkUp");

            //求购报价信息
            this.QuoteModel = new Require_QuoteViewModel();
            this.QuotePageNo = window.SysInfo.Paging.VisiblePages;
            this.QuotePageSize = 100;
            //报价列表--2012
            this.TmplVieMarkUp = $("#QuotedTemplate");
            this.QuotedMarkUp = $(".QuotedMarkUp");
            this.ConfirmQuotedBtn = $(".menu_btn.menu_btn_sub.btn-intention");

            //登录用户
            this.LoginUser = user;

            //找货信息
            this.FindModel = new ReqMyGdViewModel();

            this.RequirePageNo = window.SysInfo.Paging.VisiblePages;
            this.RequirePageSize = window.SysInfo.Paging.DftPageSize;

            //当前选中的求购信息ID
            this.CurrentRequireID = null;
            //当前报价ID
            this.CurrentOfferID = null;

            //确认交易
            this.ConfirmModel = new CfmQuoteViewModel();

            this.DimissModel = new Dis_DelRequireViewModel();


            //当前找货列表
            this.CurrentRequireLst = [];
            //当前找货
            this.CurrentRequire = {};
            //第一次加载
            this.IsFirstQuery = true;
            //Navivar 菜单栏位
            this.navibar = new NavibarCtl(user);
            this.init();
            if (typeof requireid !== "undefined" && requireid.length > 0) {
                this.CurrentRequireID = requireid;
            }
        }

        Finding.prototype = {
            init: function () {
                var self = this;
                //Redirect When the user isn't login system.
                if (typeof self.LoginUser != "object" || self.LoginUser == undefined) {
                    window.location = SysUrl.getUrl("/Account/Login?ReturnUrl=" + window.location.pathname);
                }
                self.navibar.buildNavibar(function (data) {
                    if (data.OFFERING > 0 && data.STATE == 0) {
                        self.beginQueryFinding();
                    }
                    if (data.OFFERING == 0 || data.STATE != 0) {
                        self.tempPanel.css("display", "block");
                    }
                    else {
                        self.LeftPanel.css("display", "block");
                        self.RightPanel.css("display", "block");
                    }
                    self.navibar.buildScroll();
                    //改变主菜单active状态
                    $('.TotalFinding').first().closest('dd').addClass('active');
                });
                History.pushState("", "求购 - 找货中-东方商城", "/DGoods/Deliver/Finding");
                self.LeftPanel.empty();
                self.CurrentRequireLst = [];
            },
            setCurrent: function () {
                var self = this;
                //Set right panel value
                self.lbOfferCount.text(self.CurrentRequire.OFFERCOUNT);
                self.lbEndTime.text(self.CurrentRequire.ENDTIME + '到期');
                self.lbSeries.text(self.CurrentRequire.SERIES + "/" + self.CurrentRequire.MATERIAL + "/" + self.CurrentRequire.SURFACE);
                self.lbDetail.text(self.CurrentRequire.DETAIL + "\u00a0\u00a0 " + "  交货地点:" + self.CurrentRequire.DELIVERY);

            },
            beginQueryFinding: function () {
                var self = this;
                self.FindModel.setter(self.LoginUser.DDUserId, "A", "B", self.RequirePageNo, self.RequirePageSize);
                self.FindModel.getMyGoods(function (rst) {
                    if (rst.isSuccess == true) {
                        if (rst.Data.DATAS.length > 0) {
                            if (self.IsFirstQuery == true) {
                                self.IsFirstQuery = false;
                                if (self.CurrentRequireID != null) {
                                    for (var i = 0; i < rst.Data.DATAS.length; i++) {
                                        if (rst.Data.DATAS[i].REQUIREID == self.CurrentRequireID) {
                                            var data = rst.Data.DATAS[i];
                                            rst.Data.DATAS[i] = rst.Data.DATAS[0];
                                            rst.Data.DATAS[0] = data;
                                            break;
                                        }
                                    }
                                }
                                rst.Data.DATAS[0].ISACTIVE = 'active';
                                //Default Query firstly record.
                                self.CurrentRequire = rst.Data.DATAS[0];
                                self.CurrentRequireID = rst.Data.DATAS[0].REQUIREID;
                                self.queryQuoted();
                            }
                            //build template
                            self.CurrentRequireLst = self.CurrentRequireLst.concat(rst.Data.DATAS);
                            self.TmplRequireMarkUp.tmpl(rst.Data.DATAS).appendTo(".vien-left");

                            self.bindLeftEvents();
                            self.setCurrent();
                        }
                    }
                });
            },

            //查询报价
            queryQuoted: function () {
                var self = this;
                self.QuoteModel.setter(self.LoginUser.DDUserId, self.CurrentRequireID, self.QuotedPageNo, self.QuotePageSize);
                self.QuoteModel.getQuoted(function (rst) {
                    if (rst.isSuccess == true) {
                        {
                            for (var i = 0; i < rst.Data.DATAS.length; i++) {
                                rst.Data.DATAS[i].ImageLst = ConsumeLevel(rst.Data.DATAS[i].SCREDIT, false);
                            }
                            $('.vien-right-ul').empty();
                            self.TmplVieMarkUp.tmpl(rst.Data.DATAS).appendTo(".vien-right-ul");
                            self.bindRightEvents();
                        }
                    }
                    else
                        alert(rst.ErrorMsg);
                });
            },
            DimissGoods: function (element) {
                var self = this;
                var rightelement = $(element).closest('.vien-right');
                var leftelement = $('.RequireMarkUp.active');
                self.DimissModel.setter(self.LoginUser.DDUserId, self.CurrentRequire.REQUIREID);
                self.DimissModel.dimissRequire(function (rst) {
                    if (rst.Data.STATE == 0) {
                        self.CurrentRequire = rs_Required_Quoted.RepRequireWithQuoting;
                        //诸葛io日志记录
                        Common.WriteAnalyze("找货中页-撤单成功", { "求购类型": self.CurrentRequire.SERIES });
                        var lastindex = 0;
                        for (var i = 0; i < self.CurrentRequireLst.length - 1; i++) {
                            if (self.CurrentRequireLst[i].REQUIREID == self.CurrentRequireID) {
                                self.CurrentRequire = self.CurrentRequireLst[i + 1];
                                self.CurrentRequireLst.splice(i, 1);
                                lastindex = i;
                                break;
                            }
                        }
                        if (lastindex == 0 && self.CurrentRequireLst.length > 0) {
                            self.CurrentRequire = self.CurrentRequireLst[0];
                        }
                        $(".RequireMarkUp[data-id='" + self.CurrentRequire.REQUIREID + "']").addClass("active");
                        self.setCurrent();
                        leftelement.slideUp("normal", function () { $(this).remove(); });
                    }
                });
            },
            Recommand: function () {
                //诸葛io日志记录
                Common.WriteAnalyze("找货中页-推荐", { "求购类型": this.CurrentRequire.SERIES });
                window.open(SysUrl.getUrl("/DGoods/VieOrder/RmdOrder?requireid=" + this.CurrentRequire.REQUIREID), "_blank");
            },
            bindLeftEvents: function () {
                var self = this;
                //撤单
                $('.btn-Dimiss').unbind('click');
                $('.btn-Dimiss').click(function (event) {
                    //诸葛io日志记录
                    Common.WriteAnalyze("找货中页-撤单", { "求购类型": self.CurrentRequire.SERIES });
                    var childelement = this;
                    var msg = {
                        title: "DD找货提示",
                        desc: '您确认撤销当前的找货消息吗？',
                        button: {
                            cleanBtn: {
                                visable: true,
                                text: '取消',
                            },
                            enterBtn: {
                                text: '确认',
                                url: '',
                                onConfrim: function () {
                                    self.DimissGoods(childelement);
                                    self.removeItem();
                                }
                            }
                        }
                    };
                    var cus = new Common.CustDialog(msg);
                    cus.showNoCertDialog();
                });

                $('.btn-Recommand').unbind('click');
                $('.btn-Recommand').click(function () {
                    self.Recommand(this);
                });

                //查询报价信息事件
                self.LeftPanel.find("li").unbind("click");
                self.LeftPanel.find("li").click(function () {
                    self.LeftPanel.find("li").removeClass("active");
                    $(this).addClass("active");
                    //Get Current
                    self.CurrentRequireID = $(this).attr("data-id");
                    for (var i = 0; i < self.CurrentRequireLst.length; i++) {
                        if (self.CurrentRequireLst[i].REQUIREID == self.CurrentRequireID) {
                            self.CurrentRequire = self.CurrentRequireLst[i];
                            self.setCurrent();
                            break;
                        }
                    }
                    self.queryQuoted();
                });


                var loading = false;
                self.TotalFinding = parseInt($('.TotalFinding').last().text());
                $(self.LeftPanel).scroll(function () {
                    if (!loading && ($(self.LeftPanel).scrollTop() > self.LeftPanel.prop('scrollHeight') - self.LeftPanel.height() - 20)) {
                        loading = true;
                        //如果当前加载量 小于总数量 加载
                        if (self.TotalFinding - self.CurrentRequireLst.length > 0) {
                            var html = '<li class="loadMore" style="text-align:center;' +
                                'position:absolute;bottom: 21px;width: 54.4%;z-index: 100;background: white;">信息加载中...</li>';
                            $(html).insertAfter(self.LeftPanel.find("li").last());
                            self.RequirePageNo += 1;
                            self.beginQueryFinding();
                            $('.loadMore').fadeOut(2000, function () {
                                $(this).addClass("active");
                                $(this).remove();
                            });
                        }
                    }
                });

            },
            bindRightEvents: function () {
                //确认意向
                var self = this;
                self.ConfirmQuotedBtn = $(".comfirm-deal");
                self.ConfirmQuotedBtn.unbind("click");
                self.ConfirmQuotedBtn.on("click", function (event) {
                    var childelement = this;
                    var msg = {
                        title: "DD找货提示",
                        desc: '确认当前的报价意向吗？',
                        button: {
                            cleanBtn: {
                                visable: true,
                                text: '取消',
                            },
                            enterBtn: {
                                text: '确认',
                                url: '',
                                onConfrim: function () {
                                    var parentelement = $(childelement).closest('li');
                                    var leftelement = $('.RequireMarkUp.active');

                                    self.CurrentOfferID = parentelement.attr("data-id");
                                    self.ConfirmModel.setter(self.LoginUser.DDUserId, self.CurrentRequireID, self.CurrentOfferID);
                                    self.ConfirmModel.confirmQuoted(function (rst) {
                                        if (rst.Data.STATE == 0) {
                                            //诸葛io日志记录
                                            Common.WriteAnalyze("找货中页-确认意向", { "求购类型": self.CurrentRequire.lbSeries });
                                            window.open(SysUrl.getUrl("DGoods/Deliver/Dealt"), "_self");
                                        }
                                    })
                                },
                            },
                        }
                    };
                    var cus = new Common.CustDialog(msg);
                    cus.showNoCertDialog();
                });
            },
            removeItem: function () {
                var self = this;
                var total = parseInt(self.lbfindingCount.first().text());
                var totaldealt = parseInt($(".TotalDealt").first().text());

                total -= 1;
                totaldealt += 1;

                $(".TotalDealt").text(totaldealt);
                self.lbfindingCount.text(total);
                if (total == 0) {
                    self.tempPanel.css("display", "block");
                    self.LeftPanel.css("display", "none");
                    self.RightPanel.css("display", "none");
                }
            }

        }
        return Finding;
    });