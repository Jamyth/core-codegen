import { createConsoleLogger } from '@iamyth/logger';
import yargs from 'yargs';
import path from 'path';
import fs from 'fs-extra';
import { CommandUtil } from './util/CommandUtil';
import { AbstractGenerator } from './generator/AbstractGenerator';
import { ReactGenerator } from './generator/react';
import { NodeGenerator } from './generator/node';
import { NestGenerator } from './generator/nestjs';
import { FullStackGenerator } from './generator/fullstack';

export class CoreCodegen {
    private readonly projectDirectory;
    private readonly name: string;
    private readonly rootPath: string;
    private readonly logger = createConsoleLogger('Core Codegen');
    private readonly generator: AbstractGenerator;

    constructor() {
        this.name = String(yargs.argv._[0]);
        this.rootPath = path.join();
        this.projectDirectory = this.getProjectDirectory();
        this.generator = this.selectGenerator();
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

    selectGenerator(): AbstractGenerator {
        const isNest = yargs.argv.nest as boolean;
        const isReact = yargs.argv.react as boolean;
        const isFullStack = yargs.argv.fullstack as boolean;
        const withTest = (yargs.argv.test as boolean) ?? false;

        if (isReact) {
            return new ReactGenerator({ projectDirectory: this.projectDirectory });
        }

        if (isNest) {
            return new NestGenerator({ projectDirectory: this.projectDirectory });
        }

        if (isFullStack) {
            return new FullStackGenerator({ projectDirectory: this.projectDirectory });
        }

        return new NodeGenerator({ projectDirectory: this.projectDirectory, withTest });
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
        this.generator.copyDirectory();
    }

    updatePackageJSON() {
        this.generator.updatePackageJSON(this.name);
    }

    installDependencies() {
        this.generator.installDependencies();
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
