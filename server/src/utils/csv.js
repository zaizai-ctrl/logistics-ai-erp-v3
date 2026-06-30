import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

export function parseCsv(buffer) {
  return parse(buffer, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    trim: true
  });
}

export function buildCsv(rows) {
  return stringify(rows, {
    header: true
  });
}

