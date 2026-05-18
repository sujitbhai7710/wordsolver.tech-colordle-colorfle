// Colordle game logic for WordSolver
import { hexToRgb, colorDiff, type RGB } from './color-utils.js';
import targetColorNames from '../data/colordle-targets.json';

export interface ColorData {
  name: string;
  hex: string;
}

// Color overrides for names missing from color-name-list
const colordleColorOverrides: Record<string, ColorData> = {
  bloodred: { name: 'Blood Red', hex: '#980002' },
  oceanblue: { name: 'Ocean Blue', hex: '#009dc4' },
  shadow: { name: 'Shadow', hex: '#837050' },
  chili: { name: 'Chili', hex: '#be4b41' },
  redwine: { name: 'Red Wine', hex: '#8c0034' },
  coralred: { name: 'Coral Red', hex: '#ff4040' },
  bubble: { name: 'Bubble', hex: '#eaf5e7' },
  patinagreen: { name: 'Patina Green', hex: '#b9eab3' },
  nude: { name: 'Nude', hex: '#f2d2bd' },
  brightpink: { name: 'Bright Pink', hex: '#ff007f' },
  vermillion: { name: 'Vermilion', hex: '#f4320c' },
};

// Comprehensive named colors with hex values for the solver
// This is a curated list covering common color names
const NAMED_COLORS: ColorData[] = [
  { name: 'red', hex: '#FF0000' }, { name: 'blue', hex: '#0000FF' },
  { name: 'green', hex: '#008000' }, { name: 'yellow', hex: '#FFFF00' },
  { name: 'orange', hex: '#FFA500' }, { name: 'purple', hex: '#800080' },
  { name: 'pink', hex: '#FFC0CB' }, { name: 'brown', hex: '#A52A2A' },
  { name: 'gray', hex: '#808080' }, { name: 'grey', hex: '#808080' },
  { name: 'teal', hex: '#008080' }, { name: 'navy', hex: '#000080' },
  { name: 'coral', hex: '#FF7F50' }, { name: 'gold', hex: '#FFD700' },
  { name: 'silver', hex: '#C0C0C0' }, { name: 'beige', hex: '#F5F5DC' },
  { name: 'tan', hex: '#D2B48C' }, { name: 'olive', hex: '#808000' },
  { name: 'maroon', hex: '#800000' }, { name: 'crimson', hex: '#DC143C' },
  { name: 'indigo', hex: '#4B0082' }, { name: 'turquoise', hex: '#40E0D0' },
  { name: 'magenta', hex: '#FF00FF' }, { name: 'lime', hex: '#00FF00' },
  { name: 'cyan', hex: '#00FFFF' }, { name: 'plum', hex: '#DDA0DD' },
  { name: 'sky blue', hex: '#87CEEB' }, { name: 'salmon', hex: '#FA8072' },
  { name: 'ivory', hex: '#FFFFF0' }, { name: 'khaki', hex: '#F0E68C' },
  { name: 'lavender', hex: '#E6E6FA' }, { name: 'white', hex: '#FFFFFF' },
  { name: 'black', hex: '#000000' }, { name: 'dark red', hex: '#8B0000' },
  { name: 'dark blue', hex: '#00008B' }, { name: 'dark green', hex: '#006400' },
  { name: 'light green', hex: '#90EE90' }, { name: 'light blue', hex: '#ADD8E6' },
  { name: 'forest green', hex: '#228B22' }, { name: 'royal blue', hex: '#4169E1' },
  { name: 'steel blue', hex: '#4682B4' }, { name: 'dark orange', hex: '#FF8C00' },
  { name: 'deep pink', hex: '#FF1493' }, { name: 'pale green', hex: '#98FB98' },
  { name: 'chocolate', hex: '#D2691E' }, { name: 'sienna', hex: '#A0522D' },
  { name: 'firebrick', hex: '#B22222' }, { name: 'medium blue', hex: '#0000CD' },
  { name: 'slate gray', hex: '#708090' }, { name: 'cadet blue', hex: '#5F9EA0' },
  { name: 'medium aquamarine', hex: '#66CDAA' }, { name: 'light coral', hex: '#F08080' },
  { name: 'rosy brown', hex: '#BC8F8F' }, { name: 'dark goldenrod', hex: '#B8860B' },
  { name: 'medium purple', hex: '#9370DB' }, { name: 'medium sea green', hex: '#3CB371' },
  { name: 'dark cyan', hex: '#008B8B' }, { name: 'saddle brown', hex: '#8B4513' },
  { name: 'slate blue', hex: '#6A5ACD' }, { name: 'midnight blue', hex: '#191970' },
  { name: 'olive drab', hex: '#6B8E23' }, { name: 'sea green', hex: '#2E8B57' },
  { name: 'jade', hex: '#00A86B' }, { name: 'sage', hex: '#BCB88A' },
  { name: 'smoke', hex: '#738276' }, { name: 'aqua', hex: '#00FFFF' },
  { name: 'cream', hex: '#FFFDD0' }, { name: 'sand', hex: '#C2B280' },
  { name: 'wine', hex: '#722F37' }, { name: 'mahogany', hex: '#C04000' },
  { name: 'chartreuse', hex: '#7FFF00' }, { name: 'emerald', hex: '#50C878' },
  { name: 'ruby', hex: '#E0115F' }, { name: 'sapphire', hex: '#0F52BA' },
  { name: 'amber', hex: '#FFBF00' }, { name: 'copper', hex: '#B87333' },
  { name: 'bronze', hex: '#CD7F32' }, { name: 'scarlet', hex: '#FF2400' },
  { name: 'navy blue', hex: '#000080' }, { name: 'hunter green', hex: '#355E3B' },
  { name: 'cherry', hex: '#DE3163' }, { name: 'cinnamon', hex: '#D2691E' },
  { name: 'mocha', hex: '#967964' }, { name: 'caramel', hex: '#FFD59A' },
  { name: 'periwinkle', hex: '#CCCCFF' }, { name: 'cerulean', hex: '#007BA7' },
  { name: 'chestnut', hex: '#954535' }, { name: 'slate', hex: '#708090' },
  { name: 'marigold', hex: '#EAA221' }, { name: 'pewter', hex: '#96A8A1' },
  { name: 'moss', hex: '#8A9A5B' }, { name: 'rust', hex: '#B7410E' },
  { name: 'night sky', hex: '#0C1445' }, { name: 'peach', hex: '#FFCBA4' },
  { name: 'mint', hex: '#3EB489' }, { name: 'apricot', hex: '#FBCEB1' },
  { name: 'burgundy', hex: '#800020' }, { name: 'mustard', hex: '#FFDB58' },
  { name: 'lemon', hex: '#FFF44F' }, { name: 'violet', hex: '#EE82EE' },
  { name: 'magenta', hex: '#FF00FF' }, { name: 'rose', hex: '#FF007F' },
  { name: 'blush', hex: '#DE5D83' }, { name: 'honey', hex: '#EB9605' },
  { name: 'denim', hex: '#1560BD' }, { name: 'cobalt', hex: '#0047AB' },
  { name: 'charcoal', hex: '#36454F' }, { name: 'graphite', hex: '#383838' },
  { name: 'taupe', hex: '#483C32' }, { name: 'eggplant', hex: '#614051' },
  { name: 'vanilla', hex: '#F3E5AB' }, { name: 'butter', hex: '#FFFDD0' },
  { name: 'cloud', hex: '#C5CFCF' }, { name: 'fog', hex: '#CACCCD' },
  { name: 'ice', hex: '#D6FFFA' }, { name: 'ocean', hex: '#010124' },
  { name: 'ash', hex: '#B2BEB5' }, { name: 'pear', hex: '#D1E231' },
  { name: 'sunflower', hex: '#FFDA03' }, { name: 'hot pink', hex: '#FF69B4' },
  { name: 'snow', hex: '#FFFAFA' }, { name: 'dirt', hex: '#9B7653' },
  { name: 'fire', hex: '#AB3408' }, { name: 'water', hex: '#0F5B9C' },
  { name: 'forest', hex: '#0B5509' }, { name: 'banana', hex: '#FFE135' },
  { name: 'pickle', hex: '#7D8F4B' }, { name: 'cheese', hex: '#FFC20E' },
  { name: 'tea', hex: '#B5B48C' }, { name: 'blood', hex: '#7B0000' },
  { name: 'hot', hex: '#D2311D' }, { name: 'grass', hex: '#5B8C2A' },
  { name: 'berry', hex: '#8E4585' }, { name: 'sky', hex: '#76D7EA' },
  { name: 'lime green', hex: '#32CD32' }, { name: 'bright red', hex: '#FF0000' },
  { name: 'bright green', hex: '#66FF00' }, { name: 'bright yellow', hex: '#FFFF00' },
  { name: 'bright orange', hex: '#FF5F00' }, { name: 'light pink', hex: '#FFB6C1' },
  { name: 'dark pink', hex: '#E75480' }, { name: 'baby blue', hex: '#89CFF0' },
  { name: 'baby pink', hex: '#F4C2C2' }, { name: 'light grey', hex: '#D3D3D3' },
  { name: 'dark grey', hex: '#696969' }, { name: 'dark teal', hex: '#00514C' },
  { name: 'light teal', hex: '#7EFCD2' }, { name: 'off white', hex: '#FAF9F6' },
  { name: 'dark yellow', hex: '#E5BE01' }, { name: 'light yellow', hex: '#FFFFE0' },
  { name: 'dark purple', hex: '#301934' }, { name: 'light red', hex: '#FFCCCB' },
  { name: 'light brown', hex: '#B5651D' }, { name: 'red brown', hex: '#A52A2A' },
  { name: 'brown red', hex: '#8B0000' }, { name: 'green yellow', hex: '#ADFF2F' },
  { name: 'yellow green', hex: '#9ACD32' }, { name: 'red orange', hex: '#FF4500' },
  { name: 'orange yellow', hex: '#FF8C00' }, { name: 'blue green', hex: '#0D98BA' },
  { name: 'blue purple', hex: '#5B0097' }, { name: 'purple blue', hex: '#6A0DAD' },
  { name: 'green blue', hex: '#009999' }, { name: 'orange red', hex: '#FF4500' },
  { name: 'yellow orange', hex: '#FFAE42' }, { name: 'dark salmon', hex: '#E9967A' },
  { name: 'deep red', hex: '#8B0000' }, { name: 'deep blue', hex: '#00008B' },
  { name: 'sun', hex: '#FFD700' }, { name: 'pine', hex: '#01796F' },
  { name: 'mango', hex: '#FF8243' }, { name: 'pumpkin', hex: '#FF7518' },
  { name: 'canary', hex: '#FFFF99' }, { name: 'corn', hex: '#FBEC5D' },
  { name: 'carrot', hex: '#ED9121' }, { name: 'pea', hex: '#A1B42C' },
  { name: 'peanut', hex: '#C29045' }, { name: 'walnut', hex: '#5C4033' },
  { name: 'cotton', hex: '#FFFFFF' }, { name: 'tangerine', hex: '#FF9966' },
  { name: 'strawberry', hex: '#FC5A8D' }, { name: 'piggy', hex: '#F0ABAB' },
  { name: 'yellowish', hex: '#FAEE7B' }, { name: 'orchid', hex: '#DA70D6' },
  { name: 'royal', hex: '#7851A9' }, { name: 'dark', hex: '#1B1B1B' },
  { name: 'midnight', hex: '#030530' }, { name: 'ocean blue', hex: '#009DC4' },
  { name: 'shadow', hex: '#837050' }, { name: 'neon green', hex: '#39FF14' },
  { name: 'merlot', hex: '#730039' }, { name: 'sky blue', hex: '#87CEEB' },
  { name: 'pearl', hex: '#EAE0C8' }, { name: 'bone', hex: '#E3DAC9' },
  { name: 'lilac', hex: '#C8A2C8' }, { name: 'barn red', hex: '#7C0A02' },
  { name: 'auburn', hex: '#6D351A' }, { name: 'jet', hex: '#343434' },
  { name: 'aquamarine', hex: '#7FFFD4' }, { name: 'cornflower', hex: '#6495ED' },
  { name: 'clay', hex: '#B66A50' }, { name: 'ginger', hex: '#B06500' },
  { name: 'pastel green', hex: '#77DD77' }, { name: 'sangria', hex: '#92000A' },
  { name: 'daisy', hex: '#FEFE33' }, { name: 'leaf', hex: '#4D9A00' },
  { name: 'blood red', hex: '#980002' }, { name: 'steel', hex: '#71797E' },
  { name: 'white smoke', hex: '#F5F5F5' }, { name: 'red pink', hex: '#FF4040' },
  { name: 'bright blue', hex: '#0045FF' }, { name: 'neon red', hex: '#FF073A' },
  { name: 'neon yellow', hex: '#CCFF00' }, { name: 'metal', hex: '#848789' },
  { name: 'blue grey', hex: '#6699CC' }, { name: 'iron', hex: '#48494B' },
  { name: 'lead', hex: '#5A5D60' }, { name: 'brick', hex: '#8B4513' },
  { name: 'grape', hex: '#6F2DA8' }, { name: 'watermelon', hex: '#FC6C85' },
  { name: 'red wine', hex: '#8C0034' }, { name: 'neon blue', hex: '#0047AB' },
  { name: 'bright pink', hex: '#FF007F' }, { name: 'light beige', hex: '#F5F5DC' },
  { name: 'pink orange', hex: '#FF7F50' }, { name: 'pastel blue', hex: '#AEC6CF' },
  { name: 'pastel yellow', hex: '#FDFD96' }, { name: 'pastel pink', hex: '#FFD1DC' },
  { name: 'dark violet', hex: '#9400D3' }, { name: 'dusty rose', hex: '#DCAE96' },
  { name: 'barbie pink', hex: '#E0218A' }, { name: 'pure white', hex: '#FFFFFF' },
  { name: 'ash grey', hex: '#B2BEB5' }, { name: 'pastel red', hex: '#FF6961' },
  { name: 'steel blue', hex: '#4682B4' }, { name: 'orange brown', hex: '#BE7A4D' },
  { name: 'cerise', hex: '#DE3163' }, { name: 'purple pink', hex: '#D63384' },
  { name: 'rouge', hex: '#C51E3A' }, { name: 'bright white', hex: '#FFFFFF' },
  { name: 'pale pink', hex: '#FADADD' }, { name: 'mulberry', hex: '#C54B8C' },
  { name: 'bubble gum', hex: '#FFC1CC' }, { name: 'iris', hex: '#5A4FCF' },
  { name: 'candy apple red', hex: '#FF0800' }, { name: 'powder blue', hex: '#B0E0E6' },
  { name: 'cerulean', hex: '#007BA7' }, { name: 'burnt umber', hex: '#8A3324' },
  { name: 'rose pink', hex: '#FF66CC' }, { name: 'cool grey', hex: '#8C92AC' },
  { name: 'cinnabar', hex: '#E34234' }, { name: 'pale blue', hex: '#B0E0E6' },
  { name: 'greige', hex: '#B9BAA2' }, { name: 'coral red', hex: '#FF4040' },
  { name: 'grapefruit', hex: '#E8A87C' }, { name: 'brown orange', hex: '#BE7A4D' },
  { name: 'red purple', hex: '#E0115F' }, { name: 'neon pink', hex: '#FF10F0' },
  { name: 'fossil', hex: '#A99C8B' }, { name: 'blue blue', hex: '#0000FF' },
  { name: 'bluish', hex: '#4488CC' }, { name: 'indian red', hex: '#CD5C5C' },
  { name: 'flax', hex: '#EEDC82' }, { name: 'fire engine', hex: '#CE2029' },
  { name: 'rosewood', hex: '#65000B' }, { name: 'ghost white', hex: '#F8F8FF' },
  { name: 'greyish', hex: '#A8A8A8' }, { name: 'alabaster', hex: '#EDEAE0' },
  { name: 'ice blue', hex: '#99FFFF' }, { name: 'pastel orange', hex: '#FFB347' },
  { name: 'pinkish', hex: '#FF6F8C' }, { name: 'deep purple', hex: '#36013F' },
  { name: 'creamy', hex: '#FFFDD0' }, { name: 'pinky', hex: '#FC86AA' },
  { name: 'fuchsia', hex: '#FF00FF' }, { name: 'royal purple', hex: '#7851A9' },
  { name: 'salt', hex: '#F5F5F5' }, { name: 'cherry red', hex: '#DE3163' },
  { name: 'ecru', hex: '#C2B280' }, { name: 'amaranth', hex: '#E52B50' },
  { name: 'vermilion', hex: '#E34234' }, { name: 'ruby red', hex: '#9B111E' },
  { name: 'rose gold', hex: '#B76E79' }, { name: 'gainsboro', hex: '#DCDCDC' },
  { name: 'dark maroon', hex: '#3C0008' }, { name: 'orange pink', hex: '#FF6F8C' },
  { name: 'electric blue', hex: '#7DF9FF' }, { name: 'stop', hex: '#FF0000' },
  { name: 'ultramarine', hex: '#120A8F' }, { name: 'seashell', hex: '#FFF5EE' },
  { name: 'cloudy', hex: '#ACAEB0' }, { name: 'burnt red', hex: '#922B05' },
  { name: 'concrete', hex: '#95A5A6' }, { name: 'pink purple', hex: '#D63384' },
  { name: 'blackberry', hex: '#4E0E2D' }, { name: 'snow white', hex: '#FFFAFA' },
  { name: 'rose red', hex: '#E0115F' }, { name: 'grey brown', hex: '#7F7059' },
  { name: 'frost', hex: '#F0FFF0' }, { name: 'misty', hex: '#C4C4C4' },
  { name: 'cool', hex: '#77CCD6' }, { name: 'bubble', hex: '#EAF5E7' },
  { name: 'emeraldgreen', hex: '#009B7D' }, { name: 'ghost', hex: '#F8F8FF' },
  { name: 'pastel purple', hex: '#B19CD9' }, { name: 'dove', hex: '#8E9EA2' },
  { name: 'white blue', hex: '#DAE8FC' }, { name: 'wine red', hex: '#722F37' },
  { name: 'patinagreen', hex: '#B9EAB3' }, { name: 'pale grey', hex: '#FDFDFD' },
  { name: 'blood orange', hex: '#CC5500' }, { name: 'springgreen', hex: '#00FF7F' },
  { name: 'coconut', hex: '#FFFFFF' }, { name: 'blue violet', hex: '#8A2BE2' },
  { name: 'red pink', hex: '#FF4040' }, { name: 'amethyst', hex: '#9966CC' },
  { name: 'pomegranate', hex: '#C41E3A' }, { name: 'reddish brown', hex: '#6E3B3B' },
  { name: 'chalk', hex: '#F0F0E8' }, { name: 'platinum', hex: '#E5E4E2' },
  { name: 'neon purple', hex: '#BF00FF' }, { name: 'lipstick red', hex: '#AB015B' },
  { name: 'yellow green', hex: '#9ACD32' }, { name: 'cranberry', hex: '#9E003A' },
  { name: 'brownish red', hex: '#8B0000' }, { name: 'dark rose', hex: '#C08081' },
  { name: 'bright purple', hex: '#8B00FF' }, { name: 'grey white', hex: '#F5F5F5' },
  { name: 'crimson red', hex: '#9B111E' }, { name: 'porcelain', hex: '#EFF2F3' },
  { name: 'sea blue', hex: '#006994' }, { name: 'brown sugar', hex: '#AF6E4D' },
  { name: 'pink red', hex: '#FF4040' }, { name: 'cotton candy', hex: '#FFB7D5' },
  { name: 'gold', hex: '#FFD700' }, { name: 'blueberry', hex: '#4F86F7' },
  { name: 'golden', hex: '#FFD700' }, { name: 'stone', hex: '#928B7B' },
  { name: 'goldenrod', hex: '#DAA520' }, { name: 'carmine', hex: '#960018' },
  { name: 'oyster', hex: '#E8E0D5' }, { name: 'flamingo', hex: '#FC8EAC' },
  { name: 'camel', hex: '#C19A6B' }, { name: 'cinnamon', hex: '#D2691E' },
  { name: 'hazel', hex: '#8E7748' }, { name: 'cocoa', hex: '#6B4226' },
  { name: 'sepia', hex: '#704214' }, { name: 'tomato', hex: '#FF6347' },
  { name: 'milk', hex: '#FDFFF5' }, { name: 'safety orange', hex: '#FF6600' },
  { name: 'lava', hex: '#CF1020' }, { name: 'bubblegum', hex: '#FF69B4' },
  { name: 'burntsienna', hex: '#E97451' }, { name: 'brownie', hex: '#6B3A2A' },
  { name: 'goldenrod', hex: '#DAA520' }, { name: 'sandy', hex: '#EED9A0' },
  { name: 'ochre', hex: '#CC7722' }, { name: 'darkred', hex: '#8B0000' },
  { name: 'dust', hex: '#B87B59' }, { name: 'maple', hex: '#C04000' },
  { name: 'darkteal', hex: '#00514C' }, { name: 'greyblue', hex: '#6699CC' },
  { name: 'champagne', hex: '#F7E7CE' }, { name: 'barnred', hex: '#7C0A02' },
  { name: 'lion', hex: '#C19A6B' }, { name: 'carmel', hex: '#A57A28' },
  { name: 'brickred', hex: '#8B4513' }, { name: 'greenblue', hex: '#009999' },
  { name: 'marmalade', hex: '#E87020' }, { name: 'buttermilk', hex: '#FFF8DC' },
  { name: 'lightgrey', hex: '#D3D3D3' }, { name: 'deepred', hex: '#8B0000' },
  { name: 'cantaloupe', hex: '#FFA62F' }, { name: 'burntumber', hex: '#8A3324' },
  { name: 'brownorange', hex: '#BE7A4D' }, { name: 'wheat', hex: '#F5DEB3' },
  { name: 'fern', hex: '#4F7942' }, { name: 'bluepurple', hex: '#5B0097' },
  { name: 'squash', hex: '#F2AB15' }, { name: 'forestgreen', hex: '#228B22' },
  { name: 'biscotti', hex: '#C4A67D' }, { name: 'orangeyellow', hex: '#FF8C00' },
  { name: 'darkpink', hex: '#E75480' }, { name: 'offwhite', hex: '#FAF9F6' },
  { name: 'babyblue', hex: '#89CFF0' }, { name: 'redorange', hex: '#FF4500' },
  { name: 'cardinal', hex: '#C41E3A' }, { name: 'cherryred', hex: '#DE3163' },
  { name: 'granola', hex: '#A88058' }, { name: 'brandy', hex: '#B85E2B' },
  { name: 'clementine', hex: '#F54D28' }, { name: 'marron', hex: '#800000' },
  { name: 'mud', hex: '#7B6B52' }, { name: 'papaya', hex: '#FFD455' },
  { name: 'rock', hex: '#808080' }, { name: 'neonred', hex: '#FF073A' },
  { name: 'royalblue', hex: '#4169E1' }, { name: 'fawn', hex: '#E5AA70' },
  { name: 'desert', hex: '#C2955D' }, { name: 'redbrown', hex: '#A52A2A' },
  { name: 'pinkorange', hex: '#FF7F50' }, { name: 'saffron', hex: '#F4C430' },
  { name: 'dandelion', hex: '#F0E130' }, { name: 'russet', hex: '#80461B' },
  { name: 'tuscan', hex: '#C89966' }, { name: 'sunshine', hex: '#FFE27A' },
  { name: 'umber', hex: '#635147' }, { name: 'bloodorange', hex: '#CC5500' },
  { name: 'brownred', hex: '#8B0000' }, { name: 'melon', hex: '#FDBCB4' },
  { name: 'pastelyellow', hex: '#FDFD96' }, { name: 'reddish', hex: '#C93545' },
  { name: 'sienna', hex: '#A0522D' }, { name: 'orangejuice', hex: '#FF8C00' },
  { name: 'candy', hex: '#FF6F91' }, { name: 'babypink', hex: '#F4C2C2' },
  { name: 'eggnog', hex: '#FFF8DC' }, { name: 'buff', hex: '#F0D58C' },
  { name: 'yellowgreen', hex: '#9ACD32' }, { name: 'neonyellow', hex: '#CCFF00' },
  { name: 'bluegrey', hex: '#6699CC' }, { name: 'oceanblue', hex: '#009DC4' },
  { name: 'brightblue', hex: '#0045FF' }, { name: 'brightorange', hex: '#FF5F00' },
  { name: 'brightpink', hex: '#FF007F' }, { name: 'brightyellow', hex: '#FFFF00' },
  { name: 'darkblue', hex: '#00008B' }, { name: 'darkgreen', hex: '#006400' },
  { name: 'darkgrey', hex: '#696969' }, { name: 'lightgreen', hex: '#90EE90' },
  { name: 'lightblue', hex: '#ADD8E6' }, { name: 'lightred', hex: '#FFCCCB' },
  { name: 'lightyellow', hex: '#FFFFE0' }, { name: 'lightgrey', hex: '#D3D3D3' },
  { name: 'darkteal', hex: '#00514C' }, { name: 'lightteal', hex: '#7EFCD2' },
  { name: 'darkpink', hex: '#E75480' }, { name: 'babypink', hex: '#F4C2C2' },
  { name: 'babyblue', hex: '#89CFF0' }, { name: 'offwhite', hex: '#FAF9F6' },
  { name: 'neongreen', hex: '#39FF14' }, { name: 'neonblue', hex: '#0047AB' },
  { name: 'neonred', hex: '#FF073A' }, { name: 'neonpink', hex: '#FF10F0' },
  { name: 'seagreen', hex: '#2E8B57' }, { name: 'seafoam', hex: '#93E9BE' },
  { name: 'seashell', hex: '#FFF5EE' }, { name: 'biscuit', hex: '#C4A67D' },
  { name: 'gingerbread', hex: '#9B5B33' }, { name: 'tortilla', hex: '#C89966' },
  { name: 'latte', hex: '#C8A882' }, { name: 'coco', hex: '#6B4226' },
  { name: 'cookie', hex: '#C69C6D' }, { name: 'rainbow', hex: '#FF7F00' },
  { name: 'rain', hex: '#5B7BA5' }, { name: 'sunrise', hex: '#FFCC33' },
  { name: 'sunset', hex: '#FD5E53' }, { name: 'flame', hex: '#E25822' },
  { name: 'yellowbrown', hex: '#C5A45A' }, { name: 'orangebrown', hex: '#BE7A4D' },
  { name: 'goldenbrown', hex: '#A67B28' }, { name: 'tanbrown', hex: '#B5651D' },
  { name: 'candyapplered', hex: '#FF0800' }, { name: 'brightgreen', hex: '#66FF00' },
  { name: 'brightred', hex: '#FF0000' }, { name: 'electricblue', hex: '#7DF9FF' },
  { name: 'brig', hex: '#808080' }, { name: 'vermillion', hex: '#F4320c' },
  { name: 'chili', hex: '#BE4B41' }, { name: 'nude', hex: '#F2D2BD' },
  { name: 'bonewhite', hex: '#E3DAC9' }, { name: 'acai', hex: '#4A0E2E' },
  { name: 'redpink', hex: '#FF4040' }, { name: 'brunette', hex: '#6B3A2A' },
  { name: 'sandstone', hex: '#C8B88A' }, { name: 'brownish', hex: '#A52A2A' },
  { name: 'yelloworange', hex: '#FFAE42' }, { name: 'marigold', hex: '#EAA221' },
  { name: 'hazelnut', hex: '#B5A276' }, { name: 'almond', hex: '#EED9C4' },
  { name: 'raspberry', hex: '#E30B5C' }, { name: 'terracotta', hex: '#E2725B' },
  { name: 'spice', hex: '#7B4B2A' }, { name: 'yam', hex: '#C89966' },
  { name: 'cardboard', hex: '#B5792A' }, { name: 'linen', hex: '#FAF0E6' },
  { name: 'lipstick', hex: '#AB015B' }, { name: 'oxblood', hex: '#4A0000' },
  { name: 'purple red', hex: '#E0115F' }, { name: '3amlatte', hex: '#5C3317' },
  { name: 'lipstick red', hex: '#AB015B' },
];

// Build the full color lookup
let colorLookupCache: Map<string, ColorData> | null = null;

const normalizeColorName = (name: string): string => {
  return name.toLowerCase().replace(/ /g, '');
};

function getColorLookup(): Map<string, ColorData> {
  if (colorLookupCache) return colorLookupCache;

  const colorMap = new Map<string, ColorData>();
  const seen = new Set<string>();

  // Add overrides first (higher priority)
  for (const color of Object.values(colordleColorOverrides)) {
    const normalized = normalizeColorName(color.name);
    if (!seen.has(normalized)) {
      seen.add(normalized);
      colorMap.set(normalized, color);
    }
  }

  // Then add named colors
  for (const color of NAMED_COLORS) {
    const normalized = normalizeColorName(color.name);
    if (!seen.has(normalized)) {
      seen.add(normalized);
      colorMap.set(normalized, color);
    }
  }

  colorLookupCache = colorMap;
  return colorLookupCache;
}

export function getAllColors(): ColorData[] {
  return Array.from(getColorLookup().values());
}

export function getTargetColorNames(): string[] {
  return targetColorNames.colors;
}

export function resolveTargetColors(targetNames: string[]): ColorData[] {
  const colorMap = getColorLookup();
  return targetNames.map(name => {
    const normalized = normalizeColorName(name);
    const match = colorMap.get(normalized);
    if (match) return match;
    return { name, hex: '#000000' };
  });
}

export function getTargetColors(): ColorData[] {
  return resolveTargetColors(targetColorNames.colors);
}

export function getUniqueTargetColors(): ColorData[] {
  const targets = getTargetColors();
  const seen = new Set<string>();
  const unique: ColorData[] = [];
  for (const t of targets) {
    const key = normalizeColorName(t.name);
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(t);
    }
  }
  return unique;
}

// Colordle daily answer logic
const COLORDLE_START_DATE = new Date('2022-04-25T00:00:00Z');

export function getColordleDayNumber(date: Date = new Date()): number {
  const utcMs = date.getTime() + date.getTimezoneOffset() * 60000;
  const startMs = COLORDLE_START_DATE.getTime();
  return Math.floor((utcMs - startMs) / 86400000);
}

export function getColordleDailyAnswer(date: Date = new Date()): ColorData {
  const dayNumber = getColordleDayNumber(date);
  const targets = getTargetColors();
  const index = ((dayNumber % targets.length) + targets.length) % targets.length;
  return targets[index];
}

// Find best candidates for the solver
export function findBestCandidates(
  candidates: ColorData[],
  guesses: { guess: ColorData; percent: number }[]
): ColorData[] {
  if (guesses.length === 0) return candidates;

  return candidates.filter(candidate => {
    const candidateRgb = hexToRgb(candidate.hex);
    if (!candidateRgb) return false;

    return guesses.every(g => {
      const guessRgb = hexToRgb(g.guess.hex);
      if (!guessRgb) return false;
      const calculatedPercent = colorDiff(candidateRgb, guessRgb);
      return Math.abs(calculatedPercent - g.percent) < 0.02;
    });
  });
}
