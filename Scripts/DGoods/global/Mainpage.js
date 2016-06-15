define(['jquery', "../utils/Common", '../utils/SysUrl',
    '../utils/SysConfig', '../viewmodel/ModuleBase', "SocketClientCtl"],
    function ($, Common, SysUrl, SysConfig, ModuleBase, SocketClientCtl) {

        function IsDDRoot() {
            if (window.location.pathname.indexOf("DGoods") > -1) {
                return true;
            }
            return false;
        }

        //Ajax load
        $(document).ajaxStart(function () {
            if (IsDDRoot()) {
                var loadinghtml = '<div class="sys-loading" style="top: 50%; left: 50%;z-index: 101;position:absolute;' +
                    'background-image: url(/Content/users/images/loading.gif);background-repeat: no-repeat;' +
                    'height: 74px;width: 74px;"> </div>';
                $(loadinghtml).insertAfter('body');
            }
        }).ajaxStop(function () {
            if (IsDDRoot()) {
                $('.sys-loading').fadeOut(2000, function () { $(this).remove(); });
            }
        });

        //Popu Menu Event
        $(function () {
            if (!IsDDRoot()) {
                return false;
            }

            $(".global_find_list").hover(function () {
                $(".global_find_menu_dl").show();
                $(this).addClass("bor");
            }, function () {
                $(".global_find_menu_dl").hide();
                $(this).removeClass("bor");
            });
            $(".global_find_menu_dl").hover(function () {
                $(this).show();
                $(".global_find_list").addClass("bor");
            }, function () {
                $(this).hide();
                $(".global_find_list").removeClass("bor");
            });

            //设置header栏位状态
            $('.global_header-wrapper-menu-item').find('a')
                .each(function (i, item) {
                    if ($(item).attr("data-url").indexOf("DGoods") != -1) {
                        $(item).addClass(" active");
                    }
                });

            //IE 8默认文案显示
            Common.PlaceHolder();

            //当滚动条的位置处于距顶部100像素以下时，跳转链接出现，否则消失  
            //滑动判断，菜单特效
            $(window).scroll(function () {
                var h_num = $(window).scrollTop();
                if (h_num > 360) {
                    $('#return_top').show(200);
                } else {
                    $('#return_top').hide(200);
                }
            });
            //当点击跳转链接后，回到页面顶部位置  
            $("#return_top").click(function () {
                $('body,html').animate({ scrollTop: 0 }, 1000);
                return false;
            });



            //显示用户信息
            $(".account-welcome").hover(function () {
                $(this).addClass("infoHover");
            }, function () {
                $(this).removeClass("infoHover");
            });


            //关闭&显示右侧边栏 + 清空找货Active 状态

            $(".work_slide-main-close").click(function () {
                var slide = $(this).parent().parent();
                if (slide.hasClass("isclose")) {
                    slide.removeClass("isclose");
                } else {
                    slide.addClass("isclose");
                }
            });



            if ($("#cartCount").length) {
                $.post("/Cart/GetCartCount", function (data) {
                    if (data.Code == 1 && data.CartCount > 0) {
                        $("#cartCount").text(data.CartCount);
                    }
                })
            }


            //我的挂单展开&关闭子菜单
            var parent = $(".have-child-item");
            parent.click(function () {
                var childs = parent.parent().find(".fd-hide");
                if (childs && childs.length > 0) {
                    $.each(childs, function () {
                        $(this).removeClass("fd-hide");
                        $(this).addClass("fd-show");
                    });
                    parent.find("em").addClass("open");
                    parent.find("em").removeClass("close");
                } else {
                    childs = parent.parent().find(".fd-show");
                    if (childs && childs.length > 0) {
                        $.each(childs, function () {
                            $(this).removeClass("fd-show");
                            $(this).addClass("fd-hide");
                        });
                    }
                    parent.find("em").removeClass("open");
                    parent.find("em").addClass("close");
                }
            });

        });


        /* 通用辅助Js库 */
        //滑动判断，菜单特效
        $(window).scroll(function () {
            var h_num = $(window).scrollTop();
            if (h_num > 360) {
                $('#return_top').show(200);
            } else {

                $('#return_top').hide(200);
            }
        });

        var Sys = {
            init: function () {
                //获取用户关注
                var ddrulesurl = SysUrl.getUrl("/DGoods/Home/GetDDUserInfo");
                var ajaxmodel = ModuleBase.GetInstance();
                ajaxmodel.Url = ddrulesurl;
                ajaxmodel.Method = SysInfo.Ajax.getMethod;
                ajaxmodel.CallBack = function (rst) {
                    var socket = new SocketClientCtl(rst.Data.Obj);
                };
                ajaxmodel.Ajax();
            },

            bindEvents: function (userinfo) {
                if (!IsDDRoot()) {
                    return;
                }
                //Goto Top 
                var _Returntop = $("#return_top");

                //现货余额
                var _LbMallMoney = $('.memberLbMallMoney');

                var _LbMallHideMoney = $('.memberSpMallMoney');

                //订单余额
                var _LbOrderMoney = $(".memberLbOrderMoney");

                //入金
                var _CheckInCert = $(".CheckInCertificate");

                //出金
                var _CheckOutCert = $(".CheckOutCertificate");

                var _favorite = $(".favorite-offer[onclick]");

                var _favoriteseller = $(".favorite-seller[onclick]");


                _LbMallMoney.click(function () {
                    Common.showMoney("A");
                });

                _LbMallHideMoney.click(function () {
                    Common.hideMoney("A");
                });


                _LbOrderMoney.click(function () {
                    Common.showMoney("B");
                });

                _CheckInCert.click(function (event) {
                    Common.checkCert(event, userinfo);
                });

                _CheckOutCert.click(function (event) {
                    Common.checkCert(event, userinfo);
                });

                _favorite.click(function (event) {
                    Common.checkCert(event, userinfo);
                });

                _favoriteseller.click(function (event) {
                    Common.checkCert(event, userinfo);
                });

                _Returntop.click(function () {
                    Common.gotoTop();
                });


            },
        }
        return Sys;
    });