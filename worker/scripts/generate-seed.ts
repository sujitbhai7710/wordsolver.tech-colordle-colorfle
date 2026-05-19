// Script to generate seed SQL for backfilling D1 database
// Run: npx tsx scripts/generate-seed.ts > seed.sql
// Then: wrangler d1 execute colordleanswer-db --file=seed.sql

import { getColordleAnswer, COLORDLE_START_DATE } from '../src/colordle-logic';
import { getColorfleAnswer } from '../src/colorfle-logic';

function getTodayIST(): string {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset + now.getTimezoneOffset() * 60000);
  return istTime.toISOString().slice(0, 10);
}

function main() {
  const startDate = '2022-04-25';
  const endDate = getTodayIST();
  
  console.log('-- Seed data for colordleanswer-db');
  console.log(`-- Generated on: ${new Date().toISOString()}`);
  console.log(`-- Date range: ${startDate} to ${endDate}`);
  console.log('');
  
  // Colordle answers
  console.log('-- Colordle answers');
  const currentDate = new Date(startDate + 'T12:00:00Z');
  const end = new Date(endDate + 'T12:00:00Z');
  
  let colordleCount = 0;
  while (currentDate <= end) {
    const dateStr = currentDate.toISOString().slice(0, 10);
    const answer = getColordleAnswer(dateStr);
    
    const safeName = answer.colorName.replace(/'/g, "''");
    console.log(`INSERT OR IGNORE INTO colordle_answers (date, day_number, color_name, color_hex) VALUES ('${answer.date}', ${answer.dayNumber}, '${safeName}', '${answer.colorHex}');`);
    colordleCount++;
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  console.log('');
  console.log(`-- ${colordleCount} colordle answers`);
  console.log('');
  
  // Colorfle answers
  console.log('-- Colorfle answers');
  const currentDate2 = new Date(startDate + 'T12:00:00Z');
  let colorfleCount = 0;
  
  while (currentDate2 <= end) {
    const dateStr = currentDate2.toISOString().slice(0, 10);
    const answer = getColorfleAnswer(dateStr, 0);
    
    const indices = JSON.stringify(answer.colors.map(c => c.index));
    const names = JSON.stringify(answer.colors.map(c => c.name));
    const hexes = JSON.stringify(answer.colors.map(c => c.hex));
    const weights = JSON.stringify(answer.colors.map(c => c.weight));
    const rgb = JSON.stringify(answer.targetColor.rgb);
    
    console.log(`INSERT OR IGNORE INTO colorfle_answers (date, puzzle_number, mode, color_indices, color_names, color_hexes, color_weights, target_hex, target_rgb) VALUES ('${answer.date}', ${answer.puzzleNumber}, ${answer.mode}, '${indices}', '${names}', '${hexes}', '${weights}', '${answer.targetColor.hex}', '${rgb}');`);
    colorfleCount++;
    
    currentDate2.setDate(currentDate2.getDate() + 1);
  }
  
  console.log('');
  console.log(`-- ${colorfleCount} colorfle answers`);
  console.log('');
  
  // Metadata
  console.log('-- Metadata');
  console.log(`INSERT OR REPLACE INTO metadata (key, value) VALUES ('last_seed', '${new Date().toISOString()}');`);
  console.log(`INSERT OR REPLACE INTO metadata (key, value) VALUES ('colordle_count', '${colordleCount}');`);
  console.log(`INSERT OR REPLACE INTO metadata (key, value) VALUES ('colorfle_count', '${colorfleCount}');`);
}

main();
