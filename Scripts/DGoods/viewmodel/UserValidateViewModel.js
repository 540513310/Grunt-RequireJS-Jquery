define(["../utils/SysConfig",
    "../utils/SysUrl", "../utils/CreateObject",
    "../viewmodel/ModuleBase",
    "../moduler/rs_UserValidate"],
    function (SysConfig, SysUrl, CreateObject, ModuleBase, rs_UserValidate) {
        function Control() {
            ModuleBase.MBase.call(this);
            CreateObject(Control, ModuleBase.MBase);
            this.init();
        }

        Control.prototype = {
            init: function () {
                var self = this;
                self.module.SIGNATURE = window.SysInfo.baseGuid;//签名
            },
            //用户认证
            setter: function (mobile, password) {
                var self = this;
                self.module = rs_UserValidate.Req;
                self.module.SIGNATURE = window.SysInfo.baseGuid;//签名
                self.module.MOBILE = mobile;//	电话号码
                self.module.PASSWD = password;//	密码
                self.Url = SysUrl.getApiUrl("ADAPTER", rs_UserValidate.Act.Get);
            },

            setterBus: function (CPNAME, YYZZ, SWDJZ, USERID, REFEREE) {
                var self = this;
                self.module = rs_UserValidate.ReqBus;
                self.module.SIGNATURE = window.SysInfo.baseGuid;//签名
                self.module.CPNAME = CPNAME;//	公司名
                self.module.YYZZ = YYZZ;//	密码
                self.module.SWDJZ = SWDJZ;//	电话号码
                self.module.USERID = USERID;//	密码
                self.module.REFEREE = REFEREE;//	密码
                self.Url = SysUrl.getApiUrl("ADAPTER", rs_UserValidate.Act.Set);
            },

            setBussinessCard: function (callfunc) {
                var self = this;
                self.Data = this.module;
                self.CallBack = callfunc;
                self.Ajax();
            },

            userValidate: function (callfunc) {
                var self = this;
                self.Data = this.module;
                self.CallBack = callfunc;
                self.Ajax();
            }
        };
        return Control;
    });