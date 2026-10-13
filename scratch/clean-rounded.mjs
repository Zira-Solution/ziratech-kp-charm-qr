import fs from 'fs';
import path from 'path';

function walk(dir) {
  let files = [];
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) files = files.concat(walk(full));
    else if (full.endsWith('.tsx') || full.endsWith('.ts')) files.push(full);
  }
  return files;
}

const map = {
  'rounded-[56px]': 'rounded-4xl',
  'rounded-[44px]': 'rounded-3xl',
  'rounded-[36px]': 'rounded-4xl',
  'rounded-[32px]': 'rounded-4xl',
  'rounded-[30px]': 'rounded-3xl',
  'rounded-[28px]': 'rounded-3xl',
  'rounded-[24px]': 'rounded-3xl',
  'rounded-[22px]': 'rounded-2xl',
  'rounded-[20px]': 'rounded-2xl',
  'rounded-[18px]': 'rounded-2xl',
  'rounded-[16px]': 'rounded-2xl',
  'rounded-[14px]': 'rounded-xl',
  'rounded-[12px]': 'rounded-xl',
  'rounded-[10px]': 'rounded-lg',
  'rounded-[8px]': 'rounded-lg',
  'rounded-[6px]': 'rounded-md',
  'rounded-[4px]': 'rounded-sm',
};

let count = 0;
for (const file of walk('src')) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  for (const [from, to] of Object.entries(map)) {
    if (content.includes(from)) {
      content = content.replaceAll(from, to);
      count++;
    }
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated rounded in: ${file}`);
  }
}

console.log(`Replaced ${count} arbitrary rounded classes.`);
