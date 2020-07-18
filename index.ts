import { PreProcessHandler, Plugin, PluginContext, Schema } from 'dtsgenerator';
import ts from 'typescript';

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
    node: ts.Statement,
    sourceFile: ts.SourceFile,
    printer: ts.Printer
) {
    console.log(`Kind ${node.kind}`);

    if (!ts.isModuleDeclaration(node)) {
        console.log(
            printer.printNode(ts.EmitHint.Unspecified, node, sourceFile)
        ) + '\n';
    } else if (node.body && ts.isModuleBlock(node.body)) {
        for (const statement of node.body.statements) {
            traverseNodes(statement, sourceFile, printer);
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
        const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
        for (const statement of root.statements) {
            traverseNodes(statement, root, printer);
        }

        console.log(
            `PostProcess: config=<${JSON.stringify(pluginContext.option)}>`
        );
        return root;
    };
}

export default plugin;
