import { chromium } from '@playwright/test';
import { access, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const input=path.join(here,'template.html');
const output=path.join(here,'images');
await mkdir(output,{recursive:true});
const images=['01_RIVAQ_COVER','02_RIVAQ_DESKTOP','03_RIVAQ_MOBILE','04_RIVAQ_SHOP','05_RIVAQ_PRODUCT','06_RIVAQ_EXPERIENCE','07_RIVAQ_IDENTITY'];
for(const f of ['../screens/home-desktop.svg','../screens/shop-desktop.svg','../screens/home-mobile.svg','../screens/product-mobile.svg'])await access(path.join(here,f));
const browser=await chromium.launch({headless:true});
try{
 for(let i=0;i<images.length;i++){
  const page=await browser.newPage({viewport:{width:1650,height:1200},deviceScaleFactor:1,colorScheme:'light',reducedMotion:'reduce',locale:'ar-EG'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(input).toString()+'?slide='+(i+1),{waitUntil:'load',timeout:45000});
  await page.evaluate(()=>document.fonts.ready);
  await page.locator('.canvas').waitFor({state:'visible'});
  const state=await page.evaluate(()=>{
    const box=document.querySelector('.canvas').getBoundingClientRect();
    const images=Array.from(document.querySelectorAll('img')).map(img=>({alt:img.alt,ok:img.complete&&img.naturalWidth>0,w:img.naturalWidth,h:img.naturalHeight}));
    const heading=document.querySelector('h1')?.textContent;
    return {w:box.width,h:box.height,images,heading,font:document.fonts.check('900 85px CairoLocal')};
  });
  if(errors.length || state.w!==1650 || state.h!==1200 || state.images.some(x=>!x.ok)|| !state.font || !state.heading){
    throw new Error(images[i]+' failed visual preflight: '+JSON.stringify({errors,...state}));
  }
  await page.locator('.canvas').screenshot({path:path.join(output,images[i]+'.png'),type:'png',animations:'disabled',timeout:30000});
  const info=await stat(path.join(output,images[i]+'.png'));
  if(info.size<50000 || info.size>25*1024*1024) throw new Error(images[i]+' invalid output size '+info.size);
  console.log('PASS '+images[i]+' / '+info.size+' bytes / '+state.images.length+' verified real captures');
  await page.close();
 }
}finally{await browser.close();}
