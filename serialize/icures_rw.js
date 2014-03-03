
var fs = require('fs');
var async = require('async');
var serialize = require('./serialize');
var path = require('path');
var util = require('util');

//ResTable stand for the translate tables
function  ResTable(fileName) {
    this.packName = ResTable._getPackNameByFileName(fileName);
    this.fileName = fileName;
}



//get the package name by the file name
//for example, the package name of "Package_zh.txt" and "Package_en.txt" is Package
ResTable._processPackageName = function(fileBaseName) {
    var index = fileBaseName.search(/_|\./);
    if(index === -1) {
        return fileBaseName;
    }
    return fileBaseName.slice(0,index);
};

//get package name by analyzing file name
ResTable._getPackNameByFileName = function(fileName) {
    var baseName = path.basename(fileName);
    return ResTable._processPackageName(baseName);
};

//get the file names in the directory that filename is included
ResTable._getDirFiles = function(fileName, callback) {
    var dirName = path.dirname(fileName);
    fs.readdir(dirName, function(err,files) {
        if(err)    return callback(err);
        callback(null,files);
    });
};


//find the file name that match the package name
//return fileArray, in the fileArray is object {fileName, lang}
ResTable._findMatchFileNameByPackageName = function(files, packName) {
    var fileArray = [];
    var matchReg = new RegExp('^'+packName+"_(\\w*)\\.txt");  // (\w*) stand for language str
    files.forEach(function(file,index) {
        var match = matchReg.exec(file) ;
        if(match !== null) {
            fileArray.push({fileName:file, lang:match[1]});
        }
    });
    return fileArray;
};

//wrap the fs.readFile, for testing
ResTable._readFile = function(fileName, callback) {
    fs.readFile(fileName,{encoding:'utf8'},callback);
}
//wrap fs.writeFile, for testing
ResTable._writeFile = function(fileName, str, callback) {
    fs.writeFile(fileName, strOut,callback);
}
//when the table object load completely, callback will be invoked
//callback's signature is function(err,table)
ResTable._loadFromFile = function(fileName, callback) {
    async.waterfall([
        function(callback) {
            ResTable._readFile(fileName,callback);
        },
        function(data,callback) {
            if(typeof data !== 'string') {
                callback(new Error());
            } else {
                callback(null,serialize.deserializeFromString(data));
            }
        }
    ], callback);
};

//serialize obj and write into file, when complete, callback will invoke
//callback's signature is function(err)
ResTable._writeIntoFile = function(obj, fileName, callback) {
    var strOut = serialize.serializeToString(obj);
    ResTable._writeFile(fileName,strOut,callback);
}

//Load all the resource files in the specific directory
//callback : function(err)
ResTable.prototype.load = function(callback) {
    var transTable = this.transTable = {};
    var packName = this.packName;
    ResTable._getDirFiles(this.fileName, function(err,files) {
        if(err) return callback(err);
        var fileArray = ResTable._findMatchFileNameByPackageName(files,packName);

        async.each(fileArray, insertTableObject, callback);

        //insert {fileName, lang} object into transTable
        function insertTableObject(fileInfo,callback) {        //file name match the regex
            ResTable._loadFromFile(fileInfo.fileName,function(err,table) {
                if(err)    return callback(err);
                transTable[fileInfo.lang] = table;    //if load successfully, add into fileArray
                callback();
            });
        }
    });
};

//tables stand for table objects, callback is function(err)
ResTable._save = function(tables,callback) {
    var packName = this.packName;
    async.each(Object.keys(tables),writeEachFile, callback);
    function writeEachFile(lang,callback) {
        var fileName = packName+'_'+lang+'.txt';
        ResTable._writeIntoFile(tables[lang],fileName,callback);
    }
};

ResTable.prototype.save = function(callback) {
    ResTable._save(this.transTable,callback);
};

exports.ResTable = ResTable;
