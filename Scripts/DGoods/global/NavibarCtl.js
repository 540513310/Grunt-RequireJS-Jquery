define(['jquery', "jquerynicescroll", "../utils/Common", "../utils/SysUrl",
    '../viewmodel/UserDealViewModel', "../viewmodel/AccountViewModel"],
    function ($, jquerynicescroll, Common, SysUrl, UserDealViewModel, AccountViewModel) {
        var NavibarCtl = function (user) {
            this.LoginUser = user;
            this.IsValidate = true;
            //通过
            this.Cert_Pass = true;
            //认证 
            this.Cert_Done = true;
            //认证中
            this.Cert_Doing = true;

        };

        //构造选择跳转框
        NavibarCtl.prototype.buildNavibar = function (callback) {
            var self = this;
            var userdealModel = new UserDealViewModel();
            userdealModel.setter(self.LoginUser.DDUserId);
            userdealModel.userDeal(function (rst) {
                var rstdata = rst.Data;
                if (rst.isSuccess == true && rst.Data.STATE == 0) {
                    //找货
                    $('.TotalFinding').text(rst.Data.OFFERING);
                    $('.TotalDealt').text(rst.Data.CONFIRMED);
                    $('.TotalOverTime').text(rst.Data.EXPIRED + rst.Data.CANCELED);

                    //抢单
                    $(".TotalVied").text(rst.Data.BIDDED);//已抢单
                    $('.TotalViening').text(rst.Data.BIDDING);
                    $('.TotalViedSuccess').text(rst.Data.VICTORY);
                    $('.TotalViedFail').text(rst.Data.LOSE);
                }
                else {
                    rstdata = $.extend({}, rst.Data);
                    rstdata.BIDDED = 0;
                    rstdata.BIDDING = 0;
                    rstdata.CANCELED = 0;
                    rstdata.CONFIRMED = 0;
                    rstdata.EXPIRED = 0;
                    rstdata.LOSE = 0;
                    rstdata.OFFERING = 0;
                    rstdata.VICTORY = 0;
                }
                if (typeof callback == 'function') {
                    callback.call(this, rstdata);
                }
            });
        },
            //验证用户是否有电话号码
            NavibarCtl.prototype.isIdentify = function () {
                var self = this;
                //Check DDUserId
                if (typeof self.LoginUser.DDUserId == 'undefined') {
                    self.IsValidate = false;
                }
                else if (self.LoginUser.UserName == "" && self.LoginUser.FirmId != "") {
                    self.IsValidate = false;
                }
                var msg;
                if (!self.IsValidate) {
                    msg = {
                        title: "您当前未绑定联系手机，请绑定后再操作!",
                        desc: '进行找货报价需要设置联系手机，以便买卖双方可以相互联系，顺利开展洽谈工作。',
                        button: {
                            cleanBtn: {
                                visable: true,
                                text: '取消',
                                OnCancel: function () {
                                },
                            },
                            enterBtn: {
                                text: '添加绑定手机',
                                url: '',
                                onConfrim: function () {
                                    window.open(SysUrl.getUrl("Users/Setting/BindMobile"), "_self");
                                }
                            }
                        }
                    }
                }
                if (!self.IsValidate) {
                    var cus = new Common.CustDialog(msg);
                    cus.showNoCertDialog();
                    return;
                }
                
                var accountModel = new AccountViewModel();
                var msgmodel = { Title: "", Desc: "", EnterBtn: "", Viscancel: true };
                accountModel.settercert(self.LoginUser.DDUserId);
                accountModel.queryCert(function (rst) {
                    if (rst.Data.STATE == 0) {
                        if (rst.Data.CERTSTATE == "X") {
                            self.Cert_Pass = false;
                            msgmodel.Title = "您的资料未通过审核，请重新认证！";
                            msgmodel.Desc = '未通过原因:' + rst.Data.CERTDESC + ',如有疑问请联系客服:0510-66001000';
                            msgmodel.EnterBtn = "重新认证";
                        }
                        else if (rst.Data.CERTSTATE == "N") {
                            self.Cert_Done = false;
                            msgmodel.Title = "您当前未进行认证，请先认证后再操作！";
                            msgmodel.Desc = '找货报价需经过认证，您当前尚未进行此认证。';
                            msgmodel.EnterBtn = "去认证";
                        }
                        else if (rst.Data.CERTSTATE == "C") {
                            self.Cert_Doing = false;
                            msgmodel.Title = "您的资料正在审核中，请耐心等待！";
                            msgmodel.Desc = '您可以拨打客服电话0510-66001000，了解审核进度。';
                            msgmodel.EnterBtn = "确定";
                            msgmodel.Viscancel = false;
                        }
                        var msgbox = {
                            title: msgmodel.Title,
                            desc: msgmodel.Desc,
                            button: {
                                cleanBtn: {
                                    visable: msgmodel.Viscancel,
                                    text: '取消',
                                    OnCancel: function () {
                                    },
                                },
                                enterBtn: {
                                    text: msgmodel.EnterBtn,
                                    url: '',
                                    onConfrim: function () {
                                        if (!self.Cert_Pass || !self.Cert_Done) {
                                            window.open(SysUrl.getUrl("Users/ValidateInfo/BaseInfo?type=D"), "_self");
                                        }
                                    }
                                }
                            }
                        }
                        if (!self.Cert_Pass || !self.Cert_Done || !self.Cert_Doing) {
                            var cuscert = new Common.CustDialog(msgbox);
                            cuscert.showNoCertDialog();
                        }
                    }
                });
            },
            //构造滚动条
            NavibarCtl.prototype.buildScroll = function () {
                $(".vien-left").niceScroll({
                    cursorcolor: "#d5eaff",
                    cursoropacitymax: 1,
                    touchbehavior: false,
                    cursorwidth: "8px",
                    cursorborder: "0",
                    cursorborderradius: "5px"
                });
                $(".vien-right").niceScroll({
                    cursorcolor: "#d5eaff",
                    cursoropacitymax: 1,
                    touchbehavior: false,
                    cursorwidth: "8px",
                    cursorborder: "0",
                    cursorborderradius: "5px"
                });
                $(".quote-ul").niceScroll({
                    cursorcolor: "#d5eaff",
                    cursoropacitymax: 1,
                    touchbehavior: false,
                    cursorwidth: "8px",
                    cursorborder: "0",
                    cursorborderradius: "5px"
                });
            }
        return NavibarCtl;
    });