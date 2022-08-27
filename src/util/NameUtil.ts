import type { Case } from "../type";

function transformCase(target: string, casing: Case) {
    const splitArray = split(target);
    switch (casing) {
        case "camel":
            return toCamelCase(splitArray);
        case "kebab":
            return toKebabCase(splitArray);
        case "pascal":
            return toPascalCase(splitArray);
    }
}

function split(target: string): string[] {
    const splitArray = target.replaceAll("-", " ").split(" ");
    console.info(splitArray);

    if (splitArray.length === 0) {
        throw new Error("Empty String received.");
    }

    return splitArray;
}

function toCamelCase(target: string[]) {
    const array = [...target];
    const [firstWord, ...rest] = array;
    return (
        firstWord.toLowerCase() +
        rest.reduce((acc, curr) => {
            const word = curr[0].toUpperCase() + curr.slice(1);
            return acc + word;
        }, "")
    );
}

function toKebabCase(target: string[]) {
    const array = [...target];
    return array.join("-").toLowerCase();
}

function toPascalCase(target: string[]) {
    const array = [...target];
    return array.reduce((acc, curr) => {
        const word = curr[0].toUpperCase() + curr.slice(1);
        return acc + word;
    }, "");
}

export const NameUtil = Object.freeze({
    transformCase,
});
