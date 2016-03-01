//顏色表
function colores_google(n) {
  var colores_g = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
  return colores_g[n % colores_g.length];
}

//捲動視窗
function scrollTo(top) {
    var $body = (window.opera) ? (document.compatMode == "CSS1Compat" ? $('html') : $('body')) : $('html,body');
    $body.animate({
        scrollTop: top
    }, 600);
}

//防止特殊字元
function q_escape( str ) {

    return str.replace(/[!"#$%&'()*+,.\/:;<=>?@\[\\\]^`{|}~]/g, '\\$&');

}

//建立列表
function updatelist(sourceSel, targetSel, str, group) {
    //str = str.toLowerCase();
    var g = typeof group !== 'undefined' ? group : "";
    $(targetSel + ' option').remove();
    $(sourceSel + ' option' + g).each(function() {
        //var text = $(this).text().toLowerCase();
        /*if (text.indexOf(str) != -1) {
            $(targetSel).append($(this).clone());
        }*/
        var text = $(this).text();
        pattern = new RegExp(".*" + str.split("").join(".*") + ".*", "i");
        if (pattern.exec(text)) {
            $(targetSel).append($(this).clone().attr('selected', false));
        }
    });
}

//確認表單內容
function checkForm(targetSel, list, title, disableList) {
    var dataArray = $(targetSel).serializeArray();
    var str = title + "\n" + "====================\n";
    var i;
    for (i = 0; i < list.length; i++) {
        if ($("#id_" + list[i]).is("select"))
            str = str + $("#id_" + list[i] + " option:selected").text() + "\n";
        else
            str = str + $("#id_" + list[i]).val() + "\n";
    }

    if (confirm(str + '\n是否確認送出？')) {
        return true;
    } else {
        for (i = 0; i < disableList.length; i++) {
            $('#id_' + disableList[i]).attr('disabled', true);
        }
        return false;
    }
}

//存檔
function saveFile(csvContent)
{
    var $a = $('<a></a>').attr(
        {"href": 'data:attachment/csv,' +  encodeURIComponent(csvContent),
         "target": "_blank",
         "download": "record.csv",
         "id": "temp"});

    $a.appendTo('body');
    document.getElementById("temp").click();
    $a.remove();
}

//讀檔
function loadFile(input, func)
{
    if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
        alert('The File APIs are not fully supported in this browser.');
        return;
    }

    var aa = document.getElementById('callback');
    if (!input) {
        alert("Um, couldn't find the fileinput element.");
    }
    else if (!input.files) {
        alert("This browser doesn't seem to support the `files` property of file inputs.");
    }
    else if (!input.files[0]) {
        alert("Please select a file before clicking 'Load'");
    }
    else {
        //var myFiles = $('#' + id_fileinput).prop('files'); 同 input.files
        file = input.files[0];
        fr = new FileReader();
        fr.onload = function(event) {
            // The file's text will be printed here
            func(event.target.result);
        };
        fr.readAsText(file);
    }
}
