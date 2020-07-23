import  { ClassLikeDeclarationBase, InterfaceDeclaration } from 'typescript';

export type NodeType = ClassLikeDeclarationBase | InterfaceDeclaration;
export class TypeDefinition {
    public node: NodeType;
    public dependencies: NodeType[];
    constructor(node: NodeType) {
        this.node = node;
        this.dependencies = [];
       this.dependencies = this.node.members.filter(item => item.type.typeName.left !== undefined);
    }
}