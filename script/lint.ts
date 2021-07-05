import { spawn } from './spawn';
import { createConsoleLogger } from '@iamyth/logger';
import path from 'path';

const logger = createConsoleLogger('ESLint');

logger.task('Linting...');
spawn(
    'eslint',
    ['--ext', path.join(__dirname, '../src/**/*.ts'), '-c', path.join(__dirname, '../.eslintrc.js')],
    'Lint error, Please fix !',
);
