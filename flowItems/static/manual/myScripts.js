/*jshint multistr: true */

function itemToD3JSon(item, dataset) {
    dataset = typeof dataset !== 'undefined' ? dataset : { "nodes":[], "links":[]};
    var major = {"id": item.id, "ph": item.ph};
    dataset.nodes.push(major);

    for (i=0; i<item.itemNext.length; i++) {
        var next = {"id": item.itemNext[i].id, "ph": item.itemNext[i].ph};
        dataset.nodes.push(next);
        dataset.links.push({"source": major, "target": next});
    }

    return dataset;
}

var graph = new flowChart("#id_main");

function itemShowSVG(item) {
    var w = 960;
	var h = 500;

    var dataset = itemToD3JSon(item);

    graph.drawGraph(dataset, w, h, 40);
}

function getItems(id_list) {
    var returnValue = {};
    $.getJSON("/getItems/", {
            id: id_list
        },
        function(jdata) {
            //$('#id_main').append(itemShow(jdata));
            itemShowSVG(jdata);
        });
}

$(document).ready(function() {

    //初始化
    if ($('#id_main').children().length === 1) {
        getItems([first_id]);
    }

    //顯示下一步
    $('#id_main').on('dblclick', '.gnode', function() {
        getItems([$(this).attr("gid")]);
    });

    //新增 ITEM
    $('#id_main').on('click', '.itemNext > input:button', function() {
        var p_id = $(this).parents('.item').children('input:hidden').val();
        $('#id_pre_item option[value="' + p_id + '"]').attr('selected', 'selected');
        $('#id_form').slideDown('slow', function() {
            $(document).scrollTop($("#id_form").offset().top);
        });
    });

    //提交 ITEM
    $('#id_input_form > input:button').click(function() {
        $('#id_pre_item').prop('disabled', false);
        var form_data = $('#id_input_form').serializeArray();
        form_data.push(csrf);
        $.ajax({
            url: "/createItems/",
            data: form_data,
            success: function(data) {
                if (data.id === 0) {
                    var str = '';
                    for (var k in data.errors) {
                        for (var i = 0; i < data.errors[k].length; i++) {
                            str += '<p>' + k + ' : ' + data.errors[k][i] + '</p>';
                        }
                    }

                    $('#id_form > div').empty();
                    $('#id_form > div').append(str);
                } else {
                    $('#id_main').append('<p align="center"> &dArr;</p>');
                    getItems([data.id]);
                    $('#id_form').slideUp('slow');
                }
            },
            //發送請求之前可在此修改 XMLHttpRequest 物件
            //如添加 header 等，你可以在此函式中 return flase 取消 Ajax request。
            beforeSend: function(XMLHttpRequest) {
                // the options for this ajax request
                var dataArray = $("#id_input_form").serializeArray();
                var str = "";
                var list = ['pre_item', 'ph', 'relatedTags', 'itemNexts'];
                for (var i = 0; i < list.length; i++) {
                    if ($("#id_" + list[i]).is("select"))
                        str = str + $("#id_" + list[i] + " option:selected").text() + "\n";
                    else
                        str = str + $("#id_" + list[i]).val() + "\n";
                }

                if (confirm(str + '\n是否確認送出？')) {
                    return true;
                } else {
                    $('#id_pre_item').attr('disabled', true);
                    return false;
                }
            },
            //請求完成時執行的函式(不論結果是success或error)。
            complete: function(XMLHttpRequest, textStatus) {
                $('#id_pre_item').attr('disabled', true);
            },
            type: "POST", //預設為 GET
            dataType: "json" //無指定自動選擇
        });
    });
});
