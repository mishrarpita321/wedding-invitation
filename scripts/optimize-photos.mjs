import sharp from 'sharp';
import { mkdir, copyFile, readdir } from 'node:fs/promises';
await mkdir('public/assets',{recursive:true});
for(const name of ['arpita','swagat','together']){
 await sharp(`assets/${name}.jpg.jpg`).rotate().resize({width:1800,withoutEnlargement:true}).webp({quality:86}).toFile(`public/assets/${name}.webp`);
 await sharp(`assets/${name}.jpg.jpg`).rotate().resize({width:800,withoutEnlargement:true}).webp({quality:84}).toFile(`public/assets/${name}-small.webp`);
}
const music=(await readdir('assets')).find(name=>name.endsWith('.mp3'));
if(music) await copyFile(`assets/${music}`,'public/assets/wedding-music.mp3');
console.log('Photographs optimized; original files preserved. Music copied.');
