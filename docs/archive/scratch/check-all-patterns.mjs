import fs from 'fs';
import path from 'path';

function walk(dir) {
  let res = [];
  const list = fs.readdirSync(dir);
  for (const item of list) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (item !== 'node_modules' && item !== '.next' && item !== '.git') {
        res = res.concat(walk(full));
      }
    } else if (/\.(tsx|ts|jsx|js)$/.test(item)) {
      res.push(full);
    }
  }
  return res;
}

const files = walk('src');
const patterns = [
  'bg-gradient-to-',
  'max-w-[1280px]',
  'max-w-[1320px]',
  'w-[36rem]',
  'h-[36rem]',
  'w-[40rem]',
  'h-[40rem]',
  'w-[800px]',
  'h-[400px]',
  'w-[450px]',
  'h-[450px]',
  'max-w-[390px]',
  'min-h-[760px]',
  'min-h-[720px]',
  'text-[#540114]',
  'text-[#934841]',
  'text-[#564243]',
  'text-[#721a28]',
  'text-[#221a18]',
  'to-[#fceae6]',
  'from-[#ffdad6]',
  'to-[#fea095]',
  'bg-[#540114]',
  'border-[#540114]',
  'border-[#934841]',
  'text-[#76322b]',
  'text-[#897172]',
  'text-[#fea095]',
  'rounded-[32px]',
  'rounded-[24px]',
  'aspect-[4/3]',
  'min-h-[82px]',
  'min-h-[290px]',
  'sm:min-h-[310px]',
  'w-[200px]',
  'sm:w-[220px]',
  'placeholder:text-[#934841]/55',
  'ring-[#721a28]/20',
  'focus-within:ring-[#721a28]/15',
  'bg-[#540114]/15',
  'from-[#540114]',
  'from-[#721a28]',
  'to-[#540114]',
  'to-[#934841]',
  'via-[#fea095]/30',
  'to-[#fceae6]/30',
  'from-[#ffdad6]/60'
];

let totalMatches = 0;
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  for (const p of patterns) {
    if (content.includes(p)) {
      console.log(`Found: "${p}" in ${file}`);
      totalMatches++;
    }
  }
}
console.log('Total matches found:', totalMatches);
