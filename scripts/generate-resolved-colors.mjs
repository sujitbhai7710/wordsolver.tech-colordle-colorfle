import { getTargetColors } from '../src/lib/colordle.js';
import { writeFileSync } from 'fs';

const targets = getTargetColors();
const colorOnlyResult = {};
const detailedResult = {};
for (const t of targets) {
  const key = t.name.toLowerCase().replace(/ /g, '');
  colorOnlyResult[key] = t.hex;
  detailedResult[key] = {
    name: t.name,
    hex: t.hex,
  };
}

writeFileSync('src/data/colordle-resolved-colors.json', JSON.stringify(colorOnlyResult, null, 2));
writeFileSync('src/data/colordle-resolved-data.json', JSON.stringify(detailedResult, null, 2));
console.log('Generated resolved colors for', Object.keys(colorOnlyResult).length, 'entries');
