$(document).ready(function(){
    $('#id_describe').keyup(function() {
        $('#id_bodyDiv').hide();
        $('#id_eventDiv').slideDown('middle');
        var typing = $.trim($('#id_describe').val());
        var t = ($('#id_bodyName').val()) ? "[title='" + q_escape($('#id_bodyName').val()) + "']":"";
        updatelist('#id_eventListTemp', '#id_eventListSel', typing, t);
    });

    $('#id_eventListSel').on('click', 'option', function() {
        var selText = $(this).text();
        $('#id_describe').val(selText);
        updatelist('#id_eventListTemp', '#id_eventListSel', selText);
        $('#id_eventDiv').slideUp('middle');
    });

    $('#id_bodyName').keyup(function() {
        $('#id_eventDiv').hide();
        $('#id_bodyDiv').slideDown('middle');
        var typing = $.trim($('#id_bodyName').val());
        updatelist('#id_bodyListTemp', '#id_bodyListSel', typing);
    });

    $('#id_bodyListSel').on('click', 'option', function() {
        var selText = $(this).text();
        $('#id_bodyName').val(selText);
        updatelist('#id_bodyListTemp', '#id_bodyListSel', selText);
        $('#id_bodyDiv').slideUp('middle');
    });
});
