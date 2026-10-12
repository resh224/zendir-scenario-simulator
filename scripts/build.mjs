import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
let html=fs.readFileSync(path.join(root,'src/index.html'),'utf8');
for(const [marker,file] of [['STYLES','styles.css'],['ENGINE','engine.js'],['APP','views.js']])html=html.replace(`/* ${marker} */`,()=>fs.readFileSync(path.join(root,'src',file),'utf8'));
html=html.replaceAll('__ZENDIR_LOGO__','data:image/webp;base64,'+fs.readFileSync(path.join(root,'assets/zendir.webp')).toString('base64'));
fs.mkdirSync(path.join(root,'dist'),{recursive:true});fs.writeFileSync(path.join(root,'dist/index.html'),html);fs.writeFileSync(path.join(root,'dist/.nojekyll'),'');fs.writeFileSync(path.join(root,'index.html'),html);fs.writeFileSync(path.join(root,'.nojekyll'),'');
console.log(`Built self-contained offline simulator: ${Buffer.byteLength(html)} bytes.`);
