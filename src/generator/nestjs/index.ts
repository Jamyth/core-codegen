import path from 'path';
import { createConsoleLogger } from '@iamyth/logger';
import fs from 'fs-extra';
import { CommandUtil } from '../../util/CommandUtil';
import type { AbstractGeneratorConstructorOptions } from '../AbstractGenerator';
import { AbstractGenerator } from '../AbstractGenerator';

export class NestGenerator extends AbstractGenerator {
    private readonly templatePath: string = path.join(__dirname, './template');
    private readonly logger = createConsoleLogger('Nest Generator');

    constructor({ projectDirectory }: AbstractGeneratorConstructorOptions) {
        super({ projectDirectory, withTest: false });
    }

    copyDirectory(): void {
        this.logger.task(`Copying Project Template to ${this.projectDirectory}`);
        const directories = ['src'];

        for (const directory of directories) {
            fs.mkdirSync(`${this.projectDirectory}/${directory}`, { recursive: true });
        }

        const srcFiles: string[] = [
            // prettier-ignore
            'src/main.ts',
            'src/app.module.ts',
        ];

        const files: string[] = [
            'nestjs-cli.json',
            'package.json',
            'tsconfig.json',
            'tsconfig.build.json',
            '.eslintrc.js',
            '.gitignore',
            '.prettierrc.js',
            'webpack-config.js',
        ];

        for (const file of [...srcFiles, ...files]) {
            fs.copyFileSync(`${this.templatePath}/${file}.template`, `${this.projectDirectory}/${file}`);
        }
    }

    installDependencies(): void {
        this.logger.task('Install dev-dependencies');

        const devDependencies: string[] = [
            // prettier-ignore
            '@nestjs/schematics',
            '@nestjs/cli',
            '@types/express',
            '@types/node',
            'ts-node',
            'typescript',
            'prettier',
            '@iamyth/prettier-config',
            'eslint-config-iamyth',
        ];

        CommandUtil.spawn(
            this.projectDirectory,
            'yarn',
            ['add', '-DE', ...devDependencies],
            'Cannot Install dev-dependencies',
        );

        const dependencies: string[] = [
            // prettier-ignore
            '@nestjs/common',
            '@nestjs/core',
            '@nestjs/platform-express',
            'reflect-metadata',
            'rimraf',
            'rxjs',
            'nest-api-generator',
        ];

        CommandUtil.spawn(this.projectDirectory, 'yarn', ['add', '-E', ...dependencies], 'Cannot Install dependencies');
    }
}
