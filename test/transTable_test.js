
var assert = require('assert');
var TABLE_DATA = require('./transTable_data').TABLE_DATA;
var transTable = require('../serialize/transTable');

describe('KeyTransStrTable should', function() {
    describe('add and remove key and translation str', function() {
        it('get successfully', function() {
            var keyStr = {
                hello: '您',
                world: '世界',
                ni: '你',
                men: '人们'
            };
            var table = transTable.KeyTransStrTable.newTable();
            for(var key in keyStr) {
                table.addKeyTransStr(key, keyStr[key]);
                assert.equal( table.getTransStr(key), keyStr[key] );
            }
            assert.equal(table.getKeys().length, Object.keys(keyStr).length);
            table.getKeys().forEach(function(key) {
                assert(key in keyStr);
                assert.equal(keyStr[key], table.getTransStr(key));
            });
            for(var key in keyStr) {
                table.removeKeyTransStr(key);
                assert( !table.getTransStr(key));
            }
            assert.equal(table.getKeys().length,0);
        })
    });
    describe('serialize and deserialize successfully', function() {
        it('serialize to the string', function() {
            TABLE_DATA.forEach(function(tableData) {
                assert.equal(transTable.KeyTransStrTable.serializeToString(tableData.getTable()),
                    tableData.getStr());
            });
        });
        it('deserialize from the string', function() {
            TABLE_DATA.forEach(function(tableData) {
                assert.deepEqual(transTable.KeyTransStrTable.deserializeFromString(tableData.getStr()),
                    tableData.getTable());
            });
        });
    });
});

describe('KeyTransStrFile and KeyTransStrFileSet should', function() {
    var KeyTransStrFile = transTable.KeyTransStrFile;
    var KeyTransStrFileSet = transTable.KeyTransStrFileSet;
    var readFile = KeyTransStrFile._readFile;
    var writeFile = KeyTransStrFile._writeFile;
    var getDirFiles = KeyTransStrFileSet._getDirFiles;
    before(function() {
        KeyTransStrFile._readFile = function(fileName, callback) {
            var tableData;
            for(var index=0; index<TABLE_DATA.length; ++index) {
                tableData = TABLE_DATA[index];
                if( tableData.getFileName() === fileName) {
                    return callback(null, tableData.getStr());
                }
            }
        };
        KeyTransStrFile._writeFile = function(fileName, str, callback) {
            callback(null,fileName,str);
        };
        KeyTransStrFileSet._getDirFiles = function(dir, callback) {
            var files = [];
            TABLE_DATA.forEach(function(tableData) {
                files.push(tableData.getFileName());
            });
            callback(null,files);
        }
    });

    describe('KeyTransStrFile should', function() {
        function  TestNewFile(tableData) {
            it('create a new KeyTransStrFile', function() {
                var transFile = KeyTransStrFile.newFile(tableData.getLang(), tableData.getFileName());
                transFile.setRootTable(tableData.getTable());
                assert.equal( transFile.getRootTable(), tableData.getTable());
                assert.equal( transFile.getLang(), tableData.getLang());
                transFile.save(function(err,fileName, str) {
                    assert.equal(fileName,tableData.getFileName());
                    assert.equal(str, tableData.getStr());
                });
            });
        };
        TABLE_DATA.forEach( TestNewFile );

        function  TestLoadFile(tableData) {
            it('load from file', function() {
                var transFile = KeyTransStrFile.load(tableData.getFileName(),function(err, transFile) {
                    assert(transFile);
                    assert.deepEqual(transFile.getRootTable(), tableData.getTable());
                    transFile.save(function(err,fileName,str) {
                        assert.equal(fileName, tableData.getFileName());
                        assert.equal(str, tableData.getStr());
                    });
                });
            });
        }
        TABLE_DATA.forEach(TestLoadFile);
    });
    describe('KeyTransStrFileSet should', function() {
        it('load files from dir', function() {
            KeyTransStrFileSet.loadFromDir('',function(err,fileSet) {
                fileSet.getLangArray().forEach(function(lang) {
                    for(var index=0; index<TABLE_DATA.length; ++index) {
                        if( TABLE_DATA[index].getLang() === lang) {
                            break;
                        }
                    }
                    assert(index<TABLE_DATA.length);
                    assert.deepEqual( fileSet.getTransFile(lang).getRootTable(),
                        TABLE_DATA[index].getTable());
                });
            });
        });
    });
    after(function() {
        KeyTransStrFile._readFile = readFile;
        KeyTransStrFile._writeFile = writeFile;
        KeyTransStrFileSet._getDirFiles = getDirFiles;
    });
});