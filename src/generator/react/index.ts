import type { AbstractGeneratorConstructorOptions } from '../AbstractGenerator';
import { AbstractGenerator } from '../AbstractGenerator';
import path from 'path';
import { createConsoleLogger } from '@iamyth/logger';
import fs from 'fs-extra';
import { CommandUtil } from '../../util/CommandUtil';

export class ReactGenerator extends AbstractGenerator {
    private readonly templatePath: string = path.join(__dirname, './template');
    private readonly logger = createConsoleLogger('React Generator');

    constructor({ projectDirectory }: AbstractGeneratorConstructorOptions) {
        super({ projectDirectory });
    }

    copyDirectory(): void {
        this.logger.task(`Copying Project Template to ${this.projectDirectory}`);
        const directories = [
            // prettier-ignore
            'config',
            'script',
            'static',
            'src/component',
            'src/module/main/Main',
            'src/util',
            'src/type',
        ];

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
            'script/start.ts',
        ];
        const srcFiles: string[] = [
            // prettier-ignore
            'src/index.ts',
            'src/index.html',
        ];

        const moduleMainFiles: string[] = [
            // prettier-ignore
            'src/module/main/hooks.ts',
            'src/module/main/index.ts',
            'src/module/main/type.ts',
            'src/module/main/Main/index.tsx',
        ];

        const files: string[] = [
            // prettier-ignore
            '.eslintrc.js',
            '.gitignore',
            '.prettierrc.js',
            'package.json',
            'tsconfig.json',
        ];

        for (const file of [...configFiles, ...scriptFiles, ...srcFiles, ...moduleMainFiles, ...files]) {
            fs.copyFileSync(`${this.templatePath}/${file}.template`, `${this.projectDirectory}/${file}`);
        }
    }

    installDependencies(): void {
        this.logger.task('Install dependencies');
        const dependencies = [
            // prettier-ignore
            'coil-react',
            'jamyth-web-util',
        ];

        // prettier-ignore
        CommandUtil.spawn(
            this.projectDirectory,
            'yarn',
            ['add', '-E', ...dependencies],
            'Cannot Install dependencies',
        );

        this.logger.task('Install dev-dependencies');
        const devDependencies = [
            'typescript',
            'ts-node',
            '@iamyth/logger',
            '@iamyth/prettier-config',
            'prettier',
            'eslint-config-iamyth',
            '@types/node',
            '@iamyth/webpack-runner',
            'coil-react-cli',
        ];

        CommandUtil.spawn(
            this.projectDirectory,
            'yarn',
            ['add', '-DE', ...devDependencies],
            'Cannot Install dev-dependencies',
        );
    }
}
