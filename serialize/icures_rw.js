
var fs = require('fs');
var async = require('async');
var serialize = require('./serialize');
var path = require('path');


//serialize obj and write into file, when complete, callback will invoke
//callback's signature is function(err)
function writeIntoFile(obj, fileName, callback) {
    var strOut = serialize.serializeToString(obj);
    fs.writeFile(fileName, strOut,callback);
}


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
//findCallback: function(fileName,index,langKey), callback when found the file name match the packname
ResTable._findMatchFileNameByPackageName = function(files, packName, findCallback) {
    var fileArray = {};
    var matchReg = new RegExp('^'+packName+"_(\w*)\\.txt");  // (\w*) stand for language str
    files.forEach(function(file,index) {
        var match = matchReg.exec(file) ;
        if(match !== null) {
            findCallback(file,index,langKey);
        }
    });
};

//when the table object load completely, callback will be invoked
//callback's signature is function(err,table)
ResTable._loadFromFile = function(fileName, callback) {
    async.waterfall([
        function(callback) {
            fs.readFile(fileName,{encoding:'utf8'},callback);
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


//Load all the resource files in the specific directory
//callback : function(err)
ResTable.prototype.Load = function(callback) {
    var transTable = this.transTable = {};
    ResTable._getDirFiles(this.fileName, function(err,files) {
        if(err) return callback(err);
        ResTable._findMatchFileNameByPackageName(files,packageName,function(fileName,key) {        //file name match the regex
            ResTable._loadFromFile(fileName,function(err,table) {
                if(err)    return ;
                transTable[key] = table;    //if load successfully, add into fileArray
            });
        });
    });
};

//load all of the table object from the files
//fileName : package file path
//callback: function(err,fileArray)
ResTable._loadAllLangTable = function(fileName, callback) {
    var packageName = ResTable._getPackNameByFileName(fileName);
    ResTable._getDirFiles(fileName, function(err,files) {
        if(err) return callback(err);
        var fileArray = {};
        ResTable._findMatchFileNameByPackageName(files,packageName,function(fileName,key) {        //file name match the regex
            ResTable._loadFromFile(fileName,function(err,table) {
                if(err)    return;
                fileArray[key] = table;    //if load successfully, add into fileArray
            });
        });
        callback(null, fileArray);
    });
}

exports._writeIntoFile = writeIntoFile;
exports._loadFromFile = loadFromFile;
exports._processPackageName = processPackageName;

exports._findMatchFileNameByPackageName = findMatchFileNameByPackageName;
exports._getPackNameByFileName = getPackNameByFileName;