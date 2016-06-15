var prop;
var Property = {
    //读规格（材质/表面...）
    "Specs": function(varietyId, categoryId, controlId, defaultOption) {
        var url = Config.url + "Prop/Specs";
        var cid = categoryId ? categoryId : 'A';
        var params = { 'vid': varietyId, 'category': cid };
        var data = Utils.Ajax(url, params);
        if (data && data.Status === 0 && data.Datas.length > 0 && controlId) {
            prop = data.Datas;
            Utils.FillSelect(controlId, prop, defaultOption);
            return null;
        }
        return data;
    },
    //读属性
    "Properties": function(varietyId, itemGroup, controlId, defaultOption) {
        var url = Config.url + "Prop/Properties";
        var params = { "vid": varietyId, "itemGroup": itemGroup };
        var data = Utils.Ajax(url, params);
        if (data && data.Status === 0 && data.Datas.length > 0 && controlId) {
            Utils.FillSelect(controlId, data.Datas, defaultOption);
            return null;
        }
        return data;
    },
    //读厂商
    "Factories": function(varietyId, controlId, defaultOption) {
        var url = Config.url + "/Prop/Factories";
        var params = { 'vid': varietyId };
        var data = Utils.Ajax(url, params);
        if (data && data.Status === 0 && data.Datas.length > 0 && controlId) {
            Utils.FillSelect(controlId, data.Datas, defaultOption);
            return null;
        }
        return data;
    },
    //读仓库
    "Warehouses": function(varietyId, areaId, controlId, defaultOption) {
        var url = Config.url + "/Prop/Warehouses";
        var params = { 'vid': varietyId, "aid": areaId };
        var data = Utils.Ajax(url, params);
        if (data && data.Status === 0 && data.Datas.length > 0 && controlId) {
            Utils.FillSelect(controlId, data.Datas, defaultOption);
            return null;
        }
        return data;
    }
};