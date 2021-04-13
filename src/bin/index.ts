#! /usr/bin/env node

import yargs from 'yargs';
import { NameUtil } from 'util/NameUtil';

const name = yargs.argv.name as string;

console.info(NameUtil.transformCase(name, 'pascal'));
