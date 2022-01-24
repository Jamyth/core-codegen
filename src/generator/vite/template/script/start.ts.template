import { ViteRunner } from 'vite-runner'
import path from 'path';

new WebpackRunner({
    port: 8080,
    https: true,
    projectDirectory: path.join(__dirname, '..'),
    tsconfigFilePath: path.join(__dirname, '../config/tsconfig.src.json'),
    useReact: false,
}).startServer();
