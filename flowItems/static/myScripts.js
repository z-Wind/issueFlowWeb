/*jshint multistr: true */
function itemShow(item) {
    var i;
    var tagdiv = "";
    for (i = 0; i < item.relatedTags.length; i++) {
        tagdiv += ("<div>" +
            '<input type="hidden" value="' + item.relatedTags[i].id.toString() + '"/>' +
            item.relatedTags[i].name +
            "</div>");
    }

    var itemNextdiv = "";
    for (i = 0; i < item.itemNext.length; i++) {
        itemNextdiv += ("<div>" +
            '<input type="hidden" value="' + item.itemNext[i].id.toString() + '"/>' +
            item.itemNext[i].ph +
            "</div>");
    }

    var show =
        '<table class="item"> \
        <input type="hidden" value="' + item.id.toString() + '"/> \
        <tr> \
            <th class="tag"> ' + tagdiv +
        '<input type="button" value="Add"> \
            </th> \
            <td class="major" style="width:50%">' + item.ph + '</td> \
            <td  class="itemNext">' +
        itemNextdiv +
        '<input type="button" value="New"> \
            </td> \
        </tr> \
    </table>';
    return show;
}

function getItems(id_n) {
    var returnValue = {};
    $.getJSON("/getItems/", {
            id: id_n
        },
        function(jdata) {
            $('#id_main').append(itemShow(jdata));
        });
}

$(document).ready(function() {

    //初始化
    if ($('#id_main').children().length === 0) {
        getItems(2);
    }

    //顯示下一步
    $('#id_main').on('click', '.itemNext > div', function() {
        $('#id_main').append('<p align="center"> &dArr;</p>');
        getItems($(this).children('input:hidden').val());
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
                    getItems(data.id);
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
