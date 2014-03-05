
var transTable = require('../serialize/transTable');

function  TableData(fileName,lang, str, tableObj) {
    this.fileName = fileName;
    this.lang = lang;
    this.str = str;
    this.table = tableObj;
}

TableData.prototype.getStr = function() {
    return this.str;
};
TableData.prototype.getTable = function() {
    return this.table;
};

TableData.prototype.getLang = function() {
    return this.lang;
}
TableData.prototype.getFileName = function() {
    return this.fileName;
}

var TABLE_DATA = [];

(function() {
    var str = 'zh{ni{"ni"}da{"汉子"}composite{who{"谁"}is{"是"}}}';
    var table = transTable.KeyTransStrTable.newTable('zh');
    table.addKeyTransStr('ni',"ni");
    table.addKeyTransStr('da','汉子');
    var childTable = transTable.KeyTransStrTable.newTable('composite');
    childTable.addKeyTransStr('who','谁');
    childTable.addKeyTransStr('is',"是");
    table.addChildTable('composite',childTable);
    TABLE_DATA.push(new TableData('zh.txt','zh',str,table));
}());

exports.TABLE_DATA = TABLE_DATA;
