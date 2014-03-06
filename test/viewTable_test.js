
var assert = require('assert');
var async = require('async');
var util = require('util');
var tableData = require('./transTable_data');
var viewTable = require('../serialize/viewTable');


describe('TableSetView and TableView should', function() {
    it('LangToTransStrMap test', function() {
        var LangPair = viewTable.langTransStrPair;
        var langMap = new viewTable.LangToTransStrMap();
        langMap.insert(new LangPair('en','hello'));
        assert.equal(langMap.getByLang('en'), 'hello');
        langMap.insert( new LangPair('zh','你好') );
        assert.equal(langMap.getByLang('zh'),'你好');
        langMap.remove('en');
        assert(!langMap.getByLang('en'));
    });
    it('TableView test', function() {
        var tableView = new  viewTable.TableView();
        var enStr = new viewTable.langTransStrPair('en','hello');
        var zhStr = new viewTable.langTransStrPair('zh','你好');
        var key = 'hello';
        tableView.insert(key, enStr);

        var langMap = tableView.getLangTransStrMap(key);
        assert.equal(langMap.getByLang(enStr.lang), enStr.transStr);

        tableView.insert(key, zhStr);
        langMap = tableView.getLangTransStrMap(key);
        assert.equal(langMap.getByLang(zhStr.lang), zhStr.transStr);

        tableView.remove(key);
        assert(!tableView.getLangTransStrMap(key));
    });
    it('tabsetView test', function() {
        var tableSetView = new viewTable.TableSetView();
        var tableView = new viewTable.TableView();
        var tableName = 'table';
        tableSetView.add(tableName,tableView);
        assert.equal( tableSetView.getTableNames().length,1 );
        tableSetView.getTableNames().forEach(function(name) {
            assert.equal(tableName,name);
            assert.deepEqual( tableSetView.getTable(tableName), tableView);
        });
        assert.deepEqual( tableSetView.getOrCreate(tableName), tableView);
        tableSetView.remove(tableName);
        assert.equal( tableSetView.getTableNames().length, 0);
        tableSetView.getOrCreate(tableName);
        assert.deepEqual(tableSetView.getTable(tableName),tableView);
    });
});

describe('allTableView should', function() {
    it('load file set', function() {
        var fileSet = tableData.FILE_SET;
        var allTableView = new viewTable.AllTableView( fileSet );
        assert.deepEqual( allTableView.getLangArray(), fileSet.getLangArray());
        var globalTable = allTableView.getGlobalTable();
        var childTables = allTableView.getChildTables();
        judgeAllTableView();

        globalTable.insert('keyid',new viewTable.langTransStrPair('en','keyid'));
        judgeAllTableView();
        globalTable.remove('keyid');
        judgeAllTableView();

        childTables.add('test_table',new viewTable.TableView());
        judgeAllTableView();
        childTables.remove('test_table', new viewTable.TableView());
        judgeAllTableView();

        childTables.forEachTable( function(tableName,tableView) {
            tableView.insert('childkeyid',new viewTable.langTransStrPair('en','childkeyid'));
            judgeAllTableView();
        });
        childTables.forEachTable( function(tableName,tableView) {
            tableView.remove('childkeyid');
            judgeAllTableView();
        });

        function judgeAllTableView() {
            judgeTableView(globalTable,fileSet);
            childTables.forEachTable( function(tableName, tableView) {
                judgeChildTableView(tableView,tableName,fileSet);
            });
        }
        function judgeTableView(tableView, fileSet) {
            assert.deepEqual(tableView.getKeys(),
                fileSet.getTransFile('en').getRootTable().getKeys());
            //all of the translate string in global table view is also in the file set
            tableView.forEachKey(function(key, langTransStr) {
                langTransStr.forEachLang(function(lang,transStr) {
                    assert.equal( fileSet.getTransFile(lang).getRootTable().getTransStr(key), transStr);
                });
            });
            //all of the translate string in file set is also in global table set
            fileSet.forEachFile(function(transFile) {
                var lang = transFile.getLang();
                transFile.getRootTable().forEachKey( function(key,transStr){
                    assert.equal( tableView.getLangTransStrMap(key).getByLang(lang),
                        transStr);
                });
            });
        }
        function judgeChildTableView(tableView, tableName, fileSet) {
            tableView.forEachKey(function(key, langTransStr) {
                langTransStr.forEachLang(function(lang,transStr) {
                    assert.equal( fileSet.getTransFile(lang).getRootTable()
                        .getChildTableByName(tableName).getTransStr(key), transStr);
                });
            });
            //all of the translate string in file set is also in global table set
            fileSet.forEachFile(function(transFile) {
                var lang = transFile.getLang();
                transFile.getRootTable().getChildTableByName(tableName)
                    .forEachKey( function(key,transStr){
                    assert.equal( tableView.getLangTransStrMap(key).getByLang(lang),
                        transStr);
                });
            });
        }
    });
});