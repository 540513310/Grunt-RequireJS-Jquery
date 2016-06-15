define(['jquery', 'jqueryihgdialog', "../utils/SysUrl", '../utils/Common', '../utils/ModelDailog',
    "../utils/SysConfig", "../viewmodel/UserValidateViewModel"],
    function (jquery, jqueryihgdialog, SysUrl, Common, ModelDailog, SysConfig, UserValidateViewModel) {
        'use strict';
        var UserValidationCtl = function (user, certState) {
            this.LoginUser = user;
            this.CertState = certState;
            this.Company = $("#CompanyName");
            this.Contact = $("#Contact");
            this.Font = false;
            this.Back = false;
            this.ViewModel = new UserValidateViewModel();
            this.SubBtn = $(".btn-sub");
            this.SysUrl = SysUrl;
            this.init();
        };

        UserValidationCtl.prototype =
            {
                init: function () {
                    this.bindEvent();
                },
                bindEvent: function () {
                    var self = this;
                    self.SubBtn.unbind("click");
                    self.SubBtn.click(function () {
                        if (checkForm()) {
                            self.ViewModel.setterBus($(self.Company).val(), self.Font, self.Back, self.LoginUser.DDUserId, $(self.Contact).val())
                            self.ViewModel.setBussinessCard(function (rst) {
                                if (rst.Data.STATE == 0) {
                                    window.location.href = SysUrl.getUrl("/Users/ValidateInfo/NavFollowSeries");
                                }
                                else {
                                    errorInfo("信息提交出错，出错原因 " + rst.Data.MSG);
                                }
                            });
                        }
                    });

                    function errorInfo(msg) {
                        var msgbox = {
                            title: "名片认证提示!",
                            desc: msg,
                            button: {
                                enterBtn: {
                                    visable: true,
                                    text: '确定',
                                }
                            }
                        }
                        var cus = new Common.CustDialog(msgbox);
                        cus.showNoCertDialog();
                    }

                    //Local Event 
                    function checkForm(form) {
                        var user = self.CertState;
                        if (user === "Waiting") {
                            return errorInfo("正在认证中，无需再次申请");
                        }

                        if (user === "Success") {
                            return errorInfo("已通过认证，无需再次申请");
                        }

                        var obj = $("#CompanyName");
                        var val = obj.val();
                        if (!val || val.length < 1) {
                            return errorInfo("公司名称", obj);
                        }

                        obj = $("#Contact").val();
                        var placeholder = $("#Contact").attr("placeholder");
                        if (obj == self.LoginUser.UserName) {
                            return errorInfo("您的推荐人不能是自己。", obj);
                        }
                        if (obj == placeholder) {
                            self.Contact = "";
                        }

                        if (self.Font == false) {
                            return errorInfo("请上传名片正面图片。", obj);
                        }

                        if (self.Back == false) {
                            return errorInfo("请上传名片反面图片。", obj);
                        }
                        return true;
                    }

                }
            }
        return UserValidationCtl;
    });