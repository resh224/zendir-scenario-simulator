import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
let html=fs.readFileSync(path.join(root,'src/index.html'),'utf8');
for(const [marker,file] of [['LIBRARY','scenario-library.js'],['STYLES','styles.css'],['ENGINE','engine.js'],['APP','views.js']])html=html.replace(`/* ${marker} */`,()=>fs.readFileSync(path.join(root,'src',file),'utf8'));
const logo='data:image/webp;base64,'+fs.readFileSync(path.join(root,'assets/zendir.webp')).toString('base64');
html=html.replaceAll('__ZENDIR_LOGO__',logo).replaceAll('__MISSION_WATERCOLOR__','data:image/jpeg;base64,'+fs.readFileSync(path.join(root,'assets/mission-watercolor.jpg')).toString('base64'));
// The clear QA build is ignored by Git and never part of the Pages publication.
fs.mkdirSync(path.join(root,'qa'),{recursive:true});fs.writeFileSync(path.join(root,'qa/simulator.html'),html,{mode:0o600});
if(process.argv.includes('--qa-only')){console.log('Built local QA simulator. Public bundles unchanged.');process.exit(0);}
const credentialPath=process.env.ZENDIR_ACCESS_FILE;
if(!credentialPath)throw Error('Set ZENDIR_ACCESS_FILE to the owner-only local access JSON. Publication fails closed without it.');
const config=JSON.parse(fs.readFileSync(credentialPath,'utf8'));
if(typeof config.password!=='string'||!Array.isArray(config.emails)||!config.emails.length)throw Error('Invalid local access configuration.');
const salt=crypto.randomBytes(32),contentKey=crypto.randomBytes(32);
function seal(value,key){const iv=crypto.randomBytes(12),cipher=crypto.createCipheriv('aes-256-gcm',key,iv),data=Buffer.concat([cipher.update(value),cipher.final(),cipher.getAuthTag()]);return {iv:iv.toString('base64'),data:data.toString('base64')};}
const sealed=seal(Buffer.from(html),contentKey),users={};
for(const value of config.emails){const email=value.trim().toLowerCase(),id=crypto.createHash('sha256').update(email).digest('hex');const key=crypto.pbkdf2Sync(config.password+'\0'+email,salt,600000,32,'sha256');users[id]=seal(contentKey,key);key.fill(0);}
contentKey.fill(0);
let gate=fs.readFileSync(path.join(root,'src/access.html'),'utf8').replaceAll('__ZENDIR_LOGO__',logo).replace('/* ENCRYPTED_PAYLOAD */',()=>JSON.stringify({salt:salt.toString('base64'),...sealed,users}));
fs.mkdirSync(path.join(root,'dist'),{recursive:true});
for(const dir of ['', 'dist']){fs.writeFileSync(path.join(root,dir,'index.html'),gate);fs.writeFileSync(path.join(root,dir,'.nojekyll'),'');}
console.log(`Built encrypted shared-password demo: ${Buffer.byteLength(gate)} bytes. No password stored in publication.`);
