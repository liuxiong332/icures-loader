
var fs = require('fs');
var async = require('async');
var serialize = require('./serialize');
var path = require('path');

//when the table object load completely, callback will be invoked
//callback's signature is function(err,table)
function  loadFromFile(fileName, callback) {
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
}

//serialize obj and write into file, when complete, callback will invoke
//callback's signature is function(err)
function writeIntoFile(obj, fileName, callback) {
    var strOut = serialize.serializeToString(obj);
    fs.writeFile(fileName, strOut,callback);
}

//get the package name by the file name
//for example, the package name of "Package_zh.txt" and "Package_en.txt" is Package
function processPackageName(packName) {
    var index = packName.search(/_|\./);
    if(index === -1) {
        return packName;
    }
    return packName.slice(0,index);
}

//find the file name that match the package name
//findCallback: function(fileName,index,langKey), callback when found the file name match the packname
function findMatchFileNameByPackageName(files, packName, findCallback) {
    var fileArray = {};
    var matchReg = new RegExp('^'+packName+"_(\w*)\\.txt");  // (\w*) stand for language str
    files.forEach(function(file,index) {
        var match = matchReg.exec(file) ;
        if(match !== null) {
            findCallback(file,index,langKey);
        }
    });
}

//get the file names in the directory that filename is included
function  getDirFiles(fileName, callback) {
    var dirName = path.dirname(fileName);
    fs.readdir(dirName, function(err,files) {
        if(err)    return callback(err);
        callback(null,files);
    });
}

//get package name by analyzing file name
function  getPackNameByFileName(fileName) {
    var baseName = path.basename(fileName);
    return processPackageName(baseName);
}

//load all of the table object from the files
//fileName : package file path
//callback: function(err,files)
function loadAllLangTable(fileName, callback) {
    var packageName = getPackNameByFileName(fileName);
    var fileArray = {};
    getDirFiles(fileName, function(err,files) {
        if(err) return callback(err);
        findMatchFileNameByPackageName(files,packageName,function(fileName,key) {        //file name match the regex
            loadFromFile(fileName,function(err,table) {
                if(err)    return;
                fileArray[key] = table;    //if load successfully, add into fileArray
            });
        });
    });
}

exports._writeIntoFile = writeIntoFile;
exports._loadFromFile = loadFromFile;
exports._processPackageName = processPackageName;

exports._findMatchFileNameByPackageName = findMatchFileNameByPackageName;