import { spawn } from './spawn';
import { createConsoleLogger } from '@iamyth/logger';

const logger = createConsoleLogger('ESLint');

logger.task('Linting...');
spawn('eslint', ['--ext', './src/**/*.ts'], 'Lint error, Please fix !');
