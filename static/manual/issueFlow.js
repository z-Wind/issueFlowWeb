/*jshint multistr: true */

// 檢查 item 重覆
function checkItemSame(arr, id) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].id === id) {
            return true;
        }
    }
    return false;
}

// 檢查 link 重覆
function checkLinkSame(arr, s_id, t_id) {
    for (var i = 0; i < arr.length; i++) {
        if ((arr[i].source.id === s_id && arr[i].target.id === t_id) ||
            (arr[i].target.id === s_id && arr[i].source.id === t_id)) {
            return true;
        }
    }
    return false;
}

// item 轉成 d3 可用格式
function itemToD3JSon(items) {
    var datasets = {};
    for (var key in items) {
        var item = items[key];
        var dataset = {
            "action": item.action,
            "nodes": [],
            "links": []
        };
        var major = {
            "id": item.id,
            "body": item.body,
            "describe": item.describe,
            "related_n": item.related_n
        };

        if (!checkItemSame(dataset.nodes, major.id))
            dataset.nodes.push(major);

        for (i = 0; i < item.related.length; i++) {
            var next = {
                "id": item.related[i].id,
                "body": item.related[i].body,
                "describe": item.related[i].describe,
                "related_n": item.related[i].related_n
            };
            if (!checkItemSame(dataset.nodes, next.id))
                dataset.nodes.push(next);
            if (!(checkLinkSame(dataset.links, major.id, next.id)))
                switch (item.action) {
                    case "get":
                        dataset.links.push({
                            "source": major,
                            "target": next
                        });
                        break;
                    case "insert":
                        dataset.links.push({
                            "source": next,
                            "target": major
                        });
                        break;
                    default:

                }

        }

        datasets[key] = dataset;
    }

    return datasets;
}

//var graph = new flowChart("#id_main", screen.availWidth, screen.availHeight, 30);
var graph = new flowChart("#id_main", 1000, 600);
var loaded = false;

function itemShowSVG(items) {
    if (items.hasOwnProperty('error')) {
        alert(items.error);
    } else {
        var datasets = itemToD3JSon(items);

        graph.drawGraph(datasets);
        // 載入 itme 時標上顏色
        if (loaded) {
            $('#id_main svg .gnode').each(function() {
                for (var key in items) {
                    if (key == $(this).attr('gid')) {
                        $(this).children('.node').addClass('loaded');
                    }
                }

            });
            loaded = false;
        }
    }
}

// 得到 item data
function getItems(id_list) {
    var returnValue = {};
    $.getJSON(url_get, {
            id: id_list
        },
        function(jdata) {
            itemShowSVG(jdata);
        });
}

// 記錄狀態
function saveData() {
    var csv = [];

    $('#id_main svg .loaded').each(function() {
        csv.push($(this).parent().attr('gid'));
    });

    $('#id_main svg .fixed').each(function() {
        csv.push($(this).parent().attr('gid'));
    });

    saveFile(csv.join());
}

// 讀取檔案後處理資料
function processData(str) {
    //clear all gnode
    graph.clear();

    var idList = str.split(',');
    getItems(idList);
}

$(document).ready(function() {

    //初始化
    if (first_id !== "") {
        if(typeof first_id === "number")
            getItems([first_id]);
        else
            getItems(first_id);
    }
    $('#id_now_event_body').css('color', 'black');
    $('#id_now_event').css('color', 'black');
    $('#id_bodyName').css('color', 'black');
    $('#id_describe').css('color', 'black');
    $('#id_eventListSel').css('color', 'black');
    $('#id_bodyListSel').css('color', 'black');

    //顯示接下來的節點
    $('#id_main').on('dblclick', '.gnode', function() {
        getItems([$(this).attr("gid")]);
    });


    // 新增連接 ITEM
    $('#id_main').on('contextmenu', '.gnode', function(event) {
        //取消右鍵
        return false;
    });

    $('#id_main').on('mousedown', '.gnode', function(event) {
        switch (event.which) {
            case 1:
                //alert('Left Mouse button pressed.');
                break;
            case 2:
                //alert('Middle Mouse button pressed.');
                break;
            case 3:
                event.stopImmediatePropagation();
                if ($('#id_form').css('display') !== 'none') {
                    $('#id_form').animate({
                        //直接放置最上面
                        'top': $('svg').offset().top + 6,
                        'left': Math.min(event.pageX, $('svg').offset().left + $('svg').width() - $('#id_form').width())
                    }, 500, function() {
                        // Animation complete.
                    });
                } else {
                    $('#id_form').css({
                        //直接放置最上面
                        'top': $('svg').offset().top + 6,
                        'left': Math.min(event.pageX, $('svg').offset().left + $('svg').width() - $('#id_form').width())
                    });
                }
                expandForm($('#id_form'),
                    $('#id_node_form'), {
                        '#id_now_event': $(this).attr("gid"),
                        '#id_now_event_body': $(this).attr("gbid"),
                    });

                $('#id_bodyName').val($('#id_now_event_body option:selected').text());
                scrollTo(0);
                break;
            default:
                //alert('You have a strange Mouse!');
        }
    });
    // 新增連接 ITEM ctrl
    /*$('#id_main').on('click', '.gnode', function(event) {
        if (event.ctrlKey) {
            event.stopPropagation();
            $('#id_form').css({
                //直接放置最上面
                'top':  $('svg').offset().top,//event.pageY - 50,
                'left': $('svg').offset().left//event.pageX + 20
            });
            expandForm($('#id_form'),
                       $('#id_node_form'),
                       {
                           '#id_now_event': $(this).attr("gid"),
                           '#id_now_event_body': $(this).attr("gbid"),
                       });
           $('#id_bodyName').val($('#id_now_event_body option:selected').text());
           scrollTo(0);
        }
    });*/

    // 收起表單
    function collapseForm($div, $form, $selArr) {
        $div.slideUp('middle');
        $('#id_form .errorlist').remove();
        $form[0].reset();
        for (var i = 0; i < $selArr.length; i++) {
            var t = $selArr[i];
            $selArr[i].children('option').remove();
        }
        scrollTo(0);
    }

    // 展開表單
    function expandForm($div, $form, $selObjs) {
        $('#id_bodyDiv').hide();
        $('#id_eventDiv').hide();
        $('#id_form .errorlist').remove();
        for (var key in $selObjs) {
            $(key).children('option').attr('selected', false);
            $(key).children('option[value="' + $selObjs[key] + '"]').attr('selected', 'selected');
            $(key).val($selObjs[key]).change();
        }
        $div.slideDown('middle');
    }

    // 取消提交 item 表單
    $('#id_node_form > input:reset[value="取消"]').click(function() {
        collapseForm($('#id_form'), $('#id_node_form'), [$('#id_eventListSel'), $('#id_bodyListSel')]);
    });

    $('.jumbotron').click(function(event) {
        collapseForm($('#id_form'), $('#id_node_form'), [$('#id_eventListSel'), $('#id_bodyListSel')]);
    });

    // 提交 item 表單
    $('#id_node_form > input:button').click(function() {
        $('#id_now_event').prop('disabled', false);
        $('#id_now_event_body').prop('disabled', false);
        $('#id_describe').val($.trim($('#id_describe').val()));
        $('#id_bodyName').val($.trim($('#id_bodyName').val()));

        var $form_button = $(this);
        if($form_button.val() === "刪除")
        {
            $('#id_describe').val($form_button.val());
        }

        var form_data = $('#id_node_form').serializeArray();
        form_data.push(csrf);

        $.ajax({
            url: ($form_button.val() === "新增") ? url_create :
                 ($form_button.val() === "更正") ? url_rename :
                 ($form_button.val() === "刪除") ? url_delete : "",
            data: form_data,
            success: function(datas) {
                var op, key, data;
                if (datas.id === 0) {
                    $('#id_form .errorlist').remove();
                    var str = '';
                    var lists = {
                        'bodyName': '實體',
                        'describe': '行為描述',
                        'now_event': '目前節點',
                        'now_event_body': '目前實體'
                    };
                    for (var k in datas.errors) {
                        for (var i = 0; i < datas.errors[k].length; i++) {
                            str += '<p class="errorlist" style="background-color:white;">' + lists[k] + ' : ' + datas.errors[k][i] + '</p>';
                        }
                    }

                    $('#id_form > div:first-child').append(str);
                } else if ($form_button.val() === "新增") {
                    itemShowSVG(datas);

                    for(key in datas)
                    {
                        data = datas[key];
                        op = $("#id_now_event").find('option[value="' + data.id + '"]');
                        if (op.length === 0) {
                            $('#id_now_event').append($("<option></option>").attr("value", data.id).text(data.describe));
                            $('#id_eventListTemp').append($("<option></option>").attr("value", data.id).prop("title", data.body.name).text(data.describe));
                        }

                        op = $("#id_now_event_body").find('option[value="' + data.body.id + '"]');
                        if (op.length === 0) {
                            $('#id_now_event_body').append($("<option></option>").attr("value", data.body.id).text(data.body.name));
                            $('#id_bodyListTemp').append($("<option></option>").attr("value", data.body.id).text(data.body.name));
                        }
                    }
                    collapseForm($('#id_form'), $('#id_node_form'), [$('#id_eventListSel'), $('#id_bodyListSel')]);
                } else if ($form_button.val() === "更正") {
                    itemShowSVG(datas);

                    for(key in datas)
                    {
                        data = datas[key];

                        $('#id_now_event option[value="' + data.id + '"]').text(data.describe);
                        $('#id_eventListTemp option[value="' + data.id + '"]').prop("title", data.body.name).text(data.describe);

                        op = $("#id_now_event_body").find('option[value="' + data.body.id + '"]');
                        if (op.length === 0) {
                            $('#id_now_event_body').append($("<option></option>").attr("value", data.body.id).text(data.body.name));
                            $('#id_bodyListTemp').append($("<option></option>").attr("value", data.body.id).text(data.body.name));
                        } else {
                            $('#id_now_event_body option[value="' + data.body.id + '"]').text(data.body.name);
                            $('#id_bodyListTemp option[value="' + data.body.id + '"]').text(data.body.name);
                        }
                    }
                    collapseForm($('#id_form'), $('#id_node_form'), [$('#id_eventListSel'), $('#id_bodyListSel')]);
                } else if ($form_button.val() === "刪除") {
                    itemShowSVG(datas);
                    for(key in datas)
                    {
                        data = datas[key];

                        $('#id_now_event option[value="' + data.id + '"]').remove();
                        $('#id_eventListTemp option[value="' + data.id + '"]').remove();
                    }

                    collapseForm($('#id_form'), $('#id_node_form'), [$('#id_eventListSel'), $('#id_bodyListSel')]);
                }
            },
            // 發送請求之前可在此修改 XMLHttpRequest 物件
            // 如添加 header 等，你可以在此函式中 return flase 取消 Ajax request。
            beforeSend: function(XMLHttpRequest, settings) {
                // the options for this ajax request
                if (settings.url === "") {
                    alert("no url");
                    return false;
                } else {
                    return checkForm('#id_node_form', ['now_event_body', 'now_event', 'bodyName', 'describe'], $form_button.val() + "節點", ['now_event_body', 'now_event']);
                }
            },
            // 請求完成時執行的函式(不論結果是success或error)。
            complete: function(XMLHttpRequest, textStatus) {
                $('#id_now_event').prop('disabled', true);
                $('#id_now_event_body').prop('disabled', true);
            },
            type: "POST", // 預設為 GET
            dataType: "json" // 無指定自動選擇
        });
    });

    // 更新行為列表
    $('#id_describe').keyup(function() {
        $('#id_bodyDiv').hide();
        $('#id_eventDiv').slideDown('middle');
        var typing = $.trim($('#id_describe').val());
        var t = ($('#id_bodyName').val()) ? "[title='" + q_escape($('#id_bodyName').val()) + "']" : "";
        updatelist('#id_eventListTemp', '#id_eventListSel', typing, t);
    });

    // 將選中的行為放到表單中
    $('#id_eventListSel').on('click', 'option', function() {
        var selText = $(this).text();
        $('#id_describe').val(selText);
        updatelist('#id_eventListTemp', '#id_eventListSel', selText);
        $('#id_eventDiv').slideUp('middle');
    });

    // 更新實體列表
    $('#id_bodyName').keyup(function() {
        $('#id_eventDiv').hide();
        $('#id_bodyDiv').slideDown('middle');
        var typing = $.trim($('#id_bodyName').val());
        updatelist('#id_bodyListTemp', '#id_bodyListSel', typing);
    });

    // 將選中的實體放到表單中
    $('#id_bodyListSel').on('click', 'option', function() {
        var selText = $(this).text();
        $('#id_bodyName').val(selText);
        updatelist('#id_bodyListTemp', '#id_bodyListSel', selText);
        $('#id_bodyDiv').slideUp('middle');
    });

    // 回溯讀檔用
    $('#callback').change(function(event) {
        loaded = true;
        loadFile(event.target, processData);
        // for chrome on change doesn't work
        $(this).val("");
        $('.container > div > h1.errorlist').remove();

        scrollTo(0);
    });
});
