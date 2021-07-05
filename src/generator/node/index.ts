import { AbstractGenerator } from '../AbstractGenerator';
import path from 'path';
import { createConsoleLogger } from '@iamyth/logger';
import fs from 'fs-extra';
import { CommandUtil } from '../../util/CommandUtil';

export class NodeGenerator extends AbstractGenerator {
    private readonly templatePath: string = path.join(__dirname, './template');
    private readonly logger = createConsoleLogger('Node Generator');

    copyDirectory(): void {
        this.logger.task(`Copying Project Template to ${this.projectDirectory}`);
        const directories = ['config', 'script', 'src'];

        if (this.withTest) {
            directories.push('test');
        }

        for (const directory of directories) {
            fs.mkdirSync(`${this.projectDirectory}/${directory}`, { recursive: true });
        }

        const configFiles: string[] = [
            // prettier-ignore
            'config/tsconfig.base.json',
            'config/tsconfig.script.json',
            'config/tsconfig.src.json',
        ];
        const scriptFiles: string[] = [
            // prettier-ignore
            'script/build.ts',
            'script/format.ts',
            'script/lint.ts',
            'script/spawn.ts',
        ];
        const srcFiles: string[] = [
            // prettier-ignore
            'src/index.ts',
        ];
        const testFiles: string[] = [];
        const files: string[] = [
            // prettier-ignore
            '.eslintrc.js',
            '.gitignore',
            '.prettierrc.js',
            'package.json',
        ];

        if (this.withTest) {
            configFiles.push('config/tsconfig.test.json');
            testFiles.push('test/index.test.ts');

            fs.copyFileSync(
                `${this.templatePath}/tsconfig.json.test-template`,
                `${this.projectDirectory}/tsconfig.json`,
            );
        } else {
            fs.copyFileSync(`${this.templatePath}/tsconfig.json.template`, `${this.projectDirectory}/tsconfig.json`);
        }

        for (const file of [...configFiles, ...scriptFiles, ...srcFiles, ...testFiles, ...files]) {
            fs.copyFileSync(`${this.templatePath}/${file}.template`, `${this.projectDirectory}/${file}`);
        }
    }

    installDependencies(): void {
        this.logger.task('Install dev-dependencies');
        const devDependencies = [
            'typescript',
            'ts-node',
            '@iamyth/logger',
            '@iamyth/prettier-config',
            'prettier',
            'eslint',
            'eslint-config-iamyth',
            '@types/node',
        ];

        if (this.withTest) {
            devDependencies.push('mocha', '@types/mocha');
        }

        return CommandUtil.spawn(
            this.projectDirectory,
            'yarn',
            ['add', '-DE', ...devDependencies],
            'Cannot Install dev-dependencies',
        );
    }
}
