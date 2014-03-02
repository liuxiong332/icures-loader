
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
var util = require('util');

function  serializeToString( table ) {
    if(typeof table !== 'object' ) {
        throw new Error('the table object is not valid object');
    }
    var topkeys = Object.keys(table);
    var topKey;
    if(topkeys.length !== 1)     return undefined;
    topKey = topkeys[0];

    var outStr = '';
    serializeTableNodeValue(table);
    return  outStr;

    //node stand for the table value, which starts from '{' and ends to '}'
    function  serializeNode(node) {
        outStr = outStr + '{';
        serializeNodeValue(node);
        outStr = outStr + '}';
    }

    //node value stand for translation value, which is embed in the bracket
    function  serializeNodeValue(node) {
        if(typeof node === 'string') {
            serializeStrNodeValue(node);
        } else if(typeof node === 'object') {
            serializeTableNodeValue(node);
        }
    }
    //when the node is string, invoke the function
    function  serializeStrNodeValue(node) {
        outStr = outStr + '"'+node.toString()+'"';
    }
    //when the node is table, invoke the function
    function  serializeTableNodeValue(node) {
        var keys = Object.keys(node);
        var index;
        keys.forEach(function(element) {
            outStr = outStr + element;
            serializeNode(node[element]);
        });
    }
}

function  deserializeFromString(resStr) {
    //search for words, {, }, and words,{,} and something in the quotation mark
    var searchRegex = /("[^"]*")|\w*[^ {]|{|}/g;
    var table = {};
    table[getNextMatch()] = analyzeNode();
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
        var table = {};
        while( peerNextMatch() !== '}') {
            table[getNextMatch()] = analyzeNode();
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

exports.serializeToString = serializeToString;
exports.deserializeFromString = deserializeFromString;