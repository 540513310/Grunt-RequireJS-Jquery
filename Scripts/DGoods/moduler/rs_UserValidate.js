//获取买卖交易汇总
define([], function () {
    var Act = {
        Get: "QXT2033",
        Set: "QXT2003",
    }
    var Req = {
        ADAPTER: Act.Get,//	业务适配器	区分大小写		
        SIGNATURE: "",//				
        MOBILE: "",//	
        PASSWD: '',//				
    }

    var ReqBus = {
        ADAPTER: Act.Set,//	业务适配器
        SIGNATURE: "",//	
        CPNAME: "",//	公司名称
        YYZZ: "",//	营业执照
        SWDJZ: "",//	税务登记证
        USERID: "",//	用户ID
        REFEREE: "",//	推荐人手机号
    }

    var Rsp = {
        ADAPTER: "",//	业务适配器	区分大小写		
        STATE: "",//	状态	0为成功，错误对应相应的错误代码		
        MSG: "",//	错误信息	登陆失败时返回该消息		
        USERID: "",//	当前用户ID			
        CERTSTATE: "",//	用户状态	N未认证，C认证中，Y已认证		
        THUMB: "",//	用户头像URL			
    }
    var RspBus = {
        ADAPTER: "",//	业务适配器
        STATE: "",//	状态
        MSG: "",//	错误信息
    }

    return {
        Act: Act,
        Req: Req,
        Rsp: Rsp,
        ReqBus: ReqBus,
        RspBus: RspBus
    }
});