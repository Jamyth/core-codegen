import { createConsoleLogger } from '@iamyth/logger';
import { spawn } from './spawn';
import path from 'path';
import fs from 'fs-extra';

require('./format');
require('./lint');

const logger = createConsoleLogger('Typescript Compile');

function build() {
    logger.task('Build and Transpile');
    spawn('tsc', ['--project', path.join(__dirname, '../config/tsconfig.src.json')], 'Build failed.');

    const templatePaths: string[] = [
        // prettier-ignore
        'generator/node/template',
        'generator/react/template',
        'generator/nestjs/template',
        'generator/fullstack/template',
        'generator/vite/template',
    ];

    for (const template of templatePaths) {
        fs.copySync(path.join(__dirname, '../src', template), path.join(__dirname, '../dist', template));
    }
}

build();
