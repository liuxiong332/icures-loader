
var transTable = require('../serialize/transTable');

function  TableData(str, tableObj) {
    this.str = str;
    this.table = tableObj;
}

TableData.prototype.getStr = function() {
    return this.str;
};
TableData.prototype.getTable = function() {
    return this.table;
};

var TABLE_DATA = [];

(function() {
    var str = 'world{ni{"ni"}da{"汉子"}composite{who{"谁"}is{"是"}}}';
    var table = transTable.KeyTransStrTable.newTable('world');
    table.addKeyTransStr('ni',"ni");
    table.addKeyTransStr('da','汉子');
    var childTable = transTable.KeyTransStrTable.newTable('composite');
    childTable.addKeyTransStr('who','谁');
    childTable.addKeyTransStr('is',"是");
    table.addChildTable('composite',childTable);
    TABLE_DATA.push(new TableData(str,table));
}());

function  FileData(lang, fileName, table, transFile) {
    this.fileName = fileName;
    this.table = table;
    this.lang = lang;
    this.transFile = transFile;
}

FileData.prototype.getFileName = function() {
    return this.fileName;
}
FileData.prototype.getTable = function() {
    return this.table;
}
FileData.prototype.getLang = function() {
    return this.lang;
}
FileData.prototype.getTransFile = function() {
    return this.transFile;
}

var FILE_DATA = [];
(function() {

})
var TABLE_MAP =
{
    transTable: {
        en: {hello: "hello", world: "world", good: { good: "good"}},
        cn: {hello: "你好", world: "世界", good: { good: '好'}}
    },
    mapTable: {
        hello: {en: "hello", cn:"你好"},
        world: {en: "world", cn: "世界"}
    },
    localMapTable: {
        good: { good: {en: "good", cn:"好"} }
    }
};


exports.TABLE_DATA = TABLE_DATA;
exports.TABLE_MAP = TABLE_MAP;