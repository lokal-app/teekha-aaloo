#!/usr/bin/env node
// Stage-1 gate of /figma-implement: validates .claude/state/design-package.json against
// design-package.schema.json. Dependency-free subset of JSON Schema (type, required, enum,
// pattern, minLength, properties, additionalProperties, items). Exit 0 = valid, 1 = invalid.
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const schema = JSON.parse(readFileSync(resolve(here, 'design-package.schema.json'), 'utf8'));
const target = resolve(process.argv[2] ?? resolve(here, '../state/design-package.json'));

let data;
try {
  data = JSON.parse(readFileSync(target, 'utf8'));
} catch (error) {
  console.error(`✗ cannot read ${target}: ${error.message}`);
  process.exit(1);
}

const errors = [];

function typeOf(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

function check(node, value, path) {
  if (node.type) {
    const types = Array.isArray(node.type) ? node.type : [node.type];
    const actual = typeOf(value);
    const ok = types.some((t) => t === actual || (t === 'integer' && Number.isInteger(value)));
    if (!ok) return errors.push(`${path}: expected ${types.join('|')}, got ${actual}`);
  }
  if (node.enum && !node.enum.includes(value))
    errors.push(`${path}: must be one of ${node.enum.join(', ')}`);
  if (typeof value === 'string') {
    if (node.minLength && value.length < node.minLength) errors.push(`${path}: too short`);
    if (node.pattern && !new RegExp(node.pattern).test(value))
      errors.push(`${path}: does not match ${node.pattern}`);
  }
  if (typeOf(value) === 'object') {
    for (const key of node.required ?? [])
      if (!(key in value)) errors.push(`${path}: missing "${key}"`);
    for (const [key, child] of Object.entries(value)) {
      if (node.properties?.[key]) check(node.properties[key], child, `${path}.${key}`);
      else if (node.additionalProperties === false) errors.push(`${path}: unexpected "${key}"`);
      else if (typeof node.additionalProperties === 'object')
        check(node.additionalProperties, child, `${path}.${key}`);
    }
  }
  if (Array.isArray(value) && node.items)
    value.forEach((item, i) => check(node.items, item, `${path}[${i}]`));
}

check(schema, data, '$');

if (errors.length) {
  console.error(`✗ design-package.json invalid (${errors.length} error(s)):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log('✓ design-package.json valid');
