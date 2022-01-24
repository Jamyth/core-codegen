import { ViteRunner } from 'vite-runner'
import path from 'path';

new ViteRunner({
    port: 8080,
    https: true,
    projectDirectory: path.join(__dirname, '..'),
    tsconfigPath: path.join(__dirname, '../config/tsconfig.src.json'),
    useReact: false,
}).startServer();
