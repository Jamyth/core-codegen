export interface AbstractGeneratorConstructorOptions {
    projectDirectory: string;
    withTest?: boolean;
}

export abstract class AbstractGenerator {
    protected readonly projectDirectory: string;
    protected readonly withTest: boolean;

    constructor({ projectDirectory, withTest }: AbstractGeneratorConstructorOptions) {
        this.projectDirectory = projectDirectory;
        this.withTest = withTest ?? false;
    }

    abstract copyDirectory(): void;
    abstract installDependencies(): void;
}
