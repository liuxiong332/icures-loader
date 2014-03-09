
//lang: language name
//description: the description of the language
//fileName:  the path of the language file
function LangInfo(lang,description,fileName) {
    this.lang = lang;
    this.description = description;
    this.fileName = fileName;
}

LangInfo.prototype.setLang = function(lang) {
    this.lang = lang;
};
LangInfo.prototype.setDescription = function(des) {
    this.description = des;
};
LangInfo.prototype.setFileName = function(file) {
    this.fileName = file;
};

LangInfo.prototype.getLang = function() {
    return this.lang;
};
LangInfo.prototype.getDescription = function() {
    return this.description;
};
LangInfo.prototype.getFileName = function() {
    return this.filename;
};

//openType represent the method of opening the language files, can be 'open' or 'create'
function LangInfoList( openType ) {
    this.openType = openType;
    this.langInfoList = {};
};

LangInfoList.prototype.addLangInfo = function(langInfo) {
    this.langInfoList[langInfo.getLang()] = langInfo;
};

LangInfoList.prototype.removeLangInfo = function(lang) {
    delete this.langInfoList[lang];
};
LangInfoList.prototype.isLangExisting = function(lang) {
    return this.langInfoList[lang] !== undefined;
};

LangInfoList.prototype.getLangs = function() {
    return Object.keys(this.langInfoList);
};
//callbackfn: function(langInfo)
LangInfoList.prototype.forEachLangInfo = function(callbackfn, that) {
    var callback = that?callbackfn.bind(that):callbackfn;
    var langList = this.langInfoList;
    for(var lang in langList) {
        callback( langList[lang] );
    }
};

exports.LangInfo = LangInfo;
exports.LangInfoList = LangInfoList;