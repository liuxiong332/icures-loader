
var assert = require('assert');
//var ResTable = require('../serialize/icures_rw').ResTable;
//var RES_TABLE = require('./transTable_data').RES_TABLE;
var async = require('async');
var util = require('util');

//describe('icu resource load and save', function() {
//    describe('load from file and write into file', function() {
//        var FILE_NAME = "test.txt";
//        function testReadWrite(element) {
//            it('write into file successfully', function(done) {
//                async.waterfall([
//                    function(callback) {
//                        ResTable._writeIntoFile(element.obj,FILE_NAME,callback);
//                    },
//                    function(callback) {
//                        ResTable._loadFromFile(FILE_NAME,callback);
//                    }
//                ], function(err,table) {
//                    if(err) {
//                        done(err);
//                    } else {
//                        assert.deepEqual(element.obj, table);
//                        done();
//                    }
//
//                });
//
//            });
//        }
//
//        RES_TABLE.forEach( function(element) {
//            testReadWrite(element);
//        });
//    });
//    describe('package process', function() {
//        it('get package name', function() {
//            assert.equal(ResTable._processPackageName("Package_zh.txt"),"Package");
//            assert.equal(ResTable._processPackageName("Package.txt"),"Package");
//            assert.equal(ResTable._processPackageName("Package"),"Package");
//        });
//    });
//    describe('find file names by package name', function() {
//        it('all filename match the package name should return', function() {
//            var files = ['package_cn.txt','package_en.txt'];
//            var langs = ['cn','en'];
//            var fileArray = ResTable._findMatchFileNameByPackageName(files,'package');
//            assert.equal(fileArray.length,files.length);
//            fileArray.forEach(function(element,index) {
//                assert.equal(element.fileName, files[index]);
//                assert.equal(element.lang,langs[index]);
//            });
//        });
//        it('find files by package name', function() {
//            var files = [];
//            RES_TABLE.forEach(function(element) {
//                files.push(element.fileName);
//            });
//            var fileArray = ResTable._findMatchFileNameByPackageName(files,RES_TABLE.packName);
//            assert.equal(fileArray.length,files.length);
//            fileArray.forEach(function(element,index) {
//                assert.equal(element.fileName, files[index]);
//                assert.equal(RES_TABLE[index].lang, element.lang);
//            });
//        });
//    });
//    describe('get package name by specific file name', function() {
//        it('should get the package name', function() {
//            var packNameMap = [{fileName:"C:\\nimei\\package_zh.txt",packName:"package"},
//                {fileName:".\\package.txt",packName:"package"}];
//            packNameMap.forEach(function(element) {
//                assert.equal(ResTable._getPackNameByFileName(element.fileName),element.packName);
//            });
//        });
//    });
//    describe('ResTable Load test',function() {
//        var getDirFiles = ResTable._getDirFiles;
//        var readFile = ResTable._readFile;
//        before(function() {
//            //rewrite getDirFiles, return the file names in the RES_TABLE
//            ResTable._getDirFiles = function(fileName, callback) {
//                var files = [];
//                RES_TABLE.forEach(function(element) {
//                    files.push(element.fileName);
//                });
//                callback(null,files);
//            };
//            ResTable._readFile = function(fileName, callback) {
//                for(var i=0;i<RES_TABLE.length;++i) {
//                    if(RES_TABLE[i].fileName === fileName) {
//                        return callback(null,RES_TABLE[i].str);
//                    }
//                }
//            };
//        });
//        it('ResTable invoke load to get tables ', function(done) {
//            var tableObj = new ResTable(RES_TABLE.packName);
//            assert.equal(tableObj.packName, RES_TABLE.packName);
//            tableObj.load(function(err) {
//                if(err) {
//                    return done(err);
//                }
//                var transTable = tableObj.transTable;
//
//                RES_TABLE.forEach(function(element) {
//                    assert( element.lang in transTable);
//                    assert.deepEqual(transTable[element.lang], element.obj);
//                });
//                done();
//            });
//        })
//        after(function() {
//            //restore the readFile and getDirFiles property
//            ResTable._readFile = readFile;
//            ResTable._getDirFiles = getDirFiles;
//        })
//    });
//});