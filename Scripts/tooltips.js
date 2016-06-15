function enableTooltips(id) {
    var links, i, h;
    if (!document.getElementById || !document.getElementsByTagName) return;
    //AddCss();
    h = document.createElement("span");
    h.id = "btc";
    h.setAttribute("id", "btc");
    h.style.position = "absolute";
    document.getElementsByTagName("body")[0].appendChild(h);
    if (id == null) links = document.getElementsByTagName("a");
    else links = document.getElementById(id).getElementsByTagName("a");
    for (i = 0; i < links.length; i++) {
        Prepare(links[i]);
    }
} function Prepare(el) {
    var tooltip, t, b, s;//, l;
    t = el.getAttribute("title");
    if (t == null || t.length == 0) t = "link:";
    el.removeAttribute("title");
    tooltip = CreateEl("span", "tooltip_c");
    s = CreateEl("span", "top_c");
    s.appendChild(document.createTextNode(t));
    tooltip.appendChild(s);
    b = CreateEl("b", "bottom");
    //l = "Jsose.com";  //el.getAttribute("href");
    //if (l.length > 30) l = l.substr(0, 27) + "...";
    //b.appendChild(document.createTextNode(l));
    tooltip.appendChild(b);
    setOpacity(tooltip);
    el.tooltip = tooltip;
    el.onmouseover = showTooltip;
    el.onmouseout = hideTooltip;
    el.onmousemove = Locate;
} function showTooltip(e) {
    document.getElementById("btc").appendChild(this.tooltip);
    Locate(e);
} function hideTooltip(e) {
    var d = document.getElementById("btc");
    if (d.childNodes.length > 0) d.removeChild(d.firstChild);
} function setOpacity(el) {
    el.style.filter = "alpha(opacity:95)";
    el.style.KHTMLOpacity = "0.95";
    el.style.MozOpacity = "0.95";
    el.style.opacity = "0.95";
} function CreateEl(t, c) {
    var x = document.createElement(t);
    x.className = c;
    x.style.display = "block";
    return (x);
} function AddCss() {/*
    var l = CreateEl("link");
    l.setAttribute("type", "text/css");
    l.setAttribute("rel", "stylesheet");
    l.setAttribute("href", "?.css");
    l.setAttribute("media", "screen");
    document.getElementsByTagName("head")[0].appendChild(l);*/
} function Locate(e) {
    var posx = 0, posy = 0;
    if (e == null) e = window.event;
    if (e.pageX || e.pageY) {
        posx = e.pageX; posy = e.pageY;
    }
    else if (e.clientX || e.clientY) {
        if (document.documentElement.scrollTop) {
            posx = e.clientX + document.documentElement.scrollLeft;
            posy = e.clientY + document.documentElement.scrollTop;
        }
        else {
            posx = e.clientX + document.body.scrollLeft;
            posy = e.clientY + document.body.scrollTop;
        }
    }
    document.getElementById("btc").style.top = (posy + 10) + "px";
    document.getElementById("btc").style.left = (posx - 20) + "px";
}

//Calendar start------------------------
function ShowCalendar(year, month) {
    if (!year) year = new Date().getFullYear();
    if (!month) month = new Date().getMonth() + 1;
    $.post('/Home/GetRemoteCalendar', 'y=' + year + '&m=' + month, function (data, status) {
        if (status.toString() == 'success') {
            $('#calendar').empty();
            $('#calendar').append(data);
            enableTooltips('calendar');
        } else {
            $('#calendar').html("获取远程数据失败！");
        }
    }, "html");
}

function PreviouCalendar() {
    var year = parseInt($('#year').val());
    var month = parseInt($('#month').val());
    if (month == 1) {
        year -= 1;
        month = 12;
    }
    else {
        month -= 1;
    }

    if (year >= 2007 && year <= 2020) {
        $("#year").val(year.toString());
        $('#month').val(month.toString());
        ShowCalendar(year, month);
    }
    else {
        alert('提示：您所选择的日期超出范围了！');
    }
}

function NextCalendar() {
    var year = parseInt($('#year').val());
    var month = parseInt($('#month').val());

    if (month == 12) {
        year += 1;
        month = 1;
    }
    else {
        month += 1;
    }

    if (year >= 2007 && year <= 2020) {
        $("#year").val(year.toString());
        $('#month').val(month.toString());
        ShowCalendar(year, month);
    }
    else {
        alert('提示：您所选择的日期超出范围了！');
    }
}
$(function () {
    if ($("#calendar").length) {
        ShowCalendar();
    }
});
//Calendar end------------