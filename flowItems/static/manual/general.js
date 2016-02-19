//建立列表
function updatelist(sourceSel, targetSel, str) {
    str = str.toLowerCase();
    $(targetSel + ' option').remove();
    $(sourceSel + ' option').each(function() {
        var text = $(this).text().toLowerCase();
        if (text.indexOf(str) != -1) {
            $(targetSel).append($(this).clone());
        }
    });
}

//確認表單內容
function checkForm(targetSel, list) {
    var dataArray = $(targetSel).serializeArray();
    var str = "";
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
