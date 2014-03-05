
var async = require('async');
var path = require('path');

//the table stand for the map of keyId and the translation string
function KeyTransStrTable(tableName) {
    this.tableName = tableName || "root";
    this.keyTransStrMap = {};
    this.childTableMap = {};
}

KeyTransStrTable.prototype.save = function() {
    KeyTransStrTable.serializeToString(this);
}

//get array of the key
KeyTransStrTable.prototype.getKeys = function() {
    return Object.keys(this.keyTransStrMap);
}

//get translation str of the specific key
KeyTransStrTable.prototype.getTransStr = function(key) {
    return this.keyTransStrMap[key];
}

KeyTransStrTable.prototype.addKeyTransStr = function(key,transStr) {
    this.keyTransStrMap[key] = transStr;
}

KeyTransStrTable.prototype.removeKeyTransStr = function(key) {
    delete this.keyTransStrMap[key];
}

//get all of the child KeyTransStrTable name
KeyTransStrTable.prototype.getChildTableNames = function() {
    return Object.keys(this.childTableMap);
}

KeyTransStrTable.prototype.getChildTableByName = function(tableName) {
    return this.childTableMap[tableName];
}

KeyTransStrTable.prototype.addChildTable = function(tableName, childTable) {
    childTable.tableName = tableName;
    this.childTableMap[tableName] = childTable;
}

KeyTransStrTable.prototype.removeChildTable = function(tableName) {
    delete this.childTableMap[tableName];
}
//add the child node, the node can be (key,transStr), or (tableName,childTable)
KeyTransStrTable.prototype.addChildNode = function(key, value) {
    if(value instanceof KeyTransStrTable) {
        this.addChildTable(key,value);
    } else {
        this.addKeyTransStr(key,value);
    }
}

KeyTransStrTable.prototype.getChildNode = function(key) {
    return this.keyTransStrMap[key] || this.childTableMap[key];
}
//create a new table
KeyTransStrTable.newTable = function(lang) {
    return new KeyTransStrTable(lang);
}

KeyTransStrTable.serializeToString = function( keyTransStrTable ) {
    var outStr = keyTransStrTable.tableName ;
    serializeNode(keyTransStrTable);
    return  outStr;

    //node stand for the table value, which starts from '{' and ends to '}'
    function  serializeNode(node) {
        outStr = outStr + '{';
        serializeNodeValue(node);
        outStr = outStr + '}';
    }

    //node value stand for translation value, which is embed in the bracket
    function  serializeNodeValue(node) {
        if(node instanceof KeyTransStrTable) {
            serializeTableNodeValue(node);
        } else  {
            serializeStrNodeValue(node);
        }
    }
    //when the node is string, invoke the function
    function  serializeStrNodeValue(node) {
        outStr = outStr + '"'+node.toString()+'"';
    }
    //when the node is table, invoke the function
    function  serializeTableNodeValue(keyStrTable) {
        keyStrTable.getKeys().forEach(seriaTable);
        keyStrTable.getChildTableNames().forEach(seriaTable);
        function seriaTable(key) {
            outStr = outStr + key;
            serializeNode(keyStrTable.getChildNode(key));
        }
    }
}

//load the translate table from the resStr
KeyTransStrTable.deserializeFromString = function(resStr) {
    //search for words, {, }, and words,{,} and something in the quotation mark
    var searchRegex = /("[^"]*")|\w*[^ {]|{|}/g;
    var tableName = getNextMatch();
    var table = analyzeNode();
    table.tableName = tableName;
    return table;

    function getNextMatch() {
        var match = searchRegex.exec(resStr);
        if(match === null)  return false;
        return match[0];
    }

    function peerNextMatch() {
        var lastIndex = searchRegex.lastIndex;  //save the lastIndex for restore
        var match = getNextMatch();
        searchRegex.lastIndex = lastIndex;      //restore the origin state
        return match;
    }

    //deserialize from string to get table
    function analyzeTable() {
        var table = new KeyTransStrTable();
        var key, node;
        while( peerNextMatch() !== '}') {
        //    table[getNextMatch()] = analyzeNode();
            key = getNextMatch();
            node = analyzeNode();
            table.addChildNode(key, node);
        }
        return table;
    }

    //analyze value in the bracket
    function analyzeNodeValue() {
        var nextToken = peerNextMatch();
        if(nextToken.charAt(0) === '"') {     //the node is  string, not table
            getNextMatch();
            return  nextToken.slice(1,-1);  //take out the quotation mark from string
        } else {
            return  analyzeTable();
        }
    }
    //analyze the node which is included in the bracket, like { ... }
    function analyzeNode(  ) {
        if(getNextMatch() !== '{') {
            throw new Error();
        }
        var nodeValue = analyzeNodeValue();
        if(getNextMatch() !== '}') {
            throw new Error();
        }
        return nodeValue;
    }
}


/*
 icu ResourceBundle is used for international, this component need
 resource file to translate. In order to get resource file(*.res), we
 can create a new txt file(*.txt), then transform to resource file by
 icu tool genrb.
 the txt file is similar in the following:
 root {
 usage { "Usage: genrb [Options] files" }
 version { 122 }
 }

 */
function  KeyTransStrFile(fileName, rootTable) {
    this.fileName = fileName;
    this.rootTable = rootTable;
}

//wrap the fs.readFile, for testing
KeyTransStrFile._readFile = function(fileName, callback) {
    fs.readFile(fileName,{encoding:'utf8'},callback);
}
//wrap fs.writeFile, for testing
KeyTransStrFile._writeFile = function(fileName, str, callback) {
    fs.writeFile(fileName, str,callback);
}
//load from file
//callback: function(err, transStrFile)
KeyTransStrFile.load = function(fileName, callback) {
    KeyTransStrFile._readFile(fileName,function(err, data) {
        var table;
        try {
            table = KeyTransStrTable.deserializeFromString(data)
        } catch(err) {
            return callback(err);
        }
        var transFile = new KeyTransStrFile(fileName, table);
        callback(null,transFile);
    });
}

KeyTransStrFile.newFile = function(lang, fileName) {
    var table = KeyTransStrTable.newTable(lang,fileName);
    return new  KeyTransStrFile(fileName,table);
};

//callback: function(err)
KeyTransStrFile.prototype.save = function(callback) {
    var outStr = KeyTransStrTable.serializeToString( this.rootTable );
    KeyTransStrFile._writeFile(this.fileName, outStr, callback);
}

KeyTransStrFile.prototype.getRootTable = function() {
    return this.rootTable;
};

KeyTransStrFile.prototype.setRootTable = function(table) {
    this.rootTable = table;
}

KeyTransStrFile.prototype.getLang = function() {
    return this.rootTable.tableName;
}

function KeyTransStrFileSet( fileNames) {
    this.langFileMap = {};
}

//callback: function(err,fileSet);
KeyTransStrFileSet.loadFromFiles = function( fileNames , callback) {
    var fileSet = new KeyTransStrFileSet();
    async.each(fileNames, KeyTransStrFileSet.prototype.loadFile.bind(fileSet), function(err) {
        callback(err,fileSet);
    });
}

//get all the txt file names in the directory
//callback: function(err,files)
KeyTransStrFileSet._getDirFiles = function(dir, callback) {
    fs.readdir(dir, function(err,files) {
        if(err)    return callback(err);
        var txtRegex = /\.txt/;
        var txtFiles = files.filter(function(fileName) {
            return txtRegex.test(fileName);
        })
        callback(null,txtFiles);
    });
};

//callback: function(err,fileSet)
KeyTransStrFileSet.loadFromDir = function( dir, callback) {
    async.waterfall([
        function(callback) {
            KeyTransStrFileSet._getDirFiles(dir,callback);
        },
        function(files, callback) {
            KeyTransStrFileSet.loadFromFiles(files, callback);
        }
    ], callback);
};

KeyTransStrFileSet._getFileNameByLang = function(lang,dir) {
    return path.join(dir, lang+'.txt');
};

KeyTransStrFileSet.newFileSet = function(langArray, dir) {
    var langFileMap = this.langFileMap;
    langArray.forEach(function(lang) {
        var transFile = KeyTransStrFile.newFile(lang, KeyTransStrFileSet._getFileNameByLang(lang,dir));
        langFileMap[ transFile.getLang() ] = transFile;
    });
};

//load the existing file
KeyTransStrFileSet.prototype.loadFile = function(fileName, callback) {
    var langFileMap = this.langFileMap;
    KeyTransStrFile.load(fileName, function(err,transFile) {
        if(!err) {
            langFileMap[ transFile.getLang() ] = transFile;
        }
        callback(null);
    });
}
KeyTransStrFileSet.prototype.getLangArray = function() {
    return Object.keys(this.langFileMap);
}
KeyTransStrFileSet.prototype.getTransFile = function(lang) {
    return this.langFileMap[lang];
}
//add a language translation file, dir is the save directory
//KeyTransStrFileSet.prototype.addLang = function(lang, fileName) {
//    throw "now donnot support addlang";
//}
//
//KeyTransStrFileSet.prototype.addFile = function(fileName) {
//
//}
//
//KeyTransStrFileSet.prototype.removeLang = function(lang) {
//
//}

exports.KeyTransStrTable = KeyTransStrTable;
exports.KeyTransStrFile = KeyTransStrFile;
exports.KeyTransStrFileSet = KeyTransStrFileSet;