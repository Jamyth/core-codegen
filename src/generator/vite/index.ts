import path from 'path';
import fs from 'fs-extra';
import { AbstractGenerator } from '../AbstractGenerator';
import { createConsoleLogger } from '@iamyth/logger';
import { CommandUtil } from '../../util/CommandUtil';

export class ViteGenerator extends AbstractGenerator {
    private readonly templatePath: string = path.join(__dirname, './template');
    private readonly logger = createConsoleLogger('Vite Generator');

    copyDirectory(): void {
        this.logger.task(['Copying Project Template to', this.projectDirectory]);
        const directories = [
            // prettier-preserve
            'config',
            'script',
            'src',
            'static',
            'src/component',
            'src/util',
        ];

        for (const directory of directories) {
            fs.mkdirSync(`${this.projectDirectory}/${directory}`, { recursive: true });
        }

        const configFiles: string[] = [
            // prettier-preserve
            'config/tsconfig.base.json',
            'config/tsconfig.script.json',
            'config/tsconfig.src.json',
        ];

        const scriptFiles: string[] = [
            // prettier-preserve
            'script/build.ts',
            'script/start.ts',
            'script/format.ts',
        ];

        const srcFiles: string[] = [
            // prettier-preserve
            'src/index.ts',
            'src/index.html',
        ];

        const files: string[] = [
            // prettier-preserve
            '.eslintrc.js',
            '.gitignore',
            '.prettierrc.js',
            'package.json',
            'tsconfig.json',
        ];

        for (const file of [...configFiles, ...scriptFiles, ...srcFiles, ...files]) {
            fs.copyFileSync(`${this.templatePath}/${file}.template`, `${this.projectDirectory}/${file}`);
        }
    }

    installDependencies(): void {
        this.logger.task('Install dev-dependencies');

        const devDependencies = [
            'typescript',
            'ts-node',
            '@iamyth/prettier-config',
            'prettier',
            'eslint-config-iamyth',
            '@types/node',
            'vite-runner',
            '@iamyth/devtool-utils',
        ];

        CommandUtil.spawn(
            this.projectDirectory,
            'yarn',
            ['add', '-DE', ...devDependencies],
            'Cannot Install dev-dependencies',
        );
    }
}
