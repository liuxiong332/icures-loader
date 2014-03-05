
var assert = require('assert');
var util = require('util');
var TABLE_DATA = require('./transTable_data').TABLE_DATA;
var transTable = require('../serialize/transTable');

describe('KeyTransStrTable should', function() {
//    describe('serialize', function() {
//        it('to string', function() {
//            transTable.KeyTransStrTable.serializeToString()
//        });
//    });
//    it('should serialize to the specific string', function() {
//        RES_TABLE.forEach(function(element) {
//            assert.equal( element.str,
//                serialize.serializeToString(element.obj).toString());
//        });
//    });
//    it('should deserialize from the specific string', function() {
//        RES_TABLE.forEach(function(element) {
//            assert.deepEqual( element.obj,
//                serialize.deserializeFromString(element.str));
//        });
//    });
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