define(["jquery", "jquerynotify", "jquerytmpl", 'NavibarCtl', "../utils/SysUrl", '../utils/Common', '../utils/ConsumeLevel',
    "../utils/SysConfig", "../viewmodel/GoodsDealViewModel", "../viewmodel/Require_QuoteViewModel",
    "../viewmodel/CommentDealViewModel", '../viewmodel/ContractInfoViewModel'],
    function ($, jquerynotify, jquerytmpl, NavibarCtl, SysUrl, Common, ConsumeLevel, SysConfig,
        GoodsDealViewModel, Require_QuoteViewModel,
        CommentDealViewModel, ContractInfoViewModel) {
        var DealtCtl = function (user) {
            //当前页控件
            this.tempPanel = $(".findD-none");
            this.LeftPanel = $(".vien-left");
            this.RightPanel = $(".vien-right");

            //右边提示窗口
            this.lbDealtCount = $('.TotalDealt');
            this.lbStartTime = $(".LbStartTime");
            this.lbSeries = $('.LbSeries');
            this.lbDetail = $('.LbDetail');

            this.lbScompany = $('.LbSCompany');
            this.lbSContact = $('.LbSContact');
            this.lbSUserTel = $('.LbSUserTel');

            this.lbDealtPrice = $('.LbDealtPrice');
            this.lbDescription = $('.LbDescription');
            this.lbOfferCount = $('.LbOfferCount');
            this.lbSOfferCount = $('.LbSOFFERCOUNT');
            this.lbStartTime = $('.LbStartTime');

            this.btnComment = $('.btn-Comment');
            //总找货中
            this.TotalDealt = 0;

            //找货模板--2017
            this.TmplRequireMarkUp = $("#DealtTemplate");
            this.SalesLevelMarkUp = $("#SalesLevelTemplate");
            this.RequireMarkUp = $(".DealtMarkUp");
            this.Saleslevel = $('.Saleslevel');

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
            this.init();
        }

        DealtCtl.prototype = {
            init: function () {
                var self = this;
                self.CurrentRequireLst = [];
                self.LeftPanel.hide();
                self.RightPanel.hide();

                self.navibar.buildNavibar(function (data) {
                    if (data.CONFIRMED > 0 && data.STATE == 0) {
                        self.beginQueryDealt();
                    }
                    if (data.CONFIRMED == 0 || data.STATE != 0) {
                        self.tempPanel.css("display", "block");
                    }
                    else {
                        self.LeftPanel.css("display", "block");
                        self.RightPanel.css("display", "block");
                    }
                    self.navibar.buildScroll();
                    $('.TotalDealt').first().closest('dd').addClass('active');
                });
            },
            setCurrent: function () {
                var self = this;
                //Set right panel value
                self.lbDescription.text(self.CurrentRequire.NOTE);
                self.lbSeries.text(self.CurrentRequire.SERIES + "/" + self.CurrentRequire.MATERIAL + "/" + self.CurrentRequire.SURFACE);
                self.lbDetail.text(self.CurrentRequire.DETAIL + "\u00a0\u00a0 " + "交货地点:" + self.CurrentRequire.DELIVERY);

                self.lbScompany.text();
                self.lbSContact.text();
                self.lbSUserTel.text();

                if (self.CurrentRequire.BCOMMENTED == 'Y')
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
                    self.lbSOfferCount.text(self.CurrentRequire.Contract.SOFFERCOUNT);
                    self.lbScompany.text(self.CurrentRequire.Contract.SCOMPANY);
                    self.lbSContact.text(self.CurrentRequire.Contract.SCONTACT);
                    self.lbSUserTel.text(self.CurrentRequire.Contract.STEL);
                    var imgdata = { ImageLst: ConsumeLevel(self.CurrentRequire.Contract.SCREDIT, false) };
                    self.Saleslevel.empty();
                    self.SalesLevelMarkUp.tmpl(imgdata).appendTo(".Saleslevel");
                }

                if (self.CurrentRequire.RequireDetail == undefined) {
                    self.RequireDetailModel.setter(self.LoginUser.DDUserId, self.CurrentRequire.REQUIREID);
                    self.RequireDetailModel.getRequireDetail(function (rst) {
                        //获取到找货详情QXT2013
                        if (rst.isSuccess) {
                            self.CurrentRequire.RequireDetail = rst.Data;
                            self.lbStartTime.text(self.CurrentRequire.RequireDetail.PUBDATE);
                        }
                    });
                }
                else {
                    self.lbStartTime.text(self.CurrentRequire.RequireDetail.PUBDATE);
                }
            },
            beginQueryDealt: function () {
                var self = this;
                self.FindModel.setter(self.LoginUser.DDUserId, 'B', self.RequirePageNo, self.RequirePageSize);
                self.FindModel.quoteGoods(function (rst) {
                    if (rst.isSuccess == true) {
                        if (rst.Data.DATAS.length > 0) {
                            if (self.IsFirstQuery == true) {
                                self.IsFirstQuery = false;
                                rst.Data.DATAS[0].ISACTIVE = 'active';
                                //Default Query firstly record.
                                self.CurrentRequire = rst.Data.DATAS[0];
                                self.CurrentRequireID = rst.Data.DATAS[0].REQUIREID;
                                self.beginQueryDetail();
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

            bindLeftEvents: function () {
                var self = this;

                //查询报价信息事件
                self.LeftPanel.find("li").unbind("click");
                self.LeftPanel.find("li").click(function () {
                    self.LeftPanel.find("li").removeClass("active");
                    $(this).addClass("active");
                    //Get Current
                    self.CurrentRequire = null;
                    self.CurrentRequireID = $(this).attr("data-id");
                    for (var i = 0; i < self.CurrentRequireLst.length; i++) {
                        if (self.CurrentRequireLst[i].REQUIREID == self.CurrentRequireID) {
                            self.CurrentRequire = self.CurrentRequireLst[i];
                            self.setCurrent();
                            break;
                        }
                    }
                    if (self.CurrentRequire != null) {
                        self.beginQueryDetail();
                    }
                });


                var loading = false;
                self.TotalDealt = parseInt($('.TotalDealt').last().text());
                $(self.LeftPanel).scroll(function () {
                    if (!loading && ($(self.LeftPanel).scrollTop() > self.LeftPanel.prop('scrollHeight') - self.LeftPanel.height() - 20)) {
                        loading = true;
                        //如果当前加载量 小于总数量 加载
                        if (self.TotalDealt - self.CurrentRequireLst.length > 0) {
                            var html = '<li class="loadMore" style="text-align:center;' +
                                'position:absolute;bottom: 21px;width: 54.4%;z-index: 100;background: white;">信息加载中...</li>';
                            $(html).insertAfter(self.LeftPanel.find("li").last());
                            self.RequirePageNo += 1;
                            self.beginQueryDealt();
                            $('.loadMore').fadeOut(2000, function () {
                                $(this).addClass("active");
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
                    var leftelement = $('.DealtMarkUp.active');
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
                    title: "DD找货 评价卖家",
                    desc: '<div class="dialog-comment"><span class="desc-comment">综合评分：</span>' + img + '</div>',
                    htmlTemplate: '<div class="msg body">'
                    + '<div class="msg body-note"> <textarea placeholder="输入对卖家的评价" class="LbNote" maxlength=300 rows=6 cols=60   ></textarea><span class="ex-word">最多只能输入300字</span></div>'
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
                                    self.CurrentRequire.CommentScore, self.CurrentRequire.CommentTxt, 'B');
                                self.CommentModel.sendcomment(function (rst) {
                                    if (rst.Data.STATE == 0) {
                                        //诸葛io日志记录
                                        Common.WriteAnalyze("已确认-评价", { "求购类型": self.CurrentRequire.SERIES, "成交价格": self.CurrentRequire.DEALPRICE });
                                        self.CurrentRequire.BCOMMENTED = 'Y';
                                        $(".LbSContact").notify("对卖家评价成功,积分+" + rst.Data.SCORE + "", { position: "bottom", className: "success" });
                                        self.btnComment.css("display", 'none');
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
                $(".LbNote").keyup(function () {
                    resizeNum();
                    if ($(this).val() > 300) {
                        return false;
                    }
                    self.CurrentRequire.CommentTxt = $(this).val();
                    var txtlength = self.CurrentRequire.CommentTxt.toString().length;
                    $('.txtStates').text(txtlength.toString() + "/300");
                })

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
        return DealtCtl;
    });

