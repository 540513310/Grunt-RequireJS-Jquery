define(["jquery", "../utils/SysUrl", '../utils/ModelDailog',
    "../utils/SysConfig", "../viewmodel/SocketClient"
    , "../viewmodel/IgnoreRequireViewModel"],
    function ($, SysUrl, ModelDailog, SysConfig, SocketClient, IgnoreRequireViewModel) {
        var SocketClientCtl = function (user) {
            var option = {
                LoginUser: user,
                onUserJoin: this.onUserJoin,
                onUserLogout: this.onUserLogout,
                onRequirePunished: this.onRequirePunished,
                onQuotedPunished: this.onQuotedPunished,
                onQuotedConfirmed: this.onQuotedConfirmed,
            };
            this.Socket = new SocketClient(option);
        };

        SocketClientCtl.prototype = {
            onUserJoin: function (socket, rst) {

            },

            onUserLogout: function (socket, rst) {

            },

            onRequirePunished: function (socket, rst) {
                var self = this;
                //单子找货人！=登录ID 且 为自己关注的类型
                if (self.LoginUser.DDUserId != rst.Data.USERID
                    && self.LoginUser.SERIES.indexOf(rst.Data.SERIES) != -1) {

                    var audiohtml = '<embed src="' + SysUrl.getUrl("Content/Users/DGoods/Sound/whistle.wav") + '" ' +
                        ' autostart = "1" style="height:0px;width:0px;" ></embed>'

                    var html = '<div class="RequireMarkUp" data-id=' + rst.Data.REQUIREID + '>' +
                        '<h3>' + rst.Data.MATERIAL + '/' + rst.Data.SURFACE + '</h3>' +
                        '<p>' + rst.Data.DETAIL + '。 ';
                    if (typeof rst.Data.DELIVERY != 'undefined') {
                        html += "  交货地点:" + rst.Data.DELIVERY + '</p>';
                    }
                    html += '</div>' + audiohtml;
                    $(document).showpopu({
                        Title: 'DD找货-最新求购',
                        ConfirmTitle: '抢单',
                        CloseTitle: '忽略',
                        templateHtml: html,
                        onClose: function () {
                            //忽略此求购模型
                            var IngnoreGoodsModel = new IgnoreRequireViewModel();
                            IngnoreGoodsModel.setter(self.LoginUser.DDUserId, rst.Data.REQUIREID);
                            IngnoreGoodsModel.ignoreRequire(function (rst) { });
                        }, onConfirm: function (element) {
                            var currentpath = window.location.pathname;
                            if (currentpath != '/DGoods/VieOrder/Quoted') {
                                window.open(SysUrl.getUrl("/DGoods/VieOrder/Quoted?requireId=" + rst.Data.REQUIREID), '_self');
                            }
                            else {
                                window.location.href = SysUrl.getUrl("/DGoods/VieOrder/Quoted?requireId=" + rst.Data.REQUIREID);
                            }
                        },
                    });
                }
            },

            onQuotedPunished: function (socket, rst) {
                var self = this;
                //单子的发货人==登录ID
                if (self.LoginUser.DDUserId == rst.Data.USERID) {
                    var html = '<div class="QuotedMarkUp" data-id=' + rst.Data.OFFERID + '>' +
                        '<p>' + rst.Data.DETAIL + '</p>' +
                        '</div>';
                    $(document).showpopu({
                        Title: 'DD找货-最新报价',
                        ConfirmTitle: '查看',
                        CloseTitle: '关闭',
                        templateHtml: html,
                        onClose: function () {
                        }, onConfirm: function (element) {
                            var currentpath = window.location.pathname;
                            if (currentpath != '/DGoods/Deliver/Finding') {
                                window.open(SysUrl.getUrl("/DGoods/Deliver/Finding?requireId=" + rst.Data.REQUIREID), '_self');
                            }
                            else {
                                window.location.href = SysUrl.getUrl("/DGoods/Deliver/Finding?requireId=" + rst.Data.REQUIREID);
                            }
                        },
                    });
                }
            },

            onQuotedConfirmed: function (socket, rst) {
                var self = this;
                //单子的报价人==登录ID
                if (self.LoginUser.DDUserId == rst.Data.USERID) {
                    var html = '<div class="ConfirmMarkUp" data-id=' + rst.Data.OFFERID + '>' +
                        '<h3>恭喜抢单成功.</h3>' +
                        '<p>' + rst.Data.DETAIL + '</p>' +
                        '</div>';

                    $(document).showpopu({
                        Title: 'DD找货-抢单成功',
                        ConfirmTitle: '查看',
                        CloseTitle: '关闭',
                        templateHtml: html,
                        onClose: function () {

                        },
                        onConfirm: function (element) {
                            var currentpath = window.location.pathname;
                            if (currentpath != '/DGoods/VieOrder/ViedSuccess') {
                                window.open(SysUrl.getUrl("/DGoods/VieOrder/ViedSuccess?requireId=" + rst.Data.REQUIREID), '_self');
                            }
                            else {
                                window.location.href = SysUrl.getUrl("/DGoods/VieOrder/ViedSuccess?requireId=" + rst.Data.REQUIREID);
                            }
                        },
                    });
                }
            }
        };
        return SocketClientCtl;
    });