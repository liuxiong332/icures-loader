#ifndef SERIALIZE_H_
#define SERIALIZE_H_
#include <map>
#include <string>

class ResNode;

//�������
class  TableValue
{
public:
	typedef void (*VisitorFunc)(const std::wstring& key, ResNode* node);

	void  Insert(const std::wstring& key, ResNode* node);

	//�������е� key�� value�� VisitorFunc��ʾ�ص�����
	void  forEach( VisitorFunc func);
private:
	std::map<std::wstring,ResNode*>		table_value_;	//��valueΪtableʱ
};

//ResNode ��������Դ�ڵ㣬 ����icu res��ÿ��{} ����һ��ResNode
/*���磬��������
de {
key2{"D\u00FCsseldorf"}
key1{"Deutsche Sprache schwere Sprache"}
}
{"D\u00FCsseldorf"}����һ�� str Node
{ key2{"D\u00FCsseldorf"} key1{"Deutsche Sprache schwere Sprache"} } ��һ��table Node
*/
class ResNode
{
public:
	enum NodeType {	NONE_NODE,	STRING_NODE/*�ڵ�ֵΪstring*/,	TABLE_NODE/*�ڵ��ֵΪtable*/	};
	ResNode();

	//���úͻ�ȡ NodeType
	NodeType	GetNodeType() const	;
	void	SetNodeType(NodeType type);
	
	//���ú� ��ȡ str value
	void	SetStrValue(const std::wstring& str_value);
	std::wstring	GetStrValue() const;

	//��ȡTable Value��ע��ֻ����NodeTypeΪTABLE_NODEʱ����Ч
	TableValue*		GetTableValue();
private:
	NodeType			node_type_;
	std::wstring		str_value_;		//��valueΪstringʱ 
	TableValue			table_value_;	//��value�� table ʱ
};

//����res��Դ������ָ���� Table
bool  DeserializeFromString(const std::wstring& res_str, TableValue* table);
//TableValue���л��� String 
void  SerializeToString(const TableValue* table, std::wstring* res_str);
#endif // !SERIALIZE
