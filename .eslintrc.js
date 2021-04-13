/** @type {import('eslint').Linter.Config} */
const config = {
    ignorePatterns: ['**/node_modules/**', "**/dist/**"],
    extends: ['iamyth/preset/node']
}

module.exports = config;