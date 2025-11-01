const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

const apiDir = path.resolve(__dirname, '../src/app/api');
const files = walk(apiDir).filter(f => f.endsWith('route.ts') || f.endsWith('route.js'));

const candidates = [];
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const usesModel = /@(\/|\\)models\//.test(content) || /mongoose\./.test(content) || /from "mongoose"/.test(content);
  const hasConnect = content.includes('await dbConnect(') || content.includes('await connect(') || content.includes('\nconnect();') || content.includes('await __ensureConnect()');
  if (usesModel && !hasConnect) {
    candidates.push(f.replace(process.cwd() + path.sep, ''));
  }
});

console.log('Route files that use Mongoose/models but lack connect():');
if (candidates.length === 0) {
  console.log('None');
} else {
  candidates.forEach(c => console.log(' -', c));
}
