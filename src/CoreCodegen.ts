import { createConsoleLogger } from '@iamyth/logger';
import yargs from 'yargs';
import path from 'path';
import fs from 'fs-extra';
import { ReplaceUtil } from './util/ReplaceUtil';
import { CommandUtil } from './util/CommandUtil';

export class CoreCodegen {
    private readonly projectDirectory;
    private readonly name: string;
    private readonly rootPath: string;
    private readonly templatePath;
    private readonly logger = createConsoleLogger('Core Codegen');

    constructor() {
        this.name = String(yargs.argv._[0]);
        this.rootPath = path.join();
        this.projectDirectory = this.getProjectDirectory();
        this.templatePath = path.join(__dirname, './template');
    }

    async run() {
        try {
            this.checkPreCondition();
            this.createProjectDirectory();
            this.copyDirectory();
            this.updatePackageJSON();
            this.installDependencies();
            this.initializeGit();
            this.logger.task('Generation Complete, enjoy coding !');
        } catch (error) {
            try {
                fs.rmdirSync(this.projectDirectory, { recursive: true });
            } catch (error) {
                // Do nothing
            }
            this.logger.error(error);
            process.exit(1);
        }
    }

    getProjectDirectory() {
        const name = this.name.split('/');
        return path.join(this.rootPath, name[name.length === 2 ? 1 : 0]);
    }

    checkPreCondition() {
        this.logger.task('Start checking Pre-Condition');
        if (this.name === 'undefined') throw new Error('Project name is not specified.');
        if (!this.name?.trim()) throw new Error('Project name is invalid.');
        if (!/^(?=.{1,214}$)(?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(this.name))
            throw new Error('Project name does not match the naming convention');
    }

    createProjectDirectory() {
        this.logger.task('Create Project Directory');
        if (fs.existsSync(this.projectDirectory) && fs.statSync(this.projectDirectory).isDirectory()) {
            throw new Error(`Folder is exist: ${this.projectDirectory}`);
        }
        fs.mkdirSync(this.projectDirectory);
    }

    copyDirectory() {
        this.logger.task(`Copying Project Template to ${this.projectDirectory}`);
        const directories = ['config', 'script', 'src', 'test'];

        for (const directory of directories) {
            fs.mkdirSync(`${this.projectDirectory}/${directory}`, { recursive: true });
        }

        const configFiles = [
            'config/tsconfig.base.json',
            'config/tsconfig.script.json',
            'config/tsconfig.src.json',
            'config/tsconfig.test.json',
        ];
        const scriptFiles = ['script/build.ts', 'script/format.ts', 'script/lint.ts', 'script/spawn.ts'];
        const srcFiles = ['src/index.ts'];
        const testFiles = ['test/index.test.ts'];
        const files = ['.eslintrc.js', '.gitignore', '.prettierrc.js', 'package.json', 'tsconfig.json'];

        for (const file of [...configFiles, ...scriptFiles, ...srcFiles, ...testFiles, ...files]) {
            fs.copyFileSync(`${this.templatePath}/${file}.template`, `${this.projectDirectory}/${file}`);
        }
    }

    updatePackageJSON() {
        const jsonPath = path.join(this.projectDirectory, './package.json');
        this.logger.task(`Update package.json at ${jsonPath}`);
        const packageJSON = fs.readFileSync(jsonPath, { encoding: 'utf-8' });
        const newContent = ReplaceUtil.replaceTemplate(packageJSON, [1], [this.name]);
        fs.writeFileSync(jsonPath, newContent, { encoding: 'utf-8' });
    }

    installDependencies() {
        this.logger.task('Install dev-dependencies');
        const devDependencies = [
            'typescript',
            'ts-node',
            '@iamyth/logger',
            '@iamyth/prettier-config',
            'prettier',
            'eslint-config-iamyth',
            '@types/node',
            'mocha',
        ];
        return CommandUtil.spawn(
            this.projectDirectory,
            'yarn',
            ['add', '-DE', ...devDependencies],
            'Cannot Install dev-dependencies',
        );
    }

    initializeGit() {
        this.logger.task('Initialize git repository and commit');
        CommandUtil.spawn(this.projectDirectory, 'git', ['init'], 'Cannot initialize git repository');
        CommandUtil.spawn(this.projectDirectory, 'git', ['add', '.'], 'Cannot add changes git tree');
        CommandUtil.spawn(
            this.projectDirectory,
            'git',
            ['commit', '-m', `[INIT]: ${this.name}: initialize project using Core-Codegen`],
            'Cannot commit to git',
        );
    }
}
