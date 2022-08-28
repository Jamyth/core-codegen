import { createConsoleLogger } from "@iamyth/logger";
import fs from "fs-extra";

export interface UpdateConfig {
    path: string;
    iterator: (1 | 2 | 3)[];
    target: string[];
}

function replaceTemplate(content: string, iterator: (1 | 2 | 3)[], target: string[]) {
    if (iterator.length !== target.length) {
        throw new Error("Iterators' and target's length are not the same");
    }
    const templates = iterator.map(getTemplate);
    return templates.reduce((acc, curr, index) => {
        const regex = new RegExp(curr, "g");
        return acc.replace(regex, target[index]);
    }, content);
}

function getTemplate(iterator: 1 | 2 | 3): string {
    return `%%% ${iterator} %%%`;
}

function updateContent(config: UpdateConfig[]) {
    const logger = createConsoleLogger("Replace Util");

    config.forEach(({ path, iterator, target }) => {
        logger.task(`Update Content at ${path}`);
        const content = fs.readFileSync(path, { encoding: "utf-8" });
        const newContent = replaceTemplate(content, iterator, target);
        fs.writeFileSync(path, newContent, { encoding: "utf-8" });
    });

    logger.task("Content Update Completes");
}

export const ReplaceUtil = Object.freeze({
    replaceTemplate,
    updateContent,
});
