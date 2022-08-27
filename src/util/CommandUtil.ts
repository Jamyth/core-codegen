import { spawnSync } from "child_process";
import { createConsoleLogger } from "@iamyth/logger";

function spawn(cwd: string, command: string, args: string[], errorMessage: string) {
    const logger = createConsoleLogger("Core Codegen");

    const isWindow = process.platform === "win32";
    const result = spawnSync(isWindow ? command + ".cmd" : command, args, { cwd });
    if (result.error) {
        logger.error(errorMessage);
        logger.error(result.error);
        process.exit(1);
    }
    if (result.status !== 0) {
        logger.error(`non-zero exit status received, command: ${command} ${args.join(" ")}`);
    }
}

export const CommandUtil = Object.freeze({
    spawn,
});
