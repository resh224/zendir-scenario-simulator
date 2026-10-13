const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
(async()=>{
 const config=JSON.parse(fs.readFileSync(process.env.ZENDIR_ACCESS_FILE,'utf8'));
 const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 assert(!html.includes(config.password));assert(!html.includes('function crewAndFaultViews'));assert(!html.includes('ADCS_REPORT'));
 const browser=await chromium.launch({headless:true,executablePath:process.env.ZENDIR_TEST_BROWSER||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 const context=await browser.newContext({offline:true,acceptDownloads:true,viewport:{width:1440,height:1000}}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.join(root,'index.html')).href);
 await page.locator('#email').fill(config.emails[0]);await page.locator('#password').fill('incorrect');await page.locator('#unlock').click();await page.waitForFunction(()=>document.querySelector('#error').textContent.includes('Unable'));assert(!(await page.locator('#session').evaluate(n=>n.classList.contains('active'))));
 await page.locator('#email').fill('unlisted@example.com');await page.locator('#password').fill(config.password);await page.locator('#unlock').click();await page.waitForFunction(()=>document.querySelector('#error').textContent.includes('Unable'));
 for(const email of config.emails){await page.locator('#email').fill(email.toUpperCase());await page.locator('#password').fill(config.password);await page.locator('#unlock').click();await page.waitForFunction(()=>document.querySelector('#session').classList.contains('active'));const frame=page.frameLocator('#simulator');await frame.locator('#role-title').waitFor();assert.equal(await frame.locator('#role-title').innerText(),'Spacecraft Operator');await frame.locator('#step').click();await frame.locator('[data-role=cyber]').click();assert.equal(await frame.locator('#role-title').innerText(),'Cyber Defender');await page.locator('#lock').click();assert.equal(await page.locator('#simulator').getAttribute('srcdoc'),'');}
 await page.locator('#email').fill(config.emails[0]);await page.locator('#password').fill(config.password);await page.locator('#unlock').click();await page.waitForFunction(()=>document.querySelector('#session').classList.contains('active'));const frame=page.frameLocator('#simulator');await frame.locator('#role-title').waitFor();await frame.locator('#step').click();const download=page.waitForEvent('download');await frame.locator('#export-json').click();assert((await download).suggestedFilename().endsWith('.json'));await page.reload();assert(!(await page.locator('#session').evaluate(n=>n.classList.contains('active'))));
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'/private/tmp/zendir-simulator-qa/access-mobile.png',fullPage:true});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 assert.deepEqual(errors,[]);await browser.close();console.log('PASS: encrypted gate, all six case-insensitive email labels, rejected wrong password/unlisted email, simulator interaction/export, lock, reload and mobile.');
})().catch(e=>{console.error(e);process.exit(1)});
