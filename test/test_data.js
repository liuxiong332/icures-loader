
var RES_TABLE = [
    { fileName:"package_zh.txt",lang:"zh",obj:{ hello: "你妹" }, str:'hello{"你妹"}'},
    { fileName:"package_en.txt",lang:"en",obj:{ world:{ni:"ni","da":"汉子"}}, str:'world{ni{"ni"}da{"汉子"}}'}
]  ;

var TABLE_MAP =
{
    transTable: {
        en: {hello: "hello", world: "world", good: { good: "good"}},
        cn: {hello: "你好", world: "世界", good: { good: '好'}}
    },
    mapTable: {
        hello: {en: "hello", cn:"你好"},
        world: {en: "world", cn: "世界"}
    },
    localMapTable: {
        good: { good: {en: "good", cn:"好"} }
    }
};

RES_TABLE.packName = "package";

exports.RES_TABLE = RES_TABLE;
exports.TABLE_MAP = TABLE_MAP;