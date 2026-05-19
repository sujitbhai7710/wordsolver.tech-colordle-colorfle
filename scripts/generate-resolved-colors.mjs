import { getTargetColors } from '../src/lib/colordle.js';
import { writeFileSync } from 'fs';

const targets = getTargetColors();
const result = {};
for (const t of targets) {
  const key = t.name.toLowerCase().replace(/ /g, '');
  result[key] = t.hex;
}

writeFileSync('src/data/colordle-resolved-colors.json', JSON.stringify(result, null, 2));
console.log('Generated resolved colors for', Object.keys(result).length, 'entries');
