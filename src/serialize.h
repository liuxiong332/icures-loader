#ifndef SERIALIZE_H_
#define SERIALIZE_H_
#include <map>
#include <string>

class ResNode;

//表格数据
class  TableValue
{
public:
	typedef void (*VisitorFunc)(const std::wstring& key, ResNode* node);

	void  Insert(const std::wstring& key, ResNode* node);

	//迭代所有的 key， value， VisitorFunc表示回调函数
	void  forEach( VisitorFunc func);
private:
	std::map<std::wstring,ResNode*>		table_value_;	//当value为table时
};

//ResNode 代表这资源节点， 对于icu res的每个{} 都是一个ResNode
/*例如，对于如下
de {
key2{"D\u00FCsseldorf"}
key1{"Deutsche Sprache schwere Sprache"}
}
{"D\u00FCsseldorf"}就是一个 str Node
{ key2{"D\u00FCsseldorf"} key1{"Deutsche Sprache schwere Sprache"} } 是一个table Node
*/
class ResNode
{
public:
	enum NodeType {	NONE_NODE,	STRING_NODE/*节点值为string*/,	TABLE_NODE/*节点的值为table*/	};
	ResNode();

	//设置和获取 NodeType
	NodeType	GetNodeType() const	;
	void	SetNodeType(NodeType type);
	
	//设置和 获取 str value
	void	SetStrValue(const std::wstring& str_value);
	std::wstring	GetStrValue() const;

	//获取Table Value，注意只有在NodeType为TABLE_NODE时才有效
	TableValue*		GetTableValue();
private:
	NodeType			node_type_;
	std::wstring		str_value_;		//当value为string时 
	TableValue			table_value_;	//当value是 table 时
};

//根据res资源，创建指定的 Table
bool  DeserializeFromString(const std::wstring& res_str, TableValue* table);
//TableValue序列化成 String 
void  SerializeToString(const TableValue* table, std::wstring* res_str);
#endif // !SERIALIZE
