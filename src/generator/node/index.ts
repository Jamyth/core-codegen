import path from "path";
import fs from "fs-extra";
import { AbstractGenerator } from "../AbstractGenerator";
import { createConsoleLogger } from "@iamyth/logger";
import { CommandUtil } from "../../util/CommandUtil";
import type { AbstractGeneratorConstructorOptions } from "../AbstractGenerator";
import { ReplaceUtil } from "../../util/ReplaceUtil";

interface NodeGeneratorOptions extends AbstractGeneratorConstructorOptions {
    isMono: boolean;
}

export class NodeGenerator extends AbstractGenerator {
    private readonly templatePath: string = path.join(__dirname, "./template");
    private readonly logger = createConsoleLogger("Node Generator");
    private readonly isMono: boolean;
    private subProject: string | null;

    constructor({ isMono, ...options }: NodeGeneratorOptions) {
        super(options);
        this.isMono = isMono;
        this.subProject = null;
    }

    copyDirectory(): void {
        this.handleMonoRepo();
        this.logger.task(`Copying Project Template to ${this.projectDirectory}`);
        const directories = ["config", "script", "src"];

        if (this.withTest) {
            directories.push("test");
        }

        for (const directory of directories) {
            if (this.subProject) {
                fs.mkdirSync(`${this.projectDirectory}/${this.subProject}/${directory}`, { recursive: true });
            } else {
                fs.mkdirSync(`${this.projectDirectory}/${directory}`, { recursive: true });
            }
        }

        this.copyFiles();
    }

    updatePackageJSON(name: string) {
        if (this.isMono && this.subProject) {
            const projectNameSegments = this.projectName.split("/");
            const prefix = projectNameSegments[0];
            const rootName = `${prefix}/root`;

            const rootJsonPath = path.join(this.projectDirectory, "./package.json");
            this.logger.task(`Update package.json at ${rootJsonPath}`);
            const rootPackageJSON = fs.readFileSync(rootJsonPath, { encoding: "utf-8" });
            const newRootPackageJSONContent = ReplaceUtil.replaceTemplate(rootPackageJSON, [1], [rootName]);
            fs.writeFileSync(rootJsonPath, newRootPackageJSONContent, { encoding: "utf-8" });

            const jsonPath = path.join(this.projectDirectory, this.subProject, "/package.json");
            this.logger.task(`Update package.json at ${jsonPath}`);
            const packageJSON = fs.readFileSync(jsonPath, { encoding: "utf-8" });
            const newContent = ReplaceUtil.replaceTemplate(packageJSON, [1], [name]);
            fs.writeFileSync(jsonPath, newContent, { encoding: "utf-8" });
        } else {
            super.updatePackageJSON(name);
        }
    }

    installDependencies(): void {
        this.logger.task("Install dev-dependencies");
        const devDependencies = [
            "typescript",
            "ts-node",
            "@iamyth/logger",
            "@iamyth/prettier-config",
            "prettier",
            "eslint-config-iamyth",
            "@types/node",
        ];

        if (this.withTest) {
            devDependencies.push("mocha", "@types/mocha");
        }

        const flags = this.subProject ? "-DEW" : "-DE";

        return CommandUtil.spawn(
            this.projectDirectory,
            "yarn",
            ["add", flags, ...devDependencies],
            "Cannot Install dev-dependencies",
        );
    }

    private copyFiles() {
        const configFiles: string[] = [
            // prettier-ignore
            'config/tsconfig.base.json',
            "config/tsconfig.script.json",
            "config/tsconfig.src.json",
        ];
        const scriptFiles: string[] = [
            // prettier-ignore
            'script/build.ts',
            "script/format.ts",
            "script/lint.ts",
            "script/spawn.ts",
        ];
        const srcFiles: string[] = [
            // prettier-ignore
            'src/index.ts',
        ];
        const testFiles: string[] = [];
        const files: string[] = [
            // prettier-ignore
            '.eslintrc.js',
            ".gitignore",
            ".prettierrc.js",
        ];

        if (this.withTest) {
            configFiles.push("config/tsconfig.test.json");
            testFiles.push("test/index.test.ts");

            fs.copyFileSync(
                `${this.templatePath}/tsconfig.json.test-template`,
                `${this.projectDirectory}/tsconfig.json`,
            );
        } else {
            if (this.subProject) {
                fs.copyFileSync(
                    `${this.templatePath}/tsconfig.json.template`,
                    `${this.projectDirectory}/${this.subProject}/tsconfig.json`,
                );
            } else {
                fs.copyFileSync(
                    `${this.templatePath}/tsconfig.json.template`,
                    `${this.projectDirectory}/tsconfig.json`,
                );
            }
        }

        if (this.subProject) {
            fs.copyFileSync(`${this.templatePath}/package.json.mono-template`, `${this.projectDirectory}/package.json`);
            fs.copyFileSync(
                `${this.templatePath}/package.json.template`,
                `${this.projectDirectory}/${this.subProject}/package.json`,
            );
        } else {
            files.push("package.json");
        }

        for (const file of [...configFiles, ...scriptFiles, ...srcFiles, ...testFiles]) {
            if (this.subProject) {
                fs.copyFileSync(
                    `${this.templatePath}/${file}.template`,
                    `${this.projectDirectory}/${this.subProject}/${file}`,
                );
            } else {
                fs.copyFileSync(`${this.templatePath}/${file}.template`, `${this.projectDirectory}/${file}`);
            }
        }

        for (const file of files) {
            fs.copyFileSync(`${this.templatePath}/${file}.template`, `${this.projectDirectory}/${file}`);
        }
    }

    private handleMonoRepo() {
        if (!this.isMono) {
            return;
        }
        const projectNameSegments = this.projectName.split("/");
        const projectName = projectNameSegments[1];
        this.subProject = `packages/${projectName}`;
    }
}
