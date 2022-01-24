import { createConsoleLogger } from '@iamyth/logger';
import yargs from 'yargs';
import type { Arguments } from 'yargs';
import path from 'path';
import fs from 'fs-extra';
import { CommandUtil } from './util/CommandUtil';
import type { AbstractGenerator } from './generator/AbstractGenerator';
import { ReactGenerator } from './generator/react';
import { NodeGenerator } from './generator/node';
import { NestGenerator } from './generator/nestjs';
import { FullStackGenerator } from './generator/fullstack';
import { ViteGenerator } from './generator/vite';

interface YargsArguments {
    nest: boolean;
    react: boolean;
    fullstack: boolean;
    vite: boolean;
    test: boolean;
    mono: boolean;
}

const argv = yargs.argv as Arguments<YargsArguments>;

export class CoreCodegen {
    private readonly projectDirectory;
    private readonly name: string;
    private readonly rootPath: string;
    private readonly logger = createConsoleLogger('Core Codegen');
    private readonly generator: AbstractGenerator;

    constructor() {
        this.name = String(argv._[0]);
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
                fs.rmSync(this.projectDirectory, { recursive: true });
            } catch (error) {
                // Do nothing
            }
            if (typeof error === 'string' || error instanceof Error || Array.isArray(error)) {
                this.logger.error(error);
            }
            process.exit(1);
        }
    }

    getProjectDirectory() {
        const name = this.name.split('/');
        if (argv.mono) {
            const prefix = name[0].substring(1);
            return path.join(this.rootPath, prefix);
        }
        return path.join(this.rootPath, name[name.length === 2 ? 1 : 0]);
    }

    selectGenerator(): AbstractGenerator {
        const isNest = argv.nest;
        const isReact = argv.react;
        const isFullStack = argv.fullstack;
        const isVite = argv.vite;
        const withTest = argv.test ?? false;
        const isMono = argv.mono ?? false;
        const projectName = this.name;

        if (isVite) {
            return new ViteGenerator({ projectDirectory: this.projectDirectory, projectName });
        }

        if (isReact) {
            return new ReactGenerator({ projectDirectory: this.projectDirectory, projectName });
        }

        if (isNest) {
            return new NestGenerator({ projectDirectory: this.projectDirectory, projectName });
        }

        if (isFullStack) {
            return new FullStackGenerator({ projectDirectory: this.projectDirectory, projectName });
        }

        return new NodeGenerator({ projectDirectory: this.projectDirectory, withTest, isMono, projectName });
    }

    checkPreCondition() {
        this.logger.task('Start checking Pre-Condition');
        if (this.name === 'undefined') throw new Error('Project name is not specified.');
        if (!this.name?.trim()) throw new Error('Project name is invalid.');
        if (!/^(?=.{1,214}$)(?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(this.name))
            throw new Error('Project name does not match the naming convention');
        if (argv.mono && this.name.split('/').length !== 2) {
            throw new Error(`Project specified with "--mono" flag, project name should be "@xxx/xxx" format`);
        }
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
