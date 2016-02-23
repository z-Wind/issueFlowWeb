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
        var dataset = {
            "nodes": [],
            "links": []
        };
        var item = items[key];
        var major = {
            "id": item.id,
            "ph": item.ph,
            "itemNext_n": item.itemNext_n
        };

        if (!checkItemSame(dataset.nodes, major.id))
            dataset.nodes.push(major);

        for (i = 0; i < item.itemNext.length; i++) {
            var next = {
                "id": item.itemNext[i].id,
                "ph": item.itemNext[i].ph,
                "itemNext_n": item.itemNext[i].itemNext_n
            };
            if (!checkItemSame(dataset.nodes, next.id))
                dataset.nodes.push(next);
            if (!(checkLinkSame(dataset.links, major.id, next.id)))
                dataset.links.push({
                    "source": major,
                    "target": next
                });
        }

        datasets[key] = dataset;
    }

    return datasets;
}

//var graph = new flowChart("#id_main", screen.availWidth, screen.availHeight, 30);
var graph = new flowChart("#id_main", 1000, 600);
var loaded = false;

function itemShowSVG(items) {
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

// 得到 item data
function getItems(id_list) {
    var returnValue = {};
    $.getJSON("/getItems/", {
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
    if(first_id !== "")
    {
        getItems([first_id]);
    }

    //顯示接下來的節點
    $('#id_main').on('dblclick', '.gnode', function() {
        getItems([$(this).attr("gid")]);
    });

    // 新增連接 ITEM
    $('#id_main').on('click', '.gnode', function(event) {
        if (event.ctrlKey) {
            $('#id_form').css({
                //直接放置最上面
                'top': 55, // event.pageY + 10,
                'left': event.pageX + 10
            });
            expandForm($('#id_form'), $('#id_node_form'), $('#id_now_item'), $(this).attr("gid"));
        }
    });

    // 收起表單
    function collapseForm($div, $form, $itemList) {
        $div.slideUp('middle');
        $('#id_form .errorlist').empty();
        $form[0].reset();
        $itemList.children('option').remove();
    }

    // 展開表單
    function expandForm($div, $form, $now_item, p_id) {
        $('#id_form .errorlist').empty();
        $now_item.children('option').attr('selected', false);
        $now_item.children('option[value="' + p_id + '"]').attr('selected', 'selected');
        $now_item.val(p_id).change();
        $div.slideDown('middle');
    }

    // 取消提交 item 表單
    $('#id_node_form > input:reset[value="取消"]').click(function() {
        collapseForm($('#id_form'), $('#id_node_form'), $('#id_itemListSel'));
    });

    // 提交 item 表單
    $('#id_node_form > input:button').click(function() {
        $('#id_now_item').prop('disabled', false);
        $('#id_ph').val($.trim($('#id_ph').val()));
        var form_data = $('#id_node_form').serializeArray();
        var $form_button = $(this);
        form_data.push(csrf);
        /*if ($form_button.val() === "更名")
        {
            var now_id = $('#id_now_item option:selected').val();
            form_data.push({name:'now_id', value: now_id});
        }*/
        $.ajax({
            url: ($form_button.val() === "新增")? "/createItems/":
                 ($form_button.val() === "更名")? "/renameItems/": "",
            data: form_data,
            success: function(data) {
                if (data.id === 0) {
                    $('#id_form .errorlist').empty();
                    var str = '';
                    var lists = {
                        'ph': '現象',
                        'now_item': '目前節點'
                    };
                    for (var k in data.errors) {
                        for (var i = 0; i < data.errors[k].length; i++) {
                            str += '<p class="errorlist">' + lists[k] + ' : ' + data.errors[k][i] + '</p>';
                        }
                    }

                    $('#id_form > div:first-child').append(str);
                } else if ($form_button.val() === "新增") {
                    getItems([data.id]);
                    var op = $("#id_now_item").find('option[value="' + data.id + '"]');
                    if (op.length === 0) {
                        $('#id_now_item').append($("<option></option>").attr("value", data.id).text(data.ph));
                    }
                    collapseForm($('#id_form'), $('#id_node_form'), $('#id_itemListSel'));
                } else if ($form_button.val() === "更名") {
                    getItems([data.id]);
                    $('#id_now_item option[value="' + data.id + '"]').text(data.ph);
                    collapseForm($('#id_form'), $('#id_node_form'), $('#id_itemListSel'));
                }
            },
            // 發送請求之前可在此修改 XMLHttpRequest 物件
            // 如添加 header 等，你可以在此函式中 return flase 取消 Ajax request。
            beforeSend: function(XMLHttpRequest, settings) {
                // the options for this ajax request
                if(settings.url === "")
                {
                    alert("no url");
                    return false;
                }
                else
                {
                    return checkForm("#id_node_form", ['now_item', 'ph'], $form_button.val() + "節點");
                }
            },
            // 請求完成時執行的函式(不論結果是success或error)。
            complete: function(XMLHttpRequest, textStatus) {
                $('#id_now_item').attr('disabled', true);
            },
            type: "POST", // 預設為 GET
            dataType: "json" // 無指定自動選擇
        });
    });

    // 更新列表
    $('#id_ph').keyup(function() {
        var typing = $.trim($('#id_ph').val());
        updatelist('#id_now_item', '#id_itemListSel', typing);
    });

    // 將選中的值放到表單中
    $('#id_itemListSel').on('click', 'option', function() {
        var selText = $(this).text();
        $('#id_ph').val(selText);
        updatelist('#id_now_item', '#id_itemListSel', selText);
    });

    // 回溯讀檔用
    $('#callback').change(function(event) {
        loaded = true;
        loadFile(event.target, processData);
        // for chrome on change doesn't work
        $(this).val("");
        $('.container > div > h1.errorlist').remove();

        var $body = (window.opera) ? (document.compatMode == "CSS1Compat" ? $('html') : $('body')) : $('html,body');
		$body.animate({
			scrollTop: 0
		}, 600);
    });
});
