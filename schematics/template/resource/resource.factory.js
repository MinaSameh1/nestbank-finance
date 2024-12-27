"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
var core_1 = require("@angular-devkit/core");
var strings_1 = require("@angular-devkit/core/src/utils/strings");
var schematics_1 = require("@angular-devkit/schematics");
var tasks_1 = require("@angular-devkit/schematics/tasks");
/* import { */
/*   DeclarationOptions, */
/*   ModuleDeclarator, */
/*   ModuleFinder, */
/* } from "@nestjs/schematics/dist/utils"; */
var dependencies_utils_1 = require("@nestjs/schematics/dist/utils/dependencies.utils");
var formatting_1 = require("@nestjs/schematics/dist/utils/formatting");
var name_parser_1 = require("@nestjs/schematics/dist/utils/name.parser");
var source_root_helpers_1 = require("@nestjs/schematics/dist/utils/source-root.helpers");
var pluralize = require("pluralize");
function main(options) {
    options = transform(options);
    return function (tree, context) {
        return (0, schematics_1.branchAndMerge)((0, schematics_1.chain)([
            addMappedTypesDependencyIfApplies(options),
            (0, source_root_helpers_1.mergeSourceRoot)(options),
            addDeclarationToModule(options),
            (0, schematics_1.mergeWith)(generate(options)),
        ]))(tree, context);
    };
}
exports.main = main;
function transform(options) {
    var _a;
    var target = Object.assign({}, options);
    if (!target.name) {
        throw new schematics_1.SchematicsException("Option (name) is required.");
    }
    target.metadata = "imports";
    var location = new name_parser_1.NameParser().parse(target);
    target.name = (0, formatting_1.normalizeToKebabOrSnakeCase)(location.name);
    target.path = (0, formatting_1.normalizeToKebabOrSnakeCase)(location.path);
    target.language = target.language !== undefined ? target.language : "ts";
    if (target.language === "js") {
        throw new Error('The "resource" schematic does not support JavaScript language (only TypeScript is supported).');
    }
    target.specFileSuffix = (0, formatting_1.normalizeToKebabOrSnakeCase)(options.specFileSuffix || "spec");
    target.path = target.flat
        ? target.path
        : (0, core_1.join)(target.path, target.name);
    target.isSwaggerInstalled = (_a = options.isSwaggerInstalled) !== null && _a !== void 0 ? _a : false;
    return target;
}
function generate(options) {
    return function (context) {
        return (0, schematics_1.apply)((0, schematics_1.url)((0, core_1.join)("./files", options.language)), [
            (0, schematics_1.filter)(function (path) {
                var _a;
                if (path.endsWith(".dto.ts")) {
                    return ((options.type !== "graphql-code-first" &&
                        options.type !== "graphql-schema-first" &&
                        options.crud) ||
                        false);
                }
                if (path.endsWith(".input.ts")) {
                    return (((options.type === "graphql-code-first" ||
                        options.type === "graphql-schema-first") &&
                        options.crud) ||
                        false);
                }
                if (path.endsWith(".resolver.ts") ||
                    path.endsWith(".resolver.__specFileSuffix__.ts")) {
                    return (options.type === "graphql-code-first" ||
                        options.type === "graphql-schema-first");
                }
                if (path.endsWith(".graphql")) {
                    return ((options.type === "graphql-schema-first" && options.crud) || false);
                }
                if (path.endsWith("controller.ts") ||
                    path.endsWith(".controller.__specFileSuffix__.ts")) {
                    return options.type === "microservice" || options.type === "rest";
                }
                if (path.endsWith(".gateway.ts") ||
                    path.endsWith(".gateway.__specFileSuffix__.ts")) {
                    return options.type === "ws";
                }
                if (path.includes("@ent")) {
                    // Entity class file workaround
                    // When an invalid glob path for entities has been specified (on the application part)
                    // TypeORM was trying to load a template class
                    return (_a = options.crud) !== null && _a !== void 0 ? _a : false;
                }
                return true;
            }),
            options.spec
                ? (0, schematics_1.noop)()
                : (0, schematics_1.filter)(function (path) {
                    var suffix = ".__specFileSuffix__.ts";
                    return !path.endsWith(suffix);
                }),
            (0, schematics_1.template)(__assign(__assign(__assign({}, core_1.strings), options), { lowercased: function (name) {
                    var classifiedName = (0, strings_1.classify)(name);
                    return (classifiedName.charAt(0).toLowerCase() + classifiedName.slice(1));
                }, singular: function (name) { return pluralize.singular(name); }, ent: function (name) { return name + ".entity"; } })),
            (0, schematics_1.move)(options.path),
        ])(context);
    };
}
// Always skip import module
function addDeclarationToModule(options) {
    return function (tree) {
        return tree;
        /* if (options.skipImport !== undefined && options.skipImport) { */
        /*   return tree; */
        /* } */
        /* options.module = new ModuleFinder(tree).find({ */
        /*   name: options.name, */
        /*   path: options.path as Path, */
        /* }) as Path | undefined; */
        /* if (!options.module) { */
        /*   return tree; */
        /* } */
        /* const content = tree.read(options.module)?.toString(); */
        /* if (!content) { */
        /*   return tree; */
        /* } */
        /* const declarator: ModuleDeclarator = new ModuleDeclarator(); */
        /* tree.overwrite( */
        /*   options.module, */
        /*   declarator.declare(content, { */
        /*     ...options, */
        /*     type: "module", */
        /*   } as DeclarationOptions), */
        /* ); */
        /* return tree; */
    };
}
function addMappedTypesDependencyIfApplies(options) {
    return function (host, context) {
        try {
            if (options.type === "graphql-code-first") {
                return;
            }
            if (options.type === "rest") {
                var nodeDependencyRef_1 = (0, dependencies_utils_1.getPackageJsonDependency)(host, "@nestjs/swagger");
                if (nodeDependencyRef_1) {
                    options.isSwaggerInstalled = true;
                    return;
                }
            }
            var nodeDependencyRef = (0, dependencies_utils_1.getPackageJsonDependency)(host, "@nestjs/mapped-types");
            if (!nodeDependencyRef) {
                (0, dependencies_utils_1.addPackageJsonDependency)(host, {
                    type: dependencies_utils_1.NodeDependencyType.Default,
                    name: "@nestjs/mapped-types",
                    version: "*",
                });
                context.addTask(new tasks_1.NodePackageInstallTask());
            }
        }
        catch (err) {
            // ignore if "package.json" not found
        }
    };
}
