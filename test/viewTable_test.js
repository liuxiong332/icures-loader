
var assert = require('assert');
var async = require('async');
var util = require('util');
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
