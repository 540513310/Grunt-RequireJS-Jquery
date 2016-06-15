//div模拟下拉列表
function selectModel() {
    var $box = $('div.model-select-box');
    var $option = $('ul.model-select-option', $box);
    var $txt = $('div.model-select-text', $box);
    var speed = 10;

    $txt.click(function (e) {
        $option.not($(this).siblings('ul.model-select-option')).slideUp(speed, function () {
            int($(this));
        });
        $(this).siblings('ul.model-select-option').slideToggle(speed, function () {
            int($(this));
        });
        return false;
    });


    $option.find('li')
        .each(function (index, element) {
            if ($(this).hasClass('seleced')) {
                $(this).addClass('data-selected');
            }
        })
    .mousedown(function () {
        var selectTxt = $(this).parent().siblings('div.model-select-text').text($(this).text());
        $(this).parent().siblings('div.model-select-text').text($(this).text())
             .attr('data-value', $(this).attr('data-option'));
        $option.slideUp(speed, function () {
            int($(this));
        });
        $(this).addClass('seleced data-selected').siblings('li').removeClass('seleced data-selected');
        return false;
    })
     .mouseover(function () {
             $(this).addClass('seleced').siblings('li').removeClass('seleced');
         });

    $(document).click(function (e) {
        $option.slideUp(speed, function () {
            int($(this));
        });
    });

    function int(obj) {
        obj.find('li.data-selected').addClass('seleced').siblings('li').removeClass('seleced');
    }
}
$(function () {
    selectModel();

})