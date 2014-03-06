
var async = require('async');
var util = require('util');
var events = require('events');
var transTable = require('./transTable');

function  langTransStrPair(lang,str) {
    this.lang = lang;
    this.transStr = str;
}

langTransStrPair.prototype.getLang = function() {
    return this.lang;
}
langTransStrPair.prototype.getTransStr = function() {
    return this.transStr;
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
    this.langTransMap[langTrans.getLang()] = langTrans.getTransStr();
}
LangToTransStrMap.prototype.insertArray = function( langTransArray ) {
    langTransArray.forEach(function(langStrPair) {
        this.insert( langStrPair );
    },this);
};
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
//callbackfn: function(lang, transStr)
LangToTransStrMap.prototype.forEachLang = function( callbackfn, that) {
    var callback = that?callbackfn.bind(that):callbackfn;
    var langTransMap = this.langTransMap;
    for(var lang in langTransMap) {
        callback(lang, langTransMap[lang]);
    }
}

function TableView() {
    this.keyLangMap = {};
}

TableView.prototype.isKeyExisting = function(key) {
    return this.keyLangMap[key];
}

util.inherits(TableView, events.EventEmitter );

//langTrans: object of langTransStrPair
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
//callbackfn: function(key, langTransStr);
TableView.prototype.forEachKey = function( callbackfn,that ) {
    var callback = that?callbackfn.bind(that):callbackfn;
    var keyLangMap = this.keyLangMap;
    for(var key in keyLangMap) {
        callback(key, keyLangMap[key]);
    }
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

//get the tableView of the specific tableName, if not existing, create a new tableView
TableSetView.prototype.getOrNew = function(tableName) {
    var tableSet = this.tableSet;
    if(!tableSet[tableName]) {
        this.add(tableName,new TableView());
    }
    return tableSet[tableName];
}

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
//iterate each table
//callbackfn: function(tableName, tableView)
TableSetView.prototype.forEachTable = function( callbackfn,that ) {
    var callback = that?callbackfn.bind(that):callbackfn;
    var tableSet = this.tableSet;
    for(var tableName in tableSet) {
        callback(tableName, tableSet[tableName] );
    }
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

//transFileSet: object of KeyTransStrFileSet
function AllTableView( transFileSet ) {
    this.transFileSet = transFileSet;
    var globalTable = this.globalTable = new TableView();
    var childTables = this.childTables = new TableSetView();
    this._analyzeTable();

    globalTable.on('insert', AllTableView.prototype._onGlobalInsert.bind(this));
    globalTable.on('remove', AllTableView.prototype._onGlobalRemove.bind(this));
    childTables.on('add', AllTableView.prototype._onAddChildTable.bind(this));
    childTables.on('remove', AllTableView.prototype._onRemoveChildTable.bind(this));
    childTables.forEachTable( function(tableName, tableView) {
        tableView.on('insert', AllTableView.prototype._onChildTableInsert.bind(this,tableName));
        tableView.on('remove', AllTableView.prototype._onChildTableRemove.bind(this,tableName));
    }, this);
}

//create a new AllTableView by the file names
//create a new AllTableView by the files in the specific dir
AllTableView.newView = function( langArray, dir ) {
    var transFileSet = transTable.KeyTransStrFileSet.newFileSet(langArray,dir);
    return new AllTableView(transFileSet);
}

//callback: function(err, tableView)
AllTableView.load = function( fileNames, callback) {
    transTable.KeyTransStrFileSet.loadFromFiles(fileNames, function(err,fileSet) {
        if(err) {
            return callback(err);
        }
        var tableView = new AllTableView(fileSet);
        callback(null, tableView);
    });
};

//callback: function(err, tableView)
AllTableView.loadInDir = function( dir, callback ) {
    transTable.KeyTransStrFileSet.loadFromDir(dir, function(err,fileSet) {
        if(err) {
            return callback(err);
        }
        var tableView = new AllTableView(fileSet);
        callback(null, tableView);
    });
};


AllTableView.prototype.getTableByLang = function(lang) {
    var transFile = this.transFileSet.getTransFile( lang );
    if(!transFile) {
        return null;
    }
    return transFile.getRootTable();
};

//when something insert into global table
AllTableView.prototype._onGlobalInsert = function(keyId, langTrans) {
    var table = this.getTableByLang(langTrans.getLang());
    if(table) {
        table.addKeyTransStr(keyId, langTrans.getTransStr());
    }
};

AllTableView.prototype._onGlobalRemove = function(keyId) {
    this.transFileSet.forEachFile( function(transFile) {
        transFile.getRootTable().removeKeyTransStr(keyId);
    });
};

AllTableView.prototype._onChildTableInsert = function(tableName, keyId, langTrans) {
    var table = this.getTableByLang(langTrans.getLang());
    if(!table) {
        return ;
    }
    var childTable = table.getChildTableByName(tableName);
    if(!childTable) {
        return ;
    }
    childTable.addKeyTransStr(keyId, langTrans.getTransStr());
};

AllTableView.prototype._onChildTableRemove = function(tableName, keyId) {
    this.transFileSet.forEachFile( function(transFile) {
        var childTable = transFile.getRootTable().getChildTableByName(tableName);
        if(childTable) {
            childTable.removeKeyTransStr(keyId);
        }
    });
}

AllTableView.prototype._onAddChildTable = function(tableName, tableView) {
    this.transFileSet.forEachFile( function(transFile) {
        var table = transFile.getRootTable();
        var childTable = new transTable.KeyTransStrTable(tableName);
        table.addChildTable(tableName, childTable);
        //TODO if transFile contain some element, then need to synchronize to translation files
    });
};
AllTableView.prototype._onRemoveChildTable = function(tableName) {
    this.transFileSet.forEachFile( function(transFile) {
        var table = transFile.getRootTable();
        table.removeChildTable(tableName);
    });
};

//analyze transTable, get tableView
function  analyzeTable(transTable,lang, tableView) {
    transTable.getKeys().forEach(function(key) {
        var transStr = transTable.getTransStr(key);
        tableView.insert(key,new langTransStrPair(lang,transStr));
    });
};

AllTableView.prototype._analyzeTable = function() {
    var fileSet = this.transFileSet;
    var globalTable = this.globalTable ;
    var childTables = this.childTables ;
    fileSet.getLangArray().forEach( function(lang) {
        var table = fileSet.getTransFile(lang).getRootTable();
        analyzeTable(table, lang, globalTable);

        table.getChildTableNames().forEach( function(tableName) {
            var childTable = table.getChildTableByName(tableName);
            var tableView = childTables.getOrCreate(tableName);
            analyzeTable(childTable,lang,tableView);
        })
    });
};
//return global table of TableView
AllTableView.prototype.getGlobalTable = function() {
    return  this.globalTable;
}
//return child tables of TableSetView
AllTableView.prototype.getChildTables = function() {
    return this.childTables;
}

AllTableView.prototype.getLangArray = function() {
    return this.transFileSet.getLangArray();
}

//AllTableView.prototype.addLang = function(lang) {
//    this.langArray.push(lang);
//}
//
//AllTableView.prototype.removeLang = function(lang) {
//
//}

//for test
//exports._analyzeTable = analyzeTable;
//exports.LangToTransStrMap = LangToTransStrMap;

exports.langTransStrPair = langTransStrPair;
exports.LangToTransStrMap = LangToTransStrMap;
exports.TableView = TableView;
exports.TableSetView = TableSetView;
exports.AllTableView = AllTableView;