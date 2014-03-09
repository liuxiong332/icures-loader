var langInfo = require('../js/lang_info');
var jade = require('jade');
var fs = require('fs');

var langListInfo = global.langListInfo = new langInfo.LangInfoList('create');

var trCompile = null;
(function() {
    //compile the lang_list.jade file
    fs.readFile('.\\lang_list.jade',{encoding:'utf8'},function(err,data) {
        trCompile = jade.compile(data);
    });
}());

//insert lang info into the table
function addLangInfoToTable(langInfo) {
    var html = trCompile(langInfo);
    $('language-list').append( html );
}

function updateTable(langInfo) {

}
$(document).ready( function() {
    var fileName ;
    $('#add-language-btn').click( function(eventObj) {
        $('#add-language-form').removeClass('hidden');
        eventObj.stopPropagation();
    });
    $('#add-btn').click( function(eventObj) {
        var langName = $('#name-input').val();
        var $dangerAlert = $('#danger-alert');
        if(langListInfo.isLangExisting(langName)) {
            $dangerAlert.removeClass('hidden');
            $dangerAlert.html('the language name has existed!');
            return ;
        }
        if( !fileName ) {
            $dangerAlert.removeClass('hidden');
            $dangerAlert.html('invalid file name!');
            return ;
        }
        var langDes = new langInfo.LangInfo(langName,$('#des-input').val(),fileName);
        langListInfo.addLangInfo(langDes);
        addLangInfoToTable(langDes);
        eventObj.stopPropagation();
    });
    $('#cancel-btn').click( function(eventObj) {
        $('#add-language-form').addClass('hidden');
        eventObj.stopPropagation();
    });
    $('#save-path-input').change( function(eventObj) {
        fileName = $(this).val() ;
        eventObj.stopPropagation();
    });
});