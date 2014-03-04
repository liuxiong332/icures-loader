
//the table stand for the map of keyId and the translation string
function KeyTransStrTable() {
    this.tableName = "root";
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
            outStr = outStr + element;
            serializeNode(keyStrTable[key]);
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
function  KeyTransStrFile(fileName) {
    this.fileName = fileName;
    this.rootTable = null;
}

//load from file
KeyTransStrFile.load = function(fileName) {
    var transFile = new KeyTransStrFile(fileName);
}

KeyTransStrFile.newFile = function(fileName) {
    var transFile = new  KeyTransStrFile(fileName);
};

KeyTransStrFile.prototype.save = function() {

}

KeyTransStrFile.prototype.getRootTable = function() {
    return rootTable;
};


function KeyTransStrFileSet( fileNames) {
    this.langFileMap = {};
}

KeyTransStrFileSet.load = function(packName, fileNames) {
    this.packName = packName;
    this.langFileMap = {};
};

KeyTransStrFileSet.loadFromDir = function(packName, dir) {

};

KeyTransStrFileSet.newFileSet = function(langArray, dir) {

};

KeyTransStrFileSet.prototype.getLangArray = function() {

}
 
//add a language translation file, dir is the save directory
KeyTransStrFileSet.prototype.addLang = function(lang, fileName) {

}

KeyTransStrFileSet.prototype.addFile = function(fileName) {

}

KeyTransStrFileSet.prototype.removeLang = function(lang) {

}