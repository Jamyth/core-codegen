# **Core-Codegen**

A Simple codegen tool for quickly create empty npm package.

## **Usage**

```bash
$ npm install -g @iamyth/core-codegen
or
$ yarn add -g @iamyth/core-codegen
```

In your Terminal, run:

```bash
$ core-codegen your-package-name (--flags)
```

## Flags

-   react
-   nest
-   fullstack
-   `blank` for nodejs library

> **Package naming convention will strictly follow `NodeJS`'s**

## **Directory Structure**

```
+- your-package-name
|   +- config
|   |   +- tsconfig.base.json
|   |   +- tsconfig.src.json
|   |   +- tsconfig.script.json
|   |   +- tsconfig.test.json
|   +- script
|   |   +- build.ts
|   |   +- format.ts
|   |   +- lint.ts
|   |   +- spawn.ts
|   +- src
|   |   +- index.ts
|   +- test
|   |   +- index.test.ts
|   +- .eslintrc.js
|   +- .gitignore
|   +- .prettierrc.js
|   +- package.json
|   +- tsconfig.json
```
