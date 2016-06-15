define(["jquery", "jquerynotify", "../utils/SysUrl", 'jqueryhisotry', 'NavibarCtl',
    '../utils/Common', '../utils/ModelDailog',
    "../utils/SysConfig", "../moduler/rs_NewRequire", "../viewmodel/NewRequireViewModel",
    "../viewmodel/SmsRulesViewModel", "../viewmodel/Require_QuoteViewModel"],
    function ($, jquerynotify, SysUrl, jqueryhisotry, NavibarCtl, Common, ModelDailog, SysConfig,
        rs_NewRequire, NewRequireViewModel, SmsRulesViewModel, Require_QuoteViewModel) {
        var DeliverCtl = function (user, geolocation, requireid) {
            //百度gps
            this.GeoLocation = geolocation;
            //求购控件列表
            this.BoardSpec = $(".board-spec");
            this.PipeSpec = $('.pipe-spec');
            this.BarSpec = $('.bar-spec');

            this.LoginUser = user;
            //求购模型
            this.NewRqModel = new NewRequireViewModel();
            //当前求购列表

            //获取当前规则模型
            this.RuleModel = new SmsRulesViewModel();

            //当前找货详情
            this.RequireModel = new Require_QuoteViewModel();

            this.newRequirelst = [];

            //地址
            this.Address = { city: "", province: "", district: '' };

            //经度
            this.CurrentLt = "31.57003745";
            //纬度
            this.CurrentLg = "120.30545590";

            this.currentRequireId = "";
            this.Ptboardserial = '';

            this.Ptboardserial = "";
            this.Ptpieserial = "";
            this.Ptbarserial = "";
            //Serial ID
            this.Ptpieserialid = '';
            this.Ptbarserialid = '';
            this.Rules = [];
            //Navivar 菜单栏位
            this.navibar = new NavibarCtl(user);
            if (typeof requireid != undefined) {
                this.currentRequireId = requireid;
            }
            this.init();
            this.queryRules();
        }
        DeliverCtl.prototype = {
            init: function () {
                var self = this;
                self.navibar.isIdentify();
                self.navibar.buildNavibar();
                self.RuleModel.setter(self.LoginUser.DDUserId, 'A');
                //GPS location定位
                var geolocation = new BMap.Geolocation();
                self.GeoLocation.getCurrentPosition(function (r) {
                    if (this.getStatus() == BMAP_STATUS_SUCCESS) {
                        self.CurrentLt = r.latitude;
                        self.CurrentLg = r.longitude;
                        self.Address = r.address;
                    }
                }, { enableHighAccuracy: true });
                self.newRequirelst = [];
            },
            queryRules: function () {
                var self = this;

                self.RuleModel.getRules(function (rst) {
                    if (rst.isSuccess == true) {
                        self.Rules = rst.Data.RULES;
                        initialSeries();
                        if (self.currentRequireId != "") {
                            self.setDefault();
                        }
                    }
                });

                function initialSeries() {
                    //板材
                    var reboard = new RegExp(window.SysInfo.SeriesSupport.Board);
                    $(".board-spec>.SERIES").each(function (i, item) {
                        for (var i = 0; i < self.Rules.length; i++) {
                            if (reboard.test(self.Rules[i].ID) == true) {
                                $(item).append($('<option>', {
                                    value: self.Rules[i].ID,
                                    text: self.Rules[i].NAME,
                                }));
                            }
                        }
                    });
                    //binding change event.
                    self.boardEvent();
                    for (var i = 0; i < self.Rules.length; i++) {
                        if (reboard.test(self.Rules[i].ID) == true) {
                            {
                                self.Ptboardserial += "<option value='" + self.Rules[i].ID + "'>" + self.Rules[i].NAME + "</option>";
                            }
                        }
                    }

                    //管材
                    var rePie = new RegExp(window.SysInfo.SeriesSupport.Pipe);
                    $(".pipe-spec>.MATERIAL").each(function (i, item) {
                        for (var i = 0; i < self.Rules.length; i++) {
                            if (rePie.test(self.Rules[i].ID) == true) {
                                self.Ptpieserialid = self.Rules[i].ID;
                                $(".pipe-spec>.SERIES").val(self.Ptpieserialid);
                                initialSeriesch(item, self.Rules[i].MATERIALS);
                                for (var j = 0; j < self.Rules[i].MATERIALS.length; j++) {
                                    self.Ptpieserial += "<option value='" + self.Rules[i].MATERIALS[j].ID + "'>" + self.Rules[i].MATERIALS[j].NAME + "</option>";
                                }
                            }
                        }
                    });

                    //棒材
                    var reBar = new RegExp(window.SysInfo.SeriesSupport.Bar);
                    $(".bar-spec>.MATERIAL").each(function (i, item) {
                        for (var i = 0; i < self.Rules.length; i++) {
                            if (reBar.test(self.Rules[i].ID) == true) {
                                self.Ptbarserialid = self.Rules[i].ID;
                                $(".bar-spec>.SERIES").val(self.Ptbarserialid);
                                initialSeriesch(item, self.Rules[i].MATERIALS);
                                for (var j = 0; j < self.Rules[i].MATERIALS.length; j++) {
                                    self.Ptbarserial += "<option value='" + self.Rules[i].MATERIALS[j].ID + "'>" + self.Rules[i].MATERIALS[j].NAME + "</option>";
                                }
                            }
                        }
                    });
                }

                function initialSeriesch(element, childcol) {
                    for (var i = 0; i < childcol.length; i++) {
                        $(element).append($('<option>', {
                            value: childcol[i].ID,
                            text: childcol[i].NAME,
                        }));
                    }
                }
                self.bindEvent();
            },
            setDefault: function () {
                var self = this;
                self.RequireModel.setter(self.LoginUser.DDUserId, self.currentRequireId);
                self.RequireModel.getRequireDetail(function (rst) {
                    if (rst.Data.STATE == 0) {
                        //板材
                        var reboard = new RegExp(window.SysInfo.SeriesSupport.Board);
                        //管材
                        var rePie = new RegExp(window.SysInfo.SeriesSupport.Pipe);
                        //棒材
                        var reBar = new RegExp(window.SysInfo.SeriesSupport.Bar);
                        if (reboard.test(rst.Data.SERIESID)) {
                            self.boardEvent();
                            setDefaultValue($(".board-spec"), rst.Data);
                            SetActive($("#find-board"));
                            $("#board-form").show();
                            $("#pipe-form").hide();
                            $("#bar-form").hide();
                        }
                        else if (rePie.test(rst.Data.SERIESID)) {
                            setDefaultValue($(".pipe-spec"), rst.Data);
                            SetActive($("#find-pipe"));
                            $("#board-form").hide();
                            $("#pipe-form").show();
                            $("#bar-form").hide();
                        }
                        else if (reBar.test(rst.Data.SERIESID)) {
                            setDefaultValue($(".bar-spec"), rst.Data);
                            SetActive($("#find-bar"));
                            $("#board-form").hide();
                            $("#pipe-form").hide();
                            $("#bar-form").show();
                        }

                        function setDefaultValue(pelement, Data) {
                            $(pelement).find(".SERIES").val(rst.Data.SERIESID).change();
                            $(pelement).find(".MATERIAL option").each(function (i, item) {
                                if ($(item).text() == rst.Data.MATERIAL) {
                                    $(pelement).find(".MATERIAL").val($(item).val()).change();
                                }
                            });
                            $(pelement).find(".SURFACE option").each(function (i, item) {
                                if ($(item).text() == rst.Data.SURFACE) {
                                    $(pelement).find(".SURFACE").val($(item).val()).change();
                                }
                            });
                            $(pelement).find(".DELIVERY").val(rst.Data.DELIVERY);
                            $(pelement).find(".DETAIL").val(rst.Data.DETAIL);
                            $(pelement).find(".EXTRA").val(rst.Data.SURFACE);
                        }
                        //tab
                        function SetActive(tab) {
                            $(".tab-find-ul").find("li").removeClass("active");
                            $(tab).addClass("active");
                        }
                    }
                });
            },
            boardEvent: function () {
                var self = this;
                //Check IE 8 Place Holder
                Common.PlaceHolder();
                //----------------
                //Compare function
                function compare(a, b) {
                    if (a.NAME > b.NAME) {
                        return 1;
                    }
                    else if (a.NAME < b.NAME) {
                        return -1;
                    }
                    return 0;
                }

                //动态加载子系列
                $(".board-spec>.SERIES").change(function () {
                    var currentseries = $(this).val();
                    $(this).parent().find('.MATERIAL').empty();
                    $(this).parent().find('.MATERIAL').append('<option value="">材质</option>');

                    $(this).parent().find('.SURFACE').empty();
                    $(this).parent().find('.SURFACE').append('<option value="">表面</option>');


                    for (var j = 0; j < self.Rules.length; j++) {
                        if (self.Rules[j].ID == currentseries) {
                            for (var k = 0; k < self.Rules[j].MATERIALS.length; k++) {
                                $(this).parent().find('.MATERIAL').append($('<option>', {
                                    value: self.Rules[j].MATERIALS[k].ID,
                                    text: self.Rules[j].MATERIALS[k].NAME,
                                }));
                            }
                            //surface
                            self.Rules[j].SURFACES.sort(compare);
                            for (var m = 0; m < self.Rules[j].SURFACES.length; m++) {
                                $(this).parent().find('.SURFACE').append($('<option>', {
                                    value: self.Rules[j].SURFACES[m].ID,
                                    text: self.Rules[j].SURFACES[m].NAME,
                                }));
                            }
                        }
                    }
                });
            },
            bindEvent: function () {
                var self = this;
                //各html标签事件
                $(".btn-newrequire").click(function (e) {
                    if (!self.navibar.IsValidate) {
                        $(this).notify("手机号未绑定，请到“设置”->“账号绑定处”,或单击我跳转。", { position: "bottom", className: "info" });
                        $(this).parent().find(".notifyjs-container").click(function () {
                            window.open(SysUrl.getUrl("Users/Setting/BindMobile"), "_blank");
                        });
                        e.preventDefault();
                        return;
                    }
                    else if (!self.navibar.Cert_Pass) {
                        $(this).notify("您的资料未通过审核，请到“会员中心”->“认证” 重新认证,或单击我跳转。", { position: "bottom", className: "info" });
                        $(this).parent().find(".notifyjs-container").click(function () {
                            window.open(SysUrl.getUrl("Users/ValidateInfo/BaseInfo?type=D"), "_blank");
                        });
                        e.preventDefault();
                        return;
                    }
                    else if (!self.navibar.Cert_Done) {
                        $(this).notify("您当前未进行认证”->“认证” 去认证,或单击我跳转。", { position: "bottom", className: "info" });
                        $(this).parent().find(".notifyjs-container").click(function () {
                            window.open(SysUrl.getUrl("Users/ValidateInfo/BaseInfo?type=D"), "_blank");
                        });
                        e.preventDefault();
                        return;
                    }
                    else if (!self.navibar.Cert_Doing) {
                        $(this).notify("您的资料正在审核中，请耐心等待”->“认证” 去查看,或单击我跳转。", { position: "bottom", className: "info" });
                        $(this).parent().find(".notifyjs-container").click(function () {
                            window.open(SysUrl.getUrl("Users/ValidateInfo/BaseInfo?type=D"), "_blank");
                        });
                        e.preventDefault();
                        return;
                    }
                    self.sendRequire(this);
                });

                $('.findD-main').unbind('click');
                $(".findD-main").click(function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                });

                $("#find-board").click(function () {
                    var ca = $(this);
                    $("#board-form").show();
                    $("#pipe-form").hide();
                    $("#bar-form").hide();
                    clearActive(ca);
                    return false;
                });

                $("#find-pipe").click(function () {
                    var ca = $(this);
                    $("#board-form").hide();
                    $("#pipe-form").show();
                    $("#bar-form").hide();
                    clearActive(ca);
                    return false;
                });

                $("#find-bar").click(function () {
                    var ca = $(this);
                    $("#board-form").hide();
                    $("#pipe-form").hide();
                    $("#bar-form").show();
                    clearActive(ca);
                    return false;
                });

                //模拟tab
                function clearActive(ca) {
                    $(".tab-find-ul").find("li").removeClass("active");
                    $(ca).addClass("active");
                }

                function getAddress(btn) {
                    var address = null;
                    var firstlement = $(btn).closest("form").find('.find-num').first();
                    if ($(firstlement).find(".DELIVERY").val().length > 0) {
                        address = firstlement.find(".DELIVERY").val();
                    }
                    else {
                        if (self.Address.city != "") {
                            address = self.Address.city;
                        }
                    }
                    return address;
                }


                $(".btn-board").unbind("click");
                $(".btn-board").click(function () {
                    var address = getAddress(this);
                    self.addboardSpec(address);
                    self.showDel();
                });

                $(".btn-pipe").unbind("click");
                $(".btn-pipe").click(function () {
                    var address = getAddress(this);
                    self.addpipeSpec(address);
                    self.showDel();
                });

                $(".btn-bar").unbind("click");
                $(".btn-bar").click(function () {
                    var address = getAddress(this);
                    self.addbarSpec(address);
                    self.showDel();
                });
            },
            validedModel: function (element) {
                var self = this;
                //Get Form
                var form = $(element).closest("form");
                //initial object;
                var model = $.extend({}, rs_NewRequire.Req);

                //获取Serilid
                var delay = 3000;
                var hide = 200;
                var seriesid = "";
                var serelement = $(element).find(".SERIES");
                var matelement = $(element).find(".MATERIAL");
                var delielement = $(element).find(".DELIVERY");
                var surelement = $(element).find(".SURFACE");
                var extra = $(element).find(".EXTRA");
                var detail = $(element).find(".DETAIL");

                //Set Value
                model.USERID = self.LoginUser.DDUserId;
                model.SERIES = serelement.val();
                model.MATERIAL = matelement.val();
                model.SURFACE = surelement.val();
                model.EXPIRES = 0;
                model.EXTRA = (extra.val() == extra.attr("placeholder")) ? "" : extra.val();
                model.DETAIL = (detail.val() == detail.attr("placeholder")) ? "" : detail.val();

                model.LOCATION = self.CurrentLt + ',' + self.CurrentLg + ',' +
                    '[' + self.Address.province + ',' + self.Address.city + ',' + self.Address.district + ',' + 'ADDR' + ']';
                model.DELIVERY = (delielement.val() == delielement.attr("placeholder")) ? "" : delielement.val();

                var validaterst = true;
                if (model.DELIVERY == "" || model.MATERIAL == "" || model.DETAIL == "") {

                    if (model.DELIVERY == "") {
                        if ($(form).css("display") == "block") {
                            delielement.notify("填写交货地址.", { position: "right", autoHideDelay: delay, hideDuration: hide });
                        }
                    }
                    if (model.MATERIAL == "") {
                        if ($(form).css("display") == "block") {
                            matelement.notify("请选择材质/种类.", { position: "bottom", autoHideDelay: delay, hideDuration: hide });
                        }
                    }
                    if (model.DETAIL == "") {
                        if ($(form).css("display") == "block") {
                            detail.notify("请注明求购明细.", { position: "right", autoHideDelay: delay, hideDuration: hide });
                        }
                    }
                    validaterst = false;
                }
                //Board form
                if ($(form).attr("id") == "board-form") {
                    if (model.SERIES == "") {
                        validaterst = false;
                        if ($(form).css("display") == "block") {
                            serelement.notify("请选择系列.", { position: "bottom", autoHideDelay: delay, hideDuration: hide });
                        }
                    }
                    if (model.SURFACE == "") {
                        validaterst = false;
                        if ($(form).css("display") == "block") {
                            surelement.notify("请选择表面", { position: "right", autoHideDelay: delay, hideDuration: hide });
                        }
                    }
                }


                if ($(form).attr("id") == "pipe-form" && model.EXTRA == "") {
                    validaterst = false;
                    if ($(form).css("display") == "block") {
                        extra.notify("请填写材质要求", { position: "right", autoHideDelay: delay, hideDuration: hide });
                    }
                }

                if ($(form).attr("id") == "bar-form" && model.EXTRA == "") {
                    if ($(form).css("display") == "block") {
                        extra.notify("请填写材质要求", { position: "right", autoHideDelay: delay, hideDuration: hide });
                    }
                    validaterst = false;
                }

                if (!validaterst) {
                    return null;
                }
                return model;

            },
            //添加板材
            addboardSpec: function (address) {
                var self = this;
                var html = '<p class="find-num board-spec">' +
                    '<select class="SERIES">' +
                    '<option value="">请选择系列</option>' + self.Ptboardserial +
                    '</select>' +
                    '<select class="MATERIAL">' +
                    '<option value="">材质</option>' +
                    '</select>' +
                    '<select class="SURFACE">' +
                    '<option value="">表面</option>';
                if (address == null) {
                    html += '</select><input class="DELIVERY find-delivery" maxlength="8" type="text" placeholder="交货地，如无锡"   />';
                }
                else {
                    html += '</select><input class="DELIVERY find-delivery" maxlength="8" type="text" placeholder="交货地，如无锡" value=' + address + ' />';
                }
                html += '<input class="DETAIL find-note" type="text" placeholder="请输入求购明细，按顺序如“5.0*1500*C/20吨/太钢”" /> ' +
                    '<i class="iconfont icon-roundclose btn-del"></i></p>';
                $(html).insertAfter($(".board-spec").last());
                self.boardEvent();
            },

            //添加管材
            addpipeSpec: function (address) {
                var self = this;
                var html = '<p class="find-num pipe-spec">' +
                    '<input type="hidden" class="SERIES" value="' + self.Ptpieserialid + '" /> ' +
                    '<select class="MATERIAL">' +
                    '<option value="">请选择种类</option>' + self.Ptpieserial +
                    '</select>' +
                    '<input class="EXTRA find-requi" type="text" placeholder="材质要求"   />';
                if (address == null) {
                    html += '<input class="DELIVERY find-delivery" maxlength="8"  type="text" placeholder="交货地，如无锡"   />';
                }
                else {
                    html += '<input class="DELIVERY find-delivery" maxlength="8" type="text" placeholder="交货地，如无锡" value=' + address + ' />';
                }
                html += ' <input class="DETAIL find-bang" type="text" placeholder="请输入求购明细，如“20*2.0/青山”" />' +
                    '<i class="iconfont icon-roundclose btn-del"></i></p>';
                $(html).insertAfter($(".pipe-spec").last());
            },

            //添加棒材
            addbarSpec: function (address) {
                var self = this;
                var html = '<p class="find-num bar-spec">' +
                    '<input type="hidden" class="SERIES" value="' + self.Ptbarserialid + '" /> ' +
                    '<select class="MATERIAL">' + self.Ptbarserial +
                    '</select>' +
                    '<input class="EXTRA find-requi" type="text" placeholder="材质要求"   />';
                if (address == null) {
                    html += '<input class="DELIVERY find-delivery" maxlength="8" type="text" placeholder="交货地，如无锡"   />';
                }
                else {
                    html += '<input class="DELIVERY find-delivery" maxlength="8" type="text" placeholder="交货地，如无锡" value=' + address + ' />';
                }
                html += '<input class="DETAIL find-bang" type="text" placeholder="请输入求购明细，如“Φ22/青山”" />' +
                    '<i class="iconfont icon-roundclose btn-del" ></i></p>';
                $(html).insertAfter($(".bar-spec").last());
            },
            //显示除第一个以外的删除按钮
            showDel: function () {
                function VisableDelbtn() {
                    $("#board-form .btn-del").css("display", "none");
                    if ($("#board-form .btn-del").length > 1) {
                        $("#board-form .btn-del").css("display", "block");
                    }

                    $("#pipe-form .btn-del").css("display", "none");
                    if ($("#pipe-form .btn-del").length > 1) {
                        $("#pipe-form .btn-del").css("display", "block");
                    }

                    $("#bar-form .btn-del").css("display", "none");
                    if ($("#bar-form .btn-del").length > 1) {
                        $("#bar-form .btn-del").css("display", "block");
                    }
                }

                VisableDelbtn();
                //删除事件
                $(".btn-del").click(function (event) {
                    $(this).closest("p").remove();
                    VisableDelbtn();
                });
            },
            sendRequire: function (element) {
                var self = this;
                var IsCondition = true;
                self.newRequirelst = [];

                //赋值
                function setvalue(element) {
                    var model = self.validedModel(element);
                    if (model != null) {
                        self.newRequirelst.push(model);
                    }
                    else
                        IsCondition = false;
                }

                var anayzeType = "";
                var sbformid = $(element).closest('form').attr('id');
                var boardelement;
                if (sbformid == "board-form") {
                    anayzeType = "板材";
                    boardelement = $(".board-spec");
                    $(".board-spec").each(function (i, item) {
                        setvalue(item);
                    });
                }

                if (sbformid == "pipe-form") {
                    anayzeType = "管材";
                    boardelement = $(".pipe-spec");
                    $(".pipe-spec").each(function (i, item) {
                        setvalue(item);
                    });
                }

                if (sbformid == "bar-form") {
                    anayzeType = "棒材";
                    boardelement = $(".bar-spec");
                    $(".bar-spec").each(function (i, item) {
                        setvalue(item);
                    });
                }

                if (self.newRequirelst.length == 0 || !IsCondition) {
                    return;
                }

                var sendcount = 0;
                var sendLst = [];
                var scrolltop = $(document).scrollTop();

                self.NewRqModel.setterlst(self.newRequirelst);
                self.NewRqModel.newRequirelst(function (rst) {
                    sendcount += 1;
                    if (rst.Data.STATE == 0) {
                        sendLst.push(rst.Data.REQUIREID);
                    }
                    if (sendcount == self.newRequirelst.length) {
                        //诸葛io日志记录
                        Common.WriteAnalyze("买家求购", { "求购类型": anayzeType, "求购数量": sendcount });
                        //消息提示
                        if (sendLst.length == sendcount) {
                            var msg = {
                                title: "求购信息发送成功",
                                desc: '本次共提交' + sendLst.length.toString() + '求购信息。',
                                button: {
                                    cleanBtn: {
                                        visable: true,
                                        text: '返回',
                                        OnCancel: function () {
                                            self.resetDeliver(boardelement);
                                        },
                                    },
                                    enterBtn: {
                                        text: '查看找货单',
                                        url: '',
                                        onConfrim: function () {
                                            window.open(SysUrl.getUrl("/DGoods/Deliver/Finding"), "_self");
                                        }
                                    },
                                    extendBtn:
                                    {
                                        visable: true,
                                        text: '推荐找货',
                                        url: '',
                                        OnExtendClick: function () {
                                            //诸葛io日志记录
                                            Common.WriteAnalyze("推荐找货", { "求购类型": anayzeType, "求购数量": sendcount });
                                            self.postToRmd(sendLst);
                                        },
                                    }
                                }
                            };
                            var cus = new Common.CustDialog(msg);
                            cus.showNoCertDialog();
                        }
                        else {
                            var msg = {
                                title: "求购信息发送成功",
                                desc: '本次共提交' + sendLst.length.toString() + '求购信息。' + " 失败" + (sendcount - sendLst.length) + "条找货信息。",
                                button: {
                                    cleanBtn: {
                                        visable: true,
                                        text: '返回',
                                        OnCancel: function () {
                                            self.resetDeliver(boardelement);
                                        },
                                    },
                                    enterBtn: {
                                        text: '查看找货单',
                                        url: '',
                                        onConfrim: function () {
                                            window.open(SysUrl.getUrl("/DGoods/Deliver/Finding"), "_self");
                                        }
                                    },
                                    extendBtn:
                                    {
                                        visable: true,
                                        text: '推荐找货',
                                        url: '',
                                        OnExtendClick: function () {
                                            self.postToRmd(sendLst);
                                        },
                                    }
                                }
                            };
                            var cus = new Common.CustDialog(msg);
                            cus.showNoCertDialog();
                        }
                    }
                });
            },
            resetDeliver: function (boardelement) {
                $(boardelement).each(function (i, item) {
                    if (i >= 1) {
                        $(item).remove();
                    }
                    $(item).find(".SERIES").val("");
                    $(item).find(".MATERIAL").val("");
                    $(item).find(".SURFACE").val("");
                    $(item).find(".DELIVERY").val("");
                    $(item).find(".DETAIL").val("");
                    $(item).find(".EXTRA").val("");
                });
            },
            postToRmd: function (lst) {
                var form = document.createElement("form");
                form.action = SysUrl.getUrl("/DGoods/VieOrder/RmdOrder");
                form.method = "post";
                form.target = "_self";
                for (var i = 0; i < lst.length; i++) {
                    var input = document.createElement("textarea");
                    input.id = "requireid[" + i.toString() + "]";
                    input.name = "requireid[" + i.toString() + "]";
                    input.value = lst[i];
                    form.appendChild(input);
                }
                form.style.display = 'none';
                document.body.appendChild(form);
                form.submit();
            }
        };
        return DeliverCtl;
    });
