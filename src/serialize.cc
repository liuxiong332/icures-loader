#include "serialize.h"
#include <assert.h>
#include <regex>

void TableValue::Insert( const std::wstring& key, ResNode* node )
{
	table_value_.insert( std::make_pair(key,node));
}

void TableValue::forEach( VisitorFunc func )
{
	for(auto iter=table_value_.begin();iter!=table_value_.end();++iter) {
		func(iter->first, iter->second);
	}
}


ResNode::ResNode()
{
	node_type_ = NONE_NODE;
}


ResNode::NodeType ResNode::GetNodeType() const
{
	return node_type_;
}

void ResNode::SetNodeType( NodeType type )
{
	node_type_ = type;
}

void ResNode::SetStrValue( const std::wstring& str_value )
{
	assert(node_type_ == NONE_NODE);
	node_type_ = STRING_NODE;
	str_value_ = str_value;
}

std::wstring ResNode::GetStrValue() const
{
	assert(node_type_ == STRING_NODE);
	return str_value_;
}

TableValue* ResNode::GetTableValue()
{
	assert(node_type_ != STRING_NODE);
	node_type_ = TABLE_NODE;
	return &table_value_;
}


const wchar_t*	kSearchRegex = L"\\w|\\{|\\}|\"(\\w|\\s)*\"";	//找出所有 字符串 和 { }
 
void SerializeToString( const TableValue* table, std::wstring* res_str )
{

}

class  TokenIterator
{
public:
	typedef std::wstring::iterator  Iterator;
	TokenIterator(Iterator begin_ite, Iterator end_ite) {
		std::wregex  search_regex(kSearchRegex);
		iter_ = std::wsregex_iterator(begin_ite,end_ite, search_regex);
	}
	bool  Next() {
		if(iter_ == std::wsregex_iterator())
			return false;
	}
private:
	std::wsregex_iterator iter_;
};
bool DeserializeFromString( const std::wstring& res_str, TableValue* table )
{
	return true;
}
