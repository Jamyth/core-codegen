import path from "path";
import fs from "fs-extra";
import { ReplaceUtil } from "../util/ReplaceUtil";
import { createConsoleLogger } from "@iamyth/logger";

export interface AbstractGeneratorConstructorOptions {
    projectName: string;
    projectDirectory: string;
    withTest?: boolean;
}

export abstract class AbstractGenerator {
    protected projectName: string;
    protected projectDirectory: string;
    protected readonly withTest: boolean;
    private readonly abstractLogger = createConsoleLogger("Abstract Generator");

    constructor({ projectDirectory, withTest, projectName }: AbstractGeneratorConstructorOptions) {
        this.projectDirectory = projectDirectory;
        this.withTest = withTest ?? false;
        this.projectName = projectName;
    }

    updatePackageJSON(name: string) {
        const jsonPath = path.join(this.projectDirectory, "./package.json");
        this.abstractLogger.task(`Update package.json at ${jsonPath}`);
        const packageJSON = fs.readFileSync(jsonPath, { encoding: "utf-8" });
        const newContent = ReplaceUtil.replaceTemplate(packageJSON, [1], [name]);
        fs.writeFileSync(jsonPath, newContent, { encoding: "utf-8" });
    }

    updateContent(name: string) {}

    protected updateProjectDirectory(directory: string) {
        this.projectDirectory = directory;
    }

    abstract copyDirectory(): void;
    abstract installDependencies(): void;
}
