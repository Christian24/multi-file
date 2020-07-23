import { PreProcessHandler, Plugin, PluginContext, Schema} from 'dtsgenerator';
//import  {OpenApisV3} from 'dtsgenerator/dist/core/openApiV3';
//import { OpenApisV2 } from 'dtsgenerator/dist/core/openApiV2';
import ts from 'typescript';
import { NodeType } from './type-definition';
// type Schema = OpenApisV3.SchemaJson | OpenApisV2.SchemaJson;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJson = require('./package.json');

/**
 * This file is the main implementation for this plugin.
 * Please edit this implementation.
 */
const plugin: Plugin = {
    meta: {
        name: packageJson.name,
        version: packageJson.version,
        description: packageJson.description,
    },
    // Remove the `preProcess` or `postProcess` if that is not needed for this plugin.
    preProcess,
    postProcess,
};

/**
 * This `preProcess` is the hook for the input schema changing.
 */
async function preProcess(
    pluginContext: PluginContext
): Promise<PreProcessHandler | undefined> {
    return (contents: Schema[]): Schema[] => {
        console.log(
            `PreProcess: config=<${JSON.stringify(pluginContext.option)}>`
        );
        return contents;
    };
}

async function traverseNodes(
    node: ts.Node,
    sourceFile: ts.SourceFile,
    printer: ts.Printer,
    nodes: NodeType[]
) {
    console.log(`Kind ${node.kind}`);

    if (!ts.isModuleDeclaration(node)) {
        console.log(
            printer.printNode(ts.EmitHint.Unspecified, node, sourceFile)
        ) + '\n';
        nodes.push(node as NodeType);
    } else if (node.body && ts.isModuleBlock(node.body)) {
        for (const statement of node.body.statements) {
            traverseNodes(statement, sourceFile, printer, nodes);
        }
    }
}

/**
 * This `postProcess` is the hook for the output AST changing.
 */
async function postProcess(
    pluginContext: PluginContext
): Promise<ts.TransformerFactory<ts.SourceFile> | undefined> {
    return (_: ts.TransformationContext) => (
        root: ts.SourceFile
    ): ts.SourceFile => {
        const nodes: NodeType[] = [];
        const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
        for (const statement of root.statements) {
            traverseNodes(statement, root, printer, nodes);
        }
        console.log(nodes);
       // const obj: TypeDefinition[] = [];
       /*  for (const node of nodes) {
            obj.push(new TypeDefinition(node));
        } */
        console.log(
            `PostProcess: config=<${JSON.stringify(pluginContext.option)}>`
        );
        return root;
    };
}

export default plugin;
