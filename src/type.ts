import type { Arguments } from 'yargs';

export type Case = 'camel' | 'kebab' | 'pascal';

export interface CoreCodegenArguments extends Arguments {
    name?: string;
}
