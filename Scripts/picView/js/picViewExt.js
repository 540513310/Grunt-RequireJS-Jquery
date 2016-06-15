
//图片缩放
function big(o) {
    var zoom = parseInt(o.style.zoom, 10) || 100;
    zoom += window.event.wheelDelta / 12;
    if (zoom > 0) {
        o.style.zoom = zoom + '%';
    }
    return false;
}


// 模块拖拽
/*$(function () {
    var _move = false;//移动标记
    var _x, _y;//鼠标离控件左上角的相对位置
    $(".drag").click(function () {
        //alert("click");//点击（松开后触发）
    }).mousedown(function (e) {
        _move = true;
        _x = e.pageX - parseInt($(".drag").css("left"));
        _y = e.pageY - parseInt($(".drag").css("top"));
        $(".drag").fadeTo(20, 0.5);//点击后开始拖动并透明显示
    });
    $(document).mousemove(function (e) {
        if (_move) {
            var x = e.pageX - _x;//移动时根据鼠标位置计算控件左上角的绝对位置
            var y = e.pageY - _y;
            $(".drag").css({ top: y, left: x });//控件新位置
        }
    }).mouseup(function () {
        if ($(".drag").is(":hidden")) {
            return;
        }
        _move = false;
        $(".drag").fadeTo("fast", 1);//松开鼠标后停止移动并恢复成不透明
    });
});*/


/*上面方法存在多个class为drag时会重叠显示,修改如下*/

function drag(src) {
    var _move = false;//移动标记
    var _x, _y;//鼠标离控件左上角的相对位置
    $(src).click(function () {
        //alert("click");//点击（松开后触发）
    }).mousedown(function (e) {
        _move = true;
        _x = e.pageX - parseInt($(src).css("left"));
        _y = e.pageY - parseInt($(src).css("top"));
        $(src).fadeTo(20, 0.5);//点击后开始拖动并透明显示
    });
    $(window.top.document).mousemove(function (e) {
        if (_move) {
            var x = e.pageX - _x;//移动时根据鼠标位置计算控件左上角的绝对位置
            var y = e.pageY - _y;
            $(src).css({ top: y, left: x });//控件新位置
        }
    }).mouseup(function () {
        if ($(src).is(":hidden")) {
            return;
        }
        _move = false;
        $(src).fadeTo("fast", 1);//松开鼠标后停止移动并恢复成不透明
    });
};