import { AbstractGenerator } from "../AbstractGenerator";
import path from "path";
import { createConsoleLogger } from "@iamyth/logger";
import fs from "fs-extra";
import { CommandUtil } from "../../util/CommandUtil";
import { ReplaceUtil } from "../../util/ReplaceUtil";

export class ReactComponentGenerator extends AbstractGenerator {
    private readonly templatePath: string = path.join(__dirname, "./template");
    private readonly logger = createConsoleLogger("React Component Generator");

    copyDirectory(): void {
        this.logger.task(`Copying Project Template to ${this.projectDirectory}`);
        const directories = [
            // prettier-ignore
            'config',
            "script",
            "src",
            "test/src",
        ];

        for (const directory of directories) {
            fs.mkdirSync(`${this.projectDirectory}/${directory}`, { recursive: true });
        }

        const configFiles: string[] = [
            // prettier-ignore
            'config/tsconfig.base.json',
            "config/tsconfig.script.json",
            "config/tsconfig.src.json",
            "config/tsconfig.test.json",
        ];
        const scriptFiles: string[] = [
            // prettier-ignore
            'script/build.ts',
            "script/format.ts",
            "script/lint.ts",
            "script/spawn.ts",
            "script/start.ts",
        ];
        const srcFiles: string[] = [
            // prettier-ignore
            'src/index.ts',
        ];
        const testFiles: string[] = [
            // prettier-ignore
            'test/src/index.tsx',
            "test/src/index.html",
        ];

        const files: string[] = [
            // prettier-ignore
            '.eslintrc.js',
            ".gitignore",
            ".prettierrc.js",
            "package.json",
            "tsconfig.json",
        ];

        for (const file of [...configFiles, ...scriptFiles, ...srcFiles, ...testFiles, ...files]) {
            fs.copyFileSync(`${this.templatePath}/${file}.template`, `${this.projectDirectory}/${file}`);
        }
    }

    updateContent(name: string): void {
        const startScriptPath = path.join(this.projectDirectory, "./script/start.ts");
        this.logger.task(`Update script/start.ts as ${startScriptPath}`);
        const startScript = fs.readFileSync(startScriptPath, { encoding: "utf-8" });
        const newContent = ReplaceUtil.replaceTemplate(startScript, [1], [name]);
        fs.writeFileSync(startScriptPath, newContent, { encoding: "utf-8" });
    }

    installDependencies(): void {
        this.logger.task("Install peer-dependencies");
        const peerDependencies = [
            // prettier-ignore
            'react',
            "typescript",
        ];

        CommandUtil.spawn(
            this.projectDirectory,
            "yarn",
            ["add", "-PE", ...peerDependencies],
            "Cannot Install peer-dependencies",
        );

        this.logger.task("Install dev-dependencies");
        const devDependencies = [
            "@iamyth/logger",
            "@iamyth/prettier-config",
            "@types/node",
            "@types/react",
            "@types/react-dom",
            "eslint-config-iamyth",
            "prettier",
            "react-dom",
            "ts-node",
            "vite-runner",
        ];

        CommandUtil.spawn(
            this.projectDirectory,
            "yarn",
            ["add", "-DE", ...devDependencies, ...peerDependencies],
            "Cannot Install dev-dependencies",
        );
    }
}
