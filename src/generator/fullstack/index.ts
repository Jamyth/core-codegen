import type { AbstractGeneratorConstructorOptions } from '../AbstractGenerator';
import { AbstractGenerator } from '../AbstractGenerator';
import { CommandUtil } from '../../util/CommandUtil';
import { ReplaceUtil } from '../../util/ReplaceUtil';
import { createConsoleLogger } from '@iamyth/logger';
import path from 'path';
import fs from 'fs-extra';

/**
 * Project Structure
 * +- Root
 * |    +- api/
 * |    |   +- src/
 * |    |   |   +- app.module.ts
 * |    |   |   +- main.ts
 * |    |   |
 * |    |   +- nestjs-cli.json
 * |    |   +- package.json
 * |    |   +- tsconfig.build.json
 * |    |   +- tsconfig.json
 * |    |   +- webpack-config.js
 * |    |
 * |    +- web/
 * |    |   +- template/
 * |    |   |   +- config/
 * |    |   |   |   +- tsconfig.base.json
 * |    |   |   |   +- tsconfig.src.json
 * |    |   |   |   +- tsconfig.script.json
 * |    |   |   |
 * |    |   |   +- script/
 * |    |   |   |   +- lint.ts
 * |    |   |   |   +- format.ts
 * |    |   |   |   +- build.ts
 * |    |   |   |   +- start.ts
 * |    |   |   |   +- spawn.ts
 * |    |   |   |
 * |    |   |   +- static/
 * |    |   |   +- src/
 * |    |   |   |   +- component/
 * |    |   |   |   +- module/
 * |    |   |   |   |   +- main/
 * |    |   |   |   |   |   +- Main/
 * |    |   |   |   |   |   |   +- index.tsx
 * |    |   |   |   |   |   |
 * |    |   |   |   |   |   +- hooks.ts
 * |    |   |   |   |   |   +- index.ts
 * |    |   |   |   |   |   +- type.ts
 * |    |   |   |   |   |
 * |    |   |   |   +- type/
 * |    |   |   |   +- util/
 * |    |   |   |
 * |    |   |   +- package.json
 * |    |   |   +- tsconfig.json
 * |    |   |
 * |    |   +- shared/
 * |    |   |   +- src/
 * |    |   |   +- package.json
 * |    |   |
 * |    +- .gitignore
 * |    +- .prettierrc.js
 * |    +- .eslintrc.js
 * |    +- package.json
 */
export class FullStackGenerator extends AbstractGenerator {
    private readonly templatePath: string = path.join(__dirname, './template');
    private readonly logger = createConsoleLogger('FullStack Generator');
    private readonly cannotInstallDepMsg = 'Cannot Install dev-dependencies';

    constructor({ projectDirectory }: AbstractGeneratorConstructorOptions) {
        super({ projectDirectory, withTest: false });
    }

    override updatePackageJSON(name: string) {
        const packageJSONs = [
            // prettier-ignore
            path.join(this.projectDirectory, './package.json'),
            path.join(this.projectDirectory, './api/package.json'),
            path.join(this.projectDirectory, './web/template/package.json'),
            path.join(this.projectDirectory, './web/shared/package.json'),
        ];
        packageJSONs.map((_) => this.writeFile(name, _));
    }

    copyDirectory(): void {
        this.logger.task(`Copying Project Template to ${this.projectDirectory}`);
        this.copyRootDirectory();
        this.copyNestDirectory();
        this.copyWebDirectory();
    }

    installDependencies(): void {
        this.installRootDependencies();
        this.installNestDependencies();
        this.installWebDependencies();
    }

    private writeFile(name: string, jsonPath: string) {
        this.logger.task(`Update package.json at ${jsonPath}`);
        const packageJSON = fs.readFileSync(jsonPath, { encoding: 'utf-8' });
        const newContent = ReplaceUtil.replaceTemplate(packageJSON, [1], [name]);
        fs.writeFileSync(jsonPath, newContent, { encoding: 'utf-8' });
    }

    private mkdirSync(subDirectory: string, directories: string[]) {
        for (const directory of directories) {
            fs.mkdirSync(path.join(this.projectDirectory, subDirectory, directory), { recursive: true });
        }
    }
    private copyFileSync(subDirectory: string, files: string[]) {
        for (const file of files) {
            fs.copyFileSync(
                path.join(this.templatePath, subDirectory, `${file}.template`),
                path.join(this.projectDirectory, subDirectory, file),
            );
        }
    }

    private copyRootDirectory() {
        const directories: string[] = [
            // prettier-ignore
            'api',
            'web',
        ];
        this.mkdirSync('', directories);

        const files: string[] = [
            // prettier-ignore
            '.eslintrc.js',
            '.prettierrc.js',
            '.gitignore',
            'package.json',
        ];
        this.copyFileSync('', files);
    }
    private copyNestDirectory() {
        const directories: string[] = [
            // prettier-ignore,
            'src',
        ];
        this.mkdirSync('/api', directories);

        const files: string[] = [
            'nestjs-cli.json',
            'package.json',
            'tsconfig.json',
            'tsconfig.build.json',
            'webpack-config.js',
        ];
        const srcFiles: string[] = ['src/main.ts', 'src/app.module.ts'];
        this.copyFileSync('/api', [...files, ...srcFiles]);
    }
    private copyWebDirectory() {
        const directories: string[] = [
            // prettier-ignore
            'template/config',
            'template/script',
            'template/static',
            'template/src/component',
            'template/src/module/main/Main',
            'template/src/util',
            'template/src/type',
            'shared/src',
        ];

        this.mkdirSync('/web', directories);

        const templateConfigFiles: string[] = [
            // prettier-ignore
            'template/config/tsconfig.base.json',
            'template/config/tsconfig.script.json',
            'template/config/tsconfig.src.json',
        ];
        const templateScriptFiles: string[] = [
            // prettier-ignore
            'template/script/build.ts',
            'template/script/format.ts',
            'template/script/lint.ts',
            'template/script/spawn.ts',
            'template/script/start.ts',
        ];
        const templateSrcFiles: string[] = [
            // prettier-ignore
            'template/src/index.ts',
            'template/src/index.html',
        ];

        const templateModuleMainFiles: string[] = [
            // prettier-ignore
            'template/src/module/main/hooks.ts',
            'template/src/module/main/index.ts',
            'template/src/module/main/type.ts',
            'template/src/module/main/Main/index.tsx',
        ];

        const templateFiles: string[] = [
            // prettier-ignore
            'template/package.json',
            'template/tsconfig.json',
        ];

        const sharedFiles: string[] = [
            // prettier-ignore
            'shared/package.json',
        ];

        this.copyFileSync('/web', [
            // prettier-ignore
            ...templateConfigFiles,
            ...templateScriptFiles,
            ...templateSrcFiles,
            ...templateModuleMainFiles,
            ...templateFiles,
            ...sharedFiles,
        ]);
    }

    private installRootDependencies() {
        this.logger.task(`Installing dev-dependencies for Root`);
        const devDependencies: string[] = [
            // prettier-ignore
            'typescript',
            'ts-node',
            'prettier',
            '@iamyth/prettier-config',
            'eslint',
            'eslint-config-iamyth',
            '@types/node',
            'coil-react-cli',
            '@iamyth/logger',
        ];
        CommandUtil.spawn(this.projectDirectory, 'yarn', ['add', '-DEW', ...devDependencies], this.cannotInstallDepMsg);
    }
    private installNestDependencies() {
        this.logger.task(`Installing dev-dependencies for API`);
        const devDependencies: string[] = [
            // prettier-ignore
            '@nestjs/schematics',
            '@types/express',
        ];
        CommandUtil.spawn(
            path.join(this.projectDirectory, 'api'),
            'yarn',
            ['add', '-DE', ...devDependencies],
            this.cannotInstallDepMsg,
        );

        this.logger.task(`Installing dependencies for API`);
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

        CommandUtil.spawn(
            path.join(this.projectDirectory, 'api'),
            'yarn',
            ['add', '-E', ...dependencies],
            'Cannot Install dependencies',
        );
    }
    private installWebDependencies() {
        this.logger.task(`Installing dependencies for web/template`);
        const dependencies: string[] = [
            // prettier-ignore
            'coil-react',
            'jamyth-web-util',
        ];

        CommandUtil.spawn(
            path.join(this.projectDirectory, 'web/template'),
            'yarn',
            ['add', '-E', ...dependencies],
            'Cannot Install dependencies',
        );

        this.logger.task(`Installing dev-dependencies for web/template`);
        const devDependencies: string[] = [
            // prettier-ignore
            '@iamyth/webpack-runner',
        ];
        CommandUtil.spawn(
            path.join(this.projectDirectory, 'web/template'),
            'yarn',
            ['add', '-DE', ...devDependencies],
            this.cannotInstallDepMsg,
        );

        this.logger.task(`Installing dev-dependencies for web/shared`);
        const sharedDevDependencies: string[] = [
            // prettier-ignore
            '@types/react',
            'coil-react',
        ];
        CommandUtil.spawn(
            path.join(this.projectDirectory, 'web/shared'),
            'yarn',
            ['add', '-DE', ...sharedDevDependencies],
            this.cannotInstallDepMsg,
        );
    }
}
