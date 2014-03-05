
var async = require('async');
var util = require('util');
var events = require('events');

function  langTransStrPair(lang,str) {
    this.lang = lang;
    this.transStr = str;
}

//translate string per language
//langTransArray: array of langTransStrPair
function LangToTransStrMap( langTransArray) {
    this.langTransMap = {};
    if(langTransArray) {
        this.insertArray(langTransArray);
    }
}
LangToTransStrMap.prototype.insert = function( langTrans ) {
    this.langTransMap[langTrans.lang] = langTrans.transStr;
}
LangToTransStrMap.prototype.insertArray = function( langTransArray ) {
    var langTransMap = this.langTransMap;
    langTransArray.forEach(function(langStrPair) {
        langTransMap[langStrPair.lang] = langStrPair.transStr;
    })
}
//langArray: lang or array of language string
LangToTransStrMap.prototype.remove = function( langArray ) {
    var langTransMap = this.langTransMap;
    if(typeof langArray === 'string') {
        delete langTransMap[langArray];
        return ;
    }
    langArray.forEach(function(lang) {
        delete langTransMap[lang];
    });
}

LangToTransStrMap.prototype.getByLang = function(lang) {
    return this.langTransMap[lang];
}

function TableView() {
    this.keyLangMap = {};
}

TableView.prototype.isKeyExisting = function(key) {
    return this.keyLangMap[key];
}

util.inherits(TableView, events.EventEmitter );

TableView.prototype.insert = function(keyId, langTrans) {
    var langMap = this.keyLangMap[keyId];
    if(!langMap) {
        langMap = this.keyLangMap[keyId] = new LangToTransStrMap();
    }
    langMap.insert( langTrans );
    this.emit("insert",keyId, langTrans);
};

TableView.prototype.remove = function(keyId) {
    delete this.keyLangMap[keyId];
    this.emit('remove',keyId);
};

TableView.prototype.getKeys = function() {
    return Object.keys( this.keyLangMap );
};

TableView.prototype.getLangTransStrMap = function(key) {
    return this.keyLangMap[key];
};

//the set of TableView
function TableSetView() {
    this.tableSet = {};
}

util.inherits(TableSetView,events.EventEmitter);

TableSetView.prototype.add = function(tableName, tableView) {
    this.tableSet[tableName] = tableView;
    this.emit('add',tableName,tableView);
};


TableSetView.prototype.remove = function(tableName) {
    delete this.tableSet[tableName];
    this.emit('remove',tableName);
};

TableSetView.prototype.getTableNames = function() {
    return Object.keys(this.tableSet);
}

TableSetView.prototype.getTable = function(tableName) {
    return this.tableSet[tableName];
}
TableSetView.prototype.getOrCreate = function(tableName) {
    var table = this.tableSet[tableName];
    if(!table) {
        table = this.tableSet[tableName] = new TableView();
    }
    return table;
}
//create a new table
//packName:[string] package name of new table
//langAttr:[array]  array of language string, such as ['zh','en']
//return: [object] the instance of ResTable object

function AllTableView() {
    this.resTable = new ResTable(fileName);
}

//callback: function(err)
AllTableView.prototype.load = function(callback) {
    var resTable = this.resTable;
    var analyze = this._analyzeTable;
    async.waterfall([
        function(callback) {
            resTable.load(callback);
        },
        function(callback) {
            analyze();
            callback(null);
        }
    ],callback);
};

//create a new AllTableView by the file names
//fileNames: the array of filename which is string
AllTableView.newView = function( fileNames ) {

}

//create a new AllTableView by the files in the specific dir
AllTableView.newViewInDir = function( langArray, dir ) {

}

AllTableView.load = function( fileNames ) {

}

AllTableView.loadInDir = function( dir ) {

}

//when something insert into global table
AllTableView._onGlobalInsert = function(langKey, keyId, transStr) {
    var table = this.transTable[langKey];
    if(!table) {
        table = this.transTable[langKey] = {};
    }
    table[keyId] = transStr;
}

AllTableView._onGlobalRemove = function(keyId) {
    var transTable = this.transTable;
    var table;
    for(var lang in transTable) {
        table = transTable[lang];
        delete table[keyId];
    }
}

AllTableView._onLocalInsert = function(tableName, langKey, keyId, transStr) {
    var table = this.transTable[langKey];
    if(!table || typeof table !== 'object') {
        table = this.transTable[langKey] = {};
    }
    var localTable = table[tableName];
    if( !localTable || typeof localTable !== 'object') {
        localTable = table[tableName] = {};
    }
    localTable[keyId] = transStr;
}

AllTableView._onLocalRemove = function(tableName, keyId) {
    var transTAble = this.transTable;
    var table;
    for(var lang in transTAble) {
        table = transTAble[lang];
        if(!keyId) {
            delete table[tableName];
        }
    }
    var localTable = table[tableName];
}

AllTableView.prototype._analyzeTable = function() {
    var transTable = this.resTable.transTable;
    var globalTable = this.globalTable = new GlobalTable();
    var localTables = this.localTables = new LocalTables();
    this.langArray = Object.keys(transTable);

    analyzeTable(transTable,globalTable, localTables);
};

AllTableView.prototype.getGlobalTable = function() {
    return  this.globalTable;
}
AllTableView.prototype.getChildTables = function() {
    return this.localTables;
}

AllTableView.prototype.getLangArray = function() {
    return this.langArray;
}

AllTableView.prototype.addLang = function(lang) {
    this.langArray.push(lang);
}

AllTableView.prototype.removeLang = function(lang) {

}



function LocalTables() {

}



//analyze transTable, get globalTable and localTable
//globalTable: GlobalTable
//localTable:  LocalTables
//return {globalTable, localTable}
function  analyzeTable(transTable, globalTable, localTables) {
    var langArray = Object.keys(transTable);
    langArray.forEach(function(lang) {
        var table = transTable[lang];
        analyzeObject(table,lang,globalTable, localTables);
    });
};

//table object : { keyId: transStr }
function  analyzeObject(table,lang, globalTable, localTables) {
    var prop, keyId;
    var localTable;
    for(var keyId in table) {
        prop = table[keyId];
        if(typeof prop === 'string') {
            globalTable.insert(lang,keyId, prop);
        } else if(typeof prop === 'object' && localTables ) {
            localTable = localTables.getOrCreate(keyId);
            analyzeObject(prop,lang, localTable, null);
            localTables.add(keyId, localTable);
        }
    }
}



//for test
exports._analyzeTable = analyzeTable;
exports.LangToTransStrMap = LangToTransStrMap;

exports.langTransStrPair = langTransStrPair;
exports.LangToTransStrMap = LangToTransStrMap;
exports.TableView = TableView;
exports.TableSetView = TableSetView;