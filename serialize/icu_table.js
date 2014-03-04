
var ResTable = require('./icures_rw').ResTable;
var async = require('async');
var util = require('util');
var events = require('events');

//create a new table
//packName:[string] package name of new table
//langAttr:[array]  array of language string, such as ['zh','en']
//return: [object] the instance of ResTable object

function ResMapTable(fileName) {
    this.resTable = new ResTable(fileName);
}

//callback: function(err)
ResMapTable.prototype.load = function(callback) {
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

//when something insert into global table
ResMapTable._onGlobalInsert = function(langKey, keyId, transStr) {
    var table = this.transTable[langKey];
    if(!table) {
        table = this.transTable[langKey] = {};
    }
    table[keyId] = transStr;
}

ResMapTable._onGlobalRemove = function(keyId) {
    var transTable = this.transTable;
    var table;
    for(var lang in transTable) {
        table = transTable[lang];
        delete table[keyId];
    }
}

ResMapTable._onLocalInsert = function(tableName, langKey, keyId, transStr) {
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

ResMapTable._onLocalRemove = function(tableName, keyId) {
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

ResMapTable.prototype._analyzeTable = function() {
    var transTable = this.resTable.transTable;
    var globalTable = this.globalTable = new GlobalTable();
    var localTables = this.localTables = new LocalTables();
    this.langArray = Object.keys(transTable);

    analyzeTable(transTable,globalTable, localTables);
};

ResMapTable.prototype.getGlobalTable = function() {
    return  this.globalTable;
}
ResMapTable.prototype.getLocalTables = function() {
    return this.localTables;
}

ResMapTable.prototype.getLangArray = function() {
    return this.langArray;
}

ResMapTable.prototype.addLang = function(lang) {
    this.langArray.push(lang);
}

//global table
function GlobalTable() {
}

util.inherits(GlobalTable, events.EventEmitter );

GlobalTable.prototype.insert = function(keyId, langKey, transStr) {
    var thisTable = this;
    if(!thisTable[keyId]) {
        thisTable[keyId] = {};
    }
    thisTable[keyId][langKey] = transStr;
    this.emit("insert",langKey,keyId,transStr);
};

GlobalTable.prototype.remove = function(keyId) {
    delete this[keyId];
    this.emit('remove',keyId);
};

function LocalTables() {

}

util.inherits(LocalTables,events.EventEmitter);

LocalTables.prototype.add = function(tableName, globalTable) {
    this[tableName] = globalTable;
    this.emit('add',tableName);
};


LocalTables.prototype.remove = function(tableName) {
    delete this[tableName];
    this.emit('remove',tableName);
};

LocalTables.prototype.getOrCreate = function(tableName) {
    var table = this[tableName];
    if(!table) {
        table = this[tableName] = new GlobalTable();
    }
    return table;
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

exports.ResMapTable = ResMapTable;
exports.GlobalTable = GlobalTable;
exports.LocalTables = LocalTables;

//for test
exports._analyzeTable = analyzeTable;