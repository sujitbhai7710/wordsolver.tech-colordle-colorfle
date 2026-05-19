import { getPuzzleAnswer, buildColorfleAnswerPayload } from './colorfle.js';
import resolvedHexMap from '../data/colordle-resolved-colors.json';

// Get today's date for daily answers
function getToday() {
  return new Date();
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function getDateKey(date) {
  return date.toISOString().slice(0, 10);
}

// Normalize color name for hex lookup
function normalizeColorName(name) {
  return name.toLowerCase().replace(/ /g, '');
}

// Generate Colordle answer data
export function getColordleTodayData() {
  // Colordle uses a pre-computed list of target colors indexed by day number
  // We read from the targets list and resolve against color-name-list
  const targets = ["night sky","smoke","sage","navy blue","aqua","dark blue","periwinkle","red brown","royal blue","plum","green yellow","teal","brown red","gold","dark orange","slate","cheese","hot","tea","salmon","deep blue","sand","blood","cream","brown","jade","mahogany","snow","yellow green","golden","sapphire","graphite","taupe","neon red","bright yellow","neon yellow","red orange","metal","blue green","tan","dark","light teal","forest green","red","blueberry","light yellow","stone","light red","sea","midnight","pastel blue","canary","mango","iron","turquoise","lime","midnight blue","chestnut","pastel yellow","navy","lead","brick","grape","blue grey","watermelon","whitesmoke","crimson","green blue","cinnamon","blood red","steel","dark green","cornflower","clay","mint","grey","copper","light green","eggplant","sea green","ginger","ice","pastel green","ocean","ash","pear","cherry","vanilla","hot pink","mustard","mocha","lavender","sangria","cloud","light pink","grass","white","blue purple","cobalt","lemon","black","mauve","bone","maroon","lilac","barn red","auburn","jet","aquamarine","coral","pea","carrot","sunflower","bright red","chocolate","fog","ocean blue","shadow","neon green","merlot","corn","sky blue","pearl","walnut","khaki","olive","butter","violet","firebrick","light blue","light grey","daisy","leaf","denim","wine","deep red","cotton","tangerine","bright green","burgundy","piggy","purple","yellowish","orchid","orange","royal","dirt","pickle","dark yellow","off white","azure","dark grey","dark purple","baby pink","light brown","sun","pine","magenta","pink","green","purple blue","blush","eggshell","strawberry","sky","rose","lime green","dark red","peanut","fire","forest","baby blue","beige","sunshine","pale","berry","brick red","dark teal","water","banana","orange yellow","cyan","moss","jet black","emerald","indigo","peach","garnet","sunset","coffee","yellow","pumpkin","amber","orange red","dark pink","fern","bright orange","neon blue","ivory","bronze","grey blue","silver","charcoal","rust","tiger","burnt orange","caramel","blue","ruby","honey","scarlet","blonde","yellow orange","sea foam","vantablack","apricot"];
  
  const today = getToday();
  const startDate = new Date('2022-04-25T00:00:00Z');
  const dayNum = Math.floor((today.getTime() - startDate.getTime()) / 86400000) + 500;
  const colorName = targets[Math.abs(dayNum) % targets.length];
  const normalized = normalizeColorName(colorName);
  const hex = resolvedHexMap[normalized] || '#888888';
  const displayName = colorName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  
  return {
    colorName: displayName,
    hex,
    dayNum,
    formattedDate: formatDate(today),
    dateKey: getDateKey(today)
  };
}

// Generate Colorfle answer data  
export function getColorfleTodayData() {
  const today = getToday();
  const answer = buildColorfleAnswerPayload(today, 0);
  
  return {
    ...answer,
    formattedDate: formatDate(today)
  };
}

// Get recent Colorfle entries for archive display
export function getRecentColorfleEntries(days = 7) {
  const today = getToday();
  return Array.from({ length: days }, (_, index) => {
    const entryDate = new Date(today);
    entryDate.setDate(entryDate.getDate() - index);
    return buildColorfleAnswerPayload(entryDate, 0);
  });
}
