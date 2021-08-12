function replaceTemplate(content: string, iterator: (1 | 2 | 3)[], target: string[]) {
    if (iterator.length !== target.length) {
        throw new Error("Iterators' and target's length are not the same");
    }
    const templates = iterator.map(getTemplate);
    return templates.reduce((acc, curr, index) => {
        const regex = new RegExp(curr, 'g');
        return acc.replace(regex, target[index]);
    }, content);
}

function getTemplate(iterator: 1 | 2 | 3): string {
    return `%%% ${iterator} %%%`;
}

export const ReplaceUtil = Object.freeze({
    replaceTemplate,
});
