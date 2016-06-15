define(["jquery", "jquerynotify", "jquerytmpl", "jqueryhisotry", 'NavibarCtl', "../utils/SysUrl", "../utils/Common", '../utils/ConsumeLevel',
    "../utils/SysConfig", '../moduler/rs_QuotedInfo', "../viewmodel/GoodsDealViewModel",
    "../viewmodel/Require_QuoteViewModel", "../viewmodel/CommentDealViewModel", '../viewmodel/ContractInfoViewModel'],
    function ($, jquerynotify, jquerytmpl, jqueryhisotry, NavibarCtl, SysUrl, Common, ConsumeLevel, SysConfig,
        rs_QuotedInfo, GoodsDealViewModel, Require_QuoteViewModel,
        CommentDealViewModel, ContractInfoViewModel) {
        var VieSuccessCtl = function (user, requireid) {
            //当前页控件
            this.tempPanel = $(".findD-none");
            this.LeftPanel = $(".vien-left");
            this.RightPanel = $(".vien-right");

            //右边提示窗口
            this.lbDealtCount = $('.TotalDealt');
            this.lbStartTime = $(".LbStartTime");
            this.lbSeries = $('.LbSeries');
            this.lbDetail = $('.LbDetail');
            this.lbRCount = $('.LbRCount');
            this.lbBCompany = $('.LbBCompany');
            this.lbBContact = $('.LbBContact');
            this.lbBUserTel = $('.LbBUserTel');
            this.lbMinprice = $(".LbMinPrice");
            this.lbMaxprice = $(".LbMaxPrice");

            this.lbDealtPrice = $('.LbDealtPrice');
            this.lbDescription = $('.LbDescription');
            this.lbOfferCount = $('.LbOfferCount');
            this.lbStartTime = $('.LbStartTime');
            this.btnComment = $(".btn-Comment");

            //抢单成功
            this.TotalViedSuccess = 0;

            //找货模板--2017
            this.TmplRequireMarkUp = $("#VieSuccessTemplate");
            this.BuyLevelMarkUp = $("#BuyLevelMarkUp");
            this.RequireMarkUp = $(".VieSuccessMarkUp");
            this.BuyerLevel = $(".BuyerLevel");

            //登录用户
            this.LoginUser = user;
            //找货信息
            this.FindModel = new GoodsDealViewModel();

            this.RequirePageNo = window.SysInfo.Paging.VisiblePages;
            this.RequirePageSize = window.SysInfo.Paging.DftPageSize;

            //找货信息详情
            this.RequireDetailModel = new Require_QuoteViewModel();

            //当前选中的求购信息ID
            this.CurrentRequireID = null;
            //当前报价ID
            this.CurrentOfferID = null;

            //交易评价
            this.CommentModel = new CommentDealViewModel();

            //查询卖家合同信息
            this.ContractModel = new ContractInfoViewModel();

            //当前找货列表
            this.CurrentRequireLst = [];
            //当前找货
            this.CurrentRequire = {};
            //第一次加载
            this.IsFirstQuery = true;
            //Navivar 菜单栏位
            this.navibar = new NavibarCtl(user);
            if (typeof requireid != 'undefined') {
                this.CurrentRequireID = requireid;
            }

            this.init();
        }

        VieSuccessCtl.prototype = {
            init: function () {
                var self = this;
                //Redirect When the user isn't login system.
                if (typeof self.LoginUser != "object" || self.LoginUser == undefined) {
                    window.location = SysUrl.getUrl("/Account/Login?ReturnUrl=" + window.location.pathname);
                }

                self.navibar.buildNavibar(function (data) {
                    if (data.VICTORY > 0 && data.STATE == 0) {
                        self.beginQuerySales();
                    }
                    if (data.VICTORY == 0 || data.STATE != 0) {
                        self.tempPanel.css("display", "block");
                    }
                    else {
                        self.LeftPanel.css("display", "block");
                        self.RightPanel.css("display", "block");
                    }
                    self.navibar.buildScroll();
                    //改变主菜单active状态
                    $('.TotalViedSuccess').first().closest('dd').addClass('active');
                });
                History.pushState("", "抢单- 抢单成功- 东方商城", "/DGoods/VieOrder/ViedSuccess");
                self.LeftPanel.empty();
                self.CurrentRequireLst = [];
            },
            beginQuerySales: function () {
                var self = this;
                self.FindModel.setter(self.LoginUser.DDUserId, 'S', self.RequirePageNo, self.RequirePageSize);
                self.FindModel.quoteGoods(function (rst) {
                    if (rst.isSuccess == true) {
                        for (var i = 0; i < rst.Data.DATAS.length; i++) {
                            rst.Data.DATAS[i].ImageData = { ImageLst: ConsumeLevel(rst.Data.DATAS[i].BCREDIT, true) };
                        }
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
                                self.beginQueryDetail();
                            }
                            self.CurrentRequireLst = self.CurrentRequireLst.concat(rst.Data.DATAS);
                            self.TmplRequireMarkUp.tmpl(rst.Data.DATAS).appendTo(".vien-left");
                            self.bindLeftEvents();
                            self.setCurrent();
                        }
                    }
                    else {
                        alert(rst);
                    }
                });
            },
            setCurrent: function () {
                var self = this;
                //Set right panel value
                self.BuyerLevel.empty();
                self.BuyLevelMarkUp.tmpl(self.CurrentRequire.ImageData).appendTo(".BuyerLevel");
                self.lbDescription.text(self.CurrentRequire.NOTE);
                self.lbSeries.text(self.CurrentRequire.SERIES + "/" + self.CurrentRequire.MATERIAL + "/" + self.CurrentRequire.SURFACE);
                self.lbDetail.text(self.CurrentRequire.DETAIL + "\u00a0\u00a0 " + "   交货地点:" + self.CurrentRequire.DELIVERY);

                self.lbBCompany.text();
                self.lbRCount.text();
                self.lbBContact.text();
                self.lbBUserTel.text();
                self.lbOfferCount.text();
                self.lbDealtPrice.text();
                self.lbStartTime.text();
                self.lbMinprice.text();
                self.lbMaxprice.text();

                if (self.CurrentRequire.SCOMMENTED == 'Y')
                    self.btnComment.css("display", 'none');
                else
                    self.btnComment.css("display", 'block');
                self.bindRightEvents();
            },
            beginQueryDetail: function () {
                var self = this;
                if (self.CurrentRequire.Contract == undefined) {
                    self.ContractModel.setter(self.LoginUser.DDUserId, self.CurrentRequire.CONTRACTID);
                    self.ContractModel.getContractInfo(function (rst) {
                        //获取到合同信息
                        if (rst.isSuccess) {
                            self.CurrentRequire.Contract = rst.Data;
                            setContract();
                        }
                    });
                }
                else {
                    setContract();
                }
                function setContract() {
                    self.lbOfferCount.text(self.CurrentRequire.Contract.OFFERS);
                    self.lbDealtPrice.text(self.CurrentRequire.Contract.DEALPRICE);
                    self.lbBCompany.text(self.CurrentRequire.Contract.BCOMPANY);
                    self.lbBContact.text(self.CurrentRequire.Contract.BCONTACT);
                    self.lbBUserTel.text(self.CurrentRequire.Contract.BTEL);
                    self.lbMinprice.text(self.CurrentRequire.Contract.MINPRICE);
                    self.lbMaxprice.text(self.CurrentRequire.Contract.MAXPRICE);
                    self.lbRCount.text(self.CurrentRequire.Contract.BREQCOUNT);
                }

                if (self.CurrentRequire.RequireDetail == undefined) {
                    self.RequireDetailModel.setter(self.LoginUser.DDUserId, self.CurrentRequire.REQUIREID);
                    self.RequireDetailModel.getRequireDetail(function (rst) {
                        //获取到找货详情QXT2013
                        if (rst.isSuccess) {
                            self.CurrentRequire.RequireDetail = rst.Data;
                            setDetail();
                        }
                    });
                }
                else {
                    setDetail();
                }
                function setDetail() {
                    self.lbStartTime.text(self.CurrentRequire.RequireDetail.PUBDATE);
                }

            },
            bindLeftEvents: function () {
                var self = this;
                //查询报价信息事件
                self.LeftPanel.find("li").unbind("click");
                self.LeftPanel.find("li").click(function () {
                    self.LeftPanel.find("li").removeClass("active");
                    $(this).addClass("active");
                    //Get Current
                    self.CurrentRequire = rs_QuotedInfo.Rsp;
                    self.CurrentRequireID = $(this).attr("data-id");
                    for (var i = 0; i < self.CurrentRequireLst.length; i++) {
                        if (self.CurrentRequireLst[i].REQUIREID == self.CurrentRequireID) {
                            self.CurrentRequire = self.CurrentRequireLst[i];
                            break;
                        }
                    }
                    self.setCurrent();
                    if (self.CurrentRequire.REQUIREID.length > 0) {
                        self.beginQueryDetail();
                    }
                });

                var loading = false;
                self.TotalViedSuccess = parseInt($('.TotalViedSuccess').last().text());
                $(self.LeftPanel).scroll(function () {
                    if (!loading && ($(self.LeftPanel).scrollTop() > self.LeftPanel.prop('scrollHeight') - self.LeftPanel.height() - 20)) {
                        loading = true;
                        //如果当前加载量 小于总数量 加载
                        if (self.TotalViedSuccess - self.CurrentRequireLst.length > 0) {
                            var html = '<li class="loadMore" style="text-align:center;' +
                                'position:absolute;bottom: 21px;width: 54.4%;z-index: 100;background: white;">信息加载中...</li>';
                            $(html).insertAfter(self.LeftPanel.find("li").last());
                            self.RequirePageNo += 1;
                            self.beginQuerySales();
                            $('.loadMore').fadeOut(2000, function () {
                                //查询报价信息事件
                                $(this).remove();
                            });
                        }
                    }
                });

            },
            bindRightEvents: function () {
                //评价
                var self = this;
                $(".btn-Comment").unbind("click");
                $(".btn-Comment").on("click", function (event) {
                    var parentelement = $(this).closest('li');
                    self.showdialog();
                });
            },
            showdialog: function () {
                var self = this;
                self.CurrentRequire.CommentScore = 5;
                var img = '';
                for (var i = 1; i < 6; i++) {
                    img += '<div class="imag-comment ' + i + '" data-score="' + i + '" ></div>';
                }
                var msg = {
                    title: "DD找货 评价买家",
                    desc: '<div class="dialog-comment"><span class="desc-comment">综合评分：</span>' + img + '</div>',
                    htmlTemplate: '<div class="msg body">'
                    + '<div class="msg body-note"> <textarea maxlength="300" placeholder="输入对买家的评价"  class="LbNote" rows=6 cols=60></textarea><span class="ex-word">最多只能输入300字</span></div>'
                    + '<div class="msg body-states"><span class="txtStates">0/300</span></div>',
                    button: {
                        cleanBtn: {
                            visable: true,
                            text: '取消',
                            OnCancel: function () {
                            },
                        },
                        enterBtn: {
                            text: '提交',
                            onConfrim: function () {
                                self.CommentModel.setter(self.LoginUser.DDUserId, self.CurrentRequire.CONTRACTID,
                                    self.CurrentRequire.CommentScore, self.CurrentRequire.CommentTxt, 'S');
                                self.CommentModel.sendcomment(function (rst) {
                                    if (rst.Data.STATE == 0) {
                                        //诸葛io日志记录
                                        Common.WriteAnalyze("抢成功-评价", { "求购类型": self.CurrentRequire.SERIES, "成交价格": self.CurrentRequire.DEALPRICE });
                                        $(".LbRCount").notify("对买家评价成功,积分+" + rst.Data.SCORE + "", { position: "right", className: "success" });
                                        self.btnComment.css("display", 'none');
                                        self.CurrentRequire.SCOMMENTED = "Y";
                                    }
                                    else {
                                        alert(rst.Data.MSG);
                                    }
                                });
                            }
                        },
                    }
                };
                var cus = new Common.CustDialog(msg);
                cus.showNoCertDialog();
                Common.PlaceHolder();
                self.eventMonitor();
            },
            eventMonitor: function () {
                var self = this;
                //Change Event
                $(".dialog-comment").unbind('click');
                $(".dialog-comment>.imag-comment").click(function () {
                    $(".dialog-comment>.imag-comment").each(function (i, item) {
                        $(item).css("background-image",
                            "url(/Content/Users/DGoods/Images/star-gray.png)");
                    });

                    var score = parseInt($(this).attr('data-score'));
                    var parentelement = $(this).parent();
                    for (var i = 1; i < score + 1; i++) {
                        parentelement.find('.imag-comment.' + i.toString()).css("background-image",
                            "url(/Content/Users/DGoods/Images/star_yellow.png)");
                    }
                    self.CurrentRequire.CommentScore = score;
                });

                $(".LbNote").unbind('keyup');
                $(".LbNote").keyup(function (event) {
                    resizeNum();
                    if ($(this).val() > 300) {
                        return false;
                    }
                    self.CurrentRequire.CommentTxt = $(this).val();
                    var txtlength = self.CurrentRequire.CommentTxt.toString().length;
                    $('.txtStates').text(txtlength.toString() + "/300");
                });
                
                //限制300字符
                function resizeNum() {
                    var reNum = $(".LbNote").val();
                    if (reNum.length >= 300) {
                        $(".ex-word").show();
                        $(".LbNote").css("border", "1px solid red");
                        $(".body-states").css("border", "1px solid red");
                        $(".body-states").css("border-top", "none");
                        $(".LbNote").val($(".LbNote").val().substring(0, 300));
                    }
                    if (reNum.length < 300) {
                        $(".ex-word").hide();
                        $(".LbNote").css("border", "1px solid #a9a9a9");
                        $(".body-states").css("border", "1px solid #a9a9a9");
                        $(".body-states").css("border-top", "none");
                    }
                }
            }
        }
        return VieSuccessCtl;
    });