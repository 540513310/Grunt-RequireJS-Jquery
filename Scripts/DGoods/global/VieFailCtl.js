define(["jquery", "jquerytmpl", 'NavibarCtl', "../utils/SysUrl", '../utils/Common', '../utils/ModelDailog',
    "../utils/SysConfig", '../utils/ConsumeLevel', '../moduler/rs_QuotedInfo', "../moduler/rs_QuoteGoods",
    "../viewmodel/Require_QuoteViewModel", '../viewmodel/QuotedInfoViewModel'],
    function ($, jquerytmpl, NavibarCtl, SysUrl, Common, ModelDailog, SysConfig, ConsumeLevel,
        rs_QuotedInfo, rs_QuoteGoods, Require_QuoteViewModel,
        QuotedInfoViewModel) {
        var VieFail = function (user) {
            //登录用户
            this.LoginUser = user;

            //右边提示窗口
            this.lbTotalViedFail = $('.TotalViedFail');
            this.lbStartTime = $(".LbStartTime");
            this.lbSeries = $('.LbSeries');
            this.lbDetail = $('.LbDetail');
            this.lbMyDetail = $('.LbMyDetail');
           
            this.lbDealPrice = $('.LbDealPrice');
            this.lbDealDetail = $('.LbDealDetail');
            this.lbDealPriceTitle = $('.LbDealPriceTitle');
            this.lbDealPriceContent = $('.LbDealPriceContent');
            this.lbPrice = $('.LbPrice');
            this.lbLRCount = $('.LbRCount');
            this.lbOfferCount = $('.LbOfferCount');


            //找货信息详情2013
            this.RequireDetailModel = new Require_QuoteViewModel();

            //报价对象
            this.QuoteGoods = function () { };
            this.QuoteGoods.prototype = rs_QuoteGoods.Req;

            //获取报价中的找货信息列表模型 2023
            this.QuotingModel = new QuotedInfoViewModel();
            this.QuotPageSize = window.SysInfo.Paging.DftPageSize;
            this.QuotPageNo = window.SysInfo.Paging.VisiblePages;

            //标签
            this.tempPanel = $(".findD-none");
            this.TmplQuoteTemplate = $('#VieFailTemplate');
            this.BuyLevelMarkUp = $('#BuyLevelMarkUp');
            this.QuotedPannel = $(".vien-left");
            this.RightPannel = $('.vien-right');
            this.BuyerLevel = $('.BuyerLevel');

            //Navivar 菜单栏位
            this.navibar = new NavibarCtl(user);

            //总抢单中数
            this.TotalViedFail = 0;

            //抢单列表
            this.CurrentQuotingLst = [];
            this.CurrentQuotingID = null;
            this.CurrentQuoting = {};

            this.init();
        }

        VieFail.prototype = {
            init: function () {
                var self = this;
                self.CurrentQuotingLst = [];
                self.navibar.buildNavibar(function (data) {
                    if (data.LOSE > 0 && data.STATE == 0) {
                        self.beginQuery();
                    }
                    if (data.LOSE == 0 || data.STATE != 0) {
                        self.tempPanel.css("display", "block");
                    }
                    else {
                        self.QuotedPannel.css("display", "block");
                        self.RightPannel.css("display", "block");
                    }
                    self.navibar.buildScroll();
                    //改变主菜单active状态
                    $('.TotalViedFail').first().closest('dd').addClass('active');
                });
            },
            bindEvent: function () {
                var self = this;

                self.QuotedPannel.find("li").unbind("click");
                self.QuotedPannel.find("li").click(function () {
                    self.QuotedPannel.find("li").removeClass("active");
                    $(this).addClass("active");
                    //Get Current
                    self.CurrentQuoting = rs_QuotedInfo.Rsp;
                    self.CurrentQuotingID = $(this).attr("data-id");
                    for (var i = 0; i < self.CurrentQuotingLst.length; i++) {
                        if (self.CurrentQuotingLst[i].REQUIREID == self.CurrentQuotingID) {
                            self.CurrentQuoting = self.CurrentQuotingLst[i];
                            break;
                        }
                    }
                    self.setCurrent();
                });


                var loading = false;
                self.TotalViedFail = parseInt($('.TotalViedFail').last().text());
                $(self.QuotedPannel).scroll(function () {
                    if (!loading && ($(self.QuotedPannel).scrollTop() > self.QuotedPannel.prop('scrollHeight') - self.QuotedPannel.height() - 20)) {
                        loading = true;
                        //如果当前加载量 小于总数量 加载
                        if (self.TotalViedFail - self.CurrentQuotingLst.length > 0) {
                            var html = '<li class="loadMore" style="text-align:center;' +
                                'position:absolute;bottom: 21px;width: 54.4%;z-index: 100;background: white;">信息加载中...</li>';
                            $(html).insertAfter(self.QuotedPannel.find("li").last());
                            height = $('.loadMore').height();
                            $('.loadMore').fadeOut(2000, function () {
                                //查询报价信息事件
                                $(this).remove();
                                self.QuotPageNo += 1;
                                self.beginQuery();
                            });
                        }
                    }
                });

            },
            beginQuery: function () {
                var self = this;
                self.QuotingModel.setter(self.LoginUser.DDUserId, 'B', self.QuotPageNo, self.QuotPageSize);
                self.QuotingModel.quoteGoods(function (rst) {
                    if (rst.isSuccess == true) {
                        if (rst.Data.DATAS.length > 0) {
                            for (var i = 0; i < rst.Data.DATAS.length; i++) {
                                rst.Data.DATAS[i].ImageData = { ImageLst: ConsumeLevel(rst.Data.DATAS[i].BCREDIT, true) };
                            }
                            //Set active record to the top.
                            rst.Data.DATAS[0].ISACTIVE = "active";
                            self.CurrentQuoting = rst.Data.DATAS[0];
                            self.CurrentQuotingLst = self.CurrentQuotingLst.concat(rst.Data.DATAS);
                            //build template
                            self.TmplQuoteTemplate.tmpl(rst.Data.DATAS).appendTo(".vien-left");
                            self.setCurrent();
                            self.beginQueryDetail();
                            self.bindEvent();
                        }
                    }
                });
            },
            setCurrent: function () {
                var self = this;
                //Set right panel value
                self.BuyerLevel.empty();
                self.BuyLevelMarkUp.tmpl(self.CurrentQuoting.ImageData).appendTo(".BuyerLevel");

                self.lbStartTime.text(self.CurrentQuoting.REQDATE);
                self.lbDealPriceTitle.text("中标价");
                self.lbMyDetail.text(self.CurrentQuoting.PRICEDESC);
                self.lbDealPriceContent.text("￥");
                self.lbDealPrice.text("");
                if (self.CurrentQuoting.DEALPRICE == 0) {
                    self.lbDealPriceTitle.text("无中标商家")
                    self.lbDealPriceContent.text("");
                }
                else {
                    self.lbDealPrice.text(self.CurrentQuoting.DEALPRICE);
                }
                self.lbPrice.text(self.CurrentQuoting.PRICE);
                self.lbLRCount.text(self.CurrentQuoting.REQCOUNT);
                self.lbOfferCount.text(self.CurrentQuoting.OFFERS);
        
                self.lbSeries.text(self.CurrentQuoting.SERIES + "/" + self.CurrentQuoting.MATERIAL + "/" + self.CurrentQuoting.SURFACE);
                self.lbDetail.text(self.CurrentQuoting.DETAIL + "\u00a0\u00a0 " + "   交货地点:" + self.CurrentQuoting.DELIVERY);
               
                self.lbDealDetail.text(self.CurrentQuoting.DEALPRICEDESC);
                self.lbStartTime.text();
            },
            beginQueryDetail: function () {
                var self = this;
                self.RequireDetailModel.setter(self.LoginUser.DDUserId, self.CurrentQuoting.REQUIREID);
                self.RequireDetailModel.getRequireDetail(function (rst) {
                    //获取到找货详情QXT2013
                    if (rst.isSuccess) {
                        self.lbStartTime.text(rst.Data.PUBDATE);
                    }
                });
            },
        }
        return VieFail;
    })