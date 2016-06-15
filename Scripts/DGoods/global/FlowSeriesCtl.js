define(['jquery', "jquerytmpl", "jquerynotify", 'NavibarCtl', "../utils/CreateObject",
    "../utils/SysUrl", "../viewmodel/SmsRulesViewModel",
    "../viewmodel/RulesInfoViewModel", "../moduler/rs_SmsCode_Rules"],
    function (jquery, jquerytmpl, jquerynotify, NavibarCtl, CreateObject,
        SysUrl, SmsRulesViewModel, RulesInfoViewModel, rs_SmsCode_Rules) {
        function FlowSeriesCtl(user) {
            this.LoginUser = user;
            //序列
            this.RulesViewModel = new SmsRulesViewModel();

            //修改订阅模型
            this.RuleInfoVModel = new RulesInfoViewModel();

            this.CurrentSelectStr = {};

            //当前选中的序列
            this.CurrentSelectRules = [];

            //当前所有序列
            this.CurrentTotollyRules = [];

            this.SeriesTemplate = $("#SeriesTemplate");
            this.AfterSeriesTemplate = $("#AfterSeriesTemplate");
            this.LbRmdBefore = "#rmd-before";
            this.LbRmdAfter = "#rmd-after";
            this.navibar = new NavibarCtl(this.LoginUser);
            this.IsChanged = false;
            this.init();
            this.querySeries();
        };

        FlowSeriesCtl.prototype = {
            init: function () {
                var self = this;
                // self.navibar.isIdentify();
                self.navibar.buildNavibar();
                $('.FollowSeries').first().closest('dd').addClass('active');
            },
            querySeries: function () {
                var self = this;
                self.RulesViewModel.setter(self.LoginUser.DDUserId, 'A');
                self.RulesViewModel.getRules(function (rst) {
                    if (rst.isSuccess == true) {

                        self.CurrentTotollyRules = { SERIES: rst.Data.RULES };
                        self.CurrentSelectStr = {
                            SERIES: rst.Data.SERIES.split(','),
                            MATERIAL: rst.Data.MATERIAL.split(','),
                            SURFACE: rst.Data.SURFACE.split(',')
                        };
                        self.setDefaultRules();
                        self.SeriesTemplate.tmpl(self.CurrentSelectRules).appendTo(self.LbRmdBefore);
                        self.AfterSeriesTemplate.tmpl(self.CurrentTotollyRules).appendTo(self.LbRmdAfter);
                    }
                    self.bindEvent();
                });
            },
            setDefaultRules: function () {
                var self = this;
                var serieslst = [];
                for (var i = 0; i < self.CurrentSelectStr.SERIES.length; i++) {
                    for (var j = 0; j < self.CurrentTotollyRules.SERIES.length; j++) {
                        if (self.CurrentTotollyRules.SERIES[j].ID == self.CurrentSelectStr.SERIES[i]) {
                            self.CurrentTotollyRules.SERIES[j].IsActive = "active";
                            var series = $.extend({}, self.CurrentTotollyRules.SERIES[j]);
                            series.MATERIALS = setMaterialToSelected(self.CurrentSelectStr.MATERIAL, self.CurrentTotollyRules.SERIES[j]);
                            series.SURFACES = setSurfaceToSelected(self.CurrentSelectStr.SURFACE, self.CurrentTotollyRules.SERIES[j]);
                            serieslst.push(series);
                        }
                    }
                }
                self.CurrentSelectRules = { SERIES: serieslst };

                function setMaterialToSelected(materials, currentseries) {
                    var materiallst = [];
                    for (var i = 0; i < materials.length; i++) {
                        for (var j = 0; j < currentseries.MATERIALS.length; j++) {
                            if (currentseries.MATERIALS[j].ID == materials[i]) {
                                currentseries.MATERIALS[j].IsActive = "active";
                                var material = $.extend({}, rs_SmsCode_Rules.RspRulesDetail);
                                material = currentseries.MATERIALS[j];
                                materiallst.push(material);
                            }
                        }
                    }
                    return materiallst;
                }

                function setSurfaceToSelected(surfaces, currentseries) {
                    var surfacelst = [];
                    for (var i = 0; i < surfaces.length; i++) {
                        for (var j = 0; j < currentseries.SURFACES.length; j++) {
                            if (currentseries.SURFACES[j].ID == surfaces[i]) {
                                currentseries.SURFACES[j].IsActive = "active";
                                var surface = $.extend({}, rs_SmsCode_Rules.RspRulesDetail);
                                surface = currentseries.SURFACES[j];
                                surfacelst.push(surface);
                            }
                        }
                    }
                    return surfacelst;
                }
            },
            bindEvent: function () {
                var self = this;
                self.checkStates();

                $(".btn-modify").css("display", "block");
                $(".btn-modify").click(function () {
                    $(".btn-modify").hide();
                    $("#rmd-before").hide();
                    $(".btn-deter").show();
                    $("#rmd-after").show();
                });

                $(".btn-deter").click(function () {
                    self.getRuleSeries();
                    self.saveRules();
                    if ($(".btn-modify")[0] != undefined && self.CurrentSelectRules.SERIES.length > 0) {
                        $(".btn-modify").show();
                        $("#rmd-before").show();

                        $(".btn-deter").hide();
                        $("#rmd-after").hide();
                    }
                    self.IsChanged = false;
                });


                $(".btn-nav").unbind("click");
                $(".btn-nav").click(function () {
                    window.open(SysUrl.getUrl("DGoods/VieOrder/Quoted"), "_self");
                });


                //点击系列关注变更状态
                $(".btn-add-fol").click(function () {
                    self.IsChanged = true;
                    var hasactive = $(this).closest(".rmd-list").hasClass("active");
                    if (hasactive) {
                        $(this).val("取消关注");
                        $(this).closest(".rmd-list").removeClass("active");
                        self.setStates($(this).closest(".rmd-list").find(".rmd-list-right"), true);
                    }
                    else {
                        $(this).val("+关注");
                        $(this).closest(".rmd-list").addClass("active");
                        self.setStates($(this).closest(".rmd-list").find(".rmd-list-right"), false);
                    }
                });


                //点击 材质 变更状态，只有当关注之后才可以变更选择状态
                $("#rmd-after .rmd-list-right li").click(function () {
                    var liActive = $(this).hasClass("active");
                    //调整状态
                    self.IsChanged = true;
                    if (liActive == true) {
                        $(this).removeClass("active");
                    }
                    else {
                        $(this).addClass("active");
                    }
                    self.checkStates();
                });

                if (self.CurrentSelectRules.SERIES.length == 0) {
                    $(".btn-modify").hide();
                    $("#rmd-before").hide();
                    $(".btn-deter").show();
                    $("#rmd-after").show();
                }
            },
            setStates: function (lstitem, isActive) {
                var hasactive = false;
                var ulitem = $(lstitem).find("ul");
                var hasactive = false;
                ulitem.each(function (chi, chitem) {
                    if (isActive) {
                        $(chitem).find('li').addClass(" active");
                    }
                    else {
                        $(chitem).find('li').removeClass(" active");
                    }
                });
                return hasactive;
            },
            getStates: function (lstitem) {
                var hasactive = false;
                var ulitem = $(lstitem).find("ul");
                var hasactive = false;
                ulitem.each(function (chi, chitem) {
                    if ($(chitem).find('li').hasClass("active")) {
                        hasactive = true;
                    }
                });
                return hasactive;
            },
            checkStates: function () {
                var self = this;
                $('#rmd-after .rmd-list').each(function (i, item) {
                    var hasactive = self.getStates(item);
                    if (hasactive == true) {
                        $(item).find(".btn-follow").val("取消关注");
                        $(this).closest(".rmd-list").removeClass("active");
                    }
                    else {
                        $(item).find(".btn-follow").val("+关注");
                        $(this).closest(".rmd-list").addClass("active");
                    }
                });
            },
            getRuleSeries: function () {
                var self = this;
                var serieslst = [];
                var materiallst = [];
                var surfacelst = [];

                var selectedcontrol = $("#rmd-after .rmd-list-right li[class$='active']");
                var seriesControl = $(selectedcontrol).closest(".rmd-list");
                for (var i = 0; i < seriesControl.length; i++) {
                    var data = $(seriesControl[i]).attr("data-id")
                    var exist = false;
                    for (var i = 0; i < serieslst.length; i++) {
                        if (serieslst[i] == data) {
                            exist = true;
                            break;
                        }
                    }
                    if (!exist) {
                        serieslst.push(data);
                    }
                }
                for (var j = 0; j < selectedcontrol.length; j++) {

                    var data = $(selectedcontrol[j]).attr("data-id")
                    if ($(selectedcontrol[j]).hasClass("MATERIAL")) {
                        materiallst.push(data);
                    }
                    else if ($(selectedcontrol[j]).hasClass("SURFACE")) {
                        surfacelst.push(data);
                    }
                }

                //获取选中项
                self.CurrentSelectStr =
                    {
                        SERIES: serieslst,
                        MATERIAL: materiallst,
                        SURFACE: surfacelst
                    };
            },
            saveRules: function () {
                var self = this;
                if (!self.IsChanged) {
                    return;
                }

                //赋予关注
                self.setDefaultRules();
                self.RuleInfoVModel.setter(self.LoginUser.DDUserId,
                    self.CurrentSelectStr.SERIES.join(),
                    self.CurrentSelectStr.MATERIAL.join(),
                    self.CurrentSelectStr.SURFACE.join()
                );
                self.RuleInfoVModel.setRulesInfo(function (rst) {
                    if (rst.Data.STATE == 0) {
                        //更新显示
                        if ($(".btn-modify")[0] != undefined) {
                            if (self.CurrentSelectRules.SERIES.length == 0) {
                                $(".btn-deter").notify("您的关注品类修改成功", "success");
                            }
                            else {
                                $(".btn-modify").notify("您的关注品类修改成功！", "success");
                            }
                        }
                        else {
                            $(".btn-deter").notify("您的关注品类保存成功！", "success");
                        }
                        $(self.LbRmdBefore).empty();
                        self.SeriesTemplate.tmpl(self.CurrentSelectRules).appendTo(self.LbRmdBefore);
                        self.checkStates();

                    }
                });

            }
        };
        return FlowSeriesCtl;
    });