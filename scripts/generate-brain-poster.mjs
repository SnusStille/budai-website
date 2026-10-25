/** Same-model entry poster, not replacement artwork. Uses the actual BrainFlight
 * component, initial camera, seeded geometry and first-frame lighting. No dev
 * route/test flag is shipped and no additional dependency/server is required.
 */
import path from 'node:path';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {chromium} from '@playwright/test';
import {browserRuntime} from './browser-runtime.mjs';
const require=createRequire(import.meta.url),wp=require('next/dist/compiled/webpack/webpack');wp.init();
const root=process.cwd(),work=path.join(root,'.cache/brain-poster');await mkdir(work,{recursive:true});await mkdir('public/brain',{recursive:true});
const entry=`import React from 'react';import{createRoot}from'react-dom/client';import BrainFlight from '${path.join(root,'components/effects/BrainFlight.tsx')}';const motion={current:{kind:'intro',progress:0}};createRoot(document.getElementById('root')).render(React.createElement(BrainFlight,{motion,mode:'intro',active:true,onReady:()=>{const source=document.querySelector('canvas'),copy=document.createElement('canvas');copy.width=source.width;copy.height=source.height;const c=copy.getContext('2d');c.fillStyle='#020205';c.fillRect(0,0,copy.width,copy.height);c.drawImage(source,0,0);window.__posterImage=copy.toDataURL('image/webp',.88);window.__posterReady=true;},onFail:()=>window.__posterFailed=true}));`;
await writeFile(path.join(work,'entry.js'),entry);
await new Promise((resolve,reject)=>wp.webpack({mode:'production',optimization:{minimize:false},context:root,target:'web',entry:path.join(work,'entry.js'),output:{path:work,filename:'render.js'},resolve:{extensions:['.tsx','.ts','.js'],alias:{'@':root},modules:[path.join(root,'node_modules')]},module:{rules:[{test:/\.tsx?$/,use:path.join(root,'scripts/poster-loader.cjs')}]}},(error,stats)=>error||stats.hasErrors()?reject(error||new Error(stats.toString({all:false,errors:true}))):resolve()));
const bundle=await readFile(path.join(work,'render.js'),'utf8');
const browser=await chromium.launch({...await browserRuntime(),headless:true});
try{
 for(const [name,width,height]of[['desktop',1440,1000],['mobile',390,844]]){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
  await page.route('http://brain-poster.local/**',route=>route.fulfill({contentType:'text/html',body:`<!doctype html><style>html,body,#root{margin:0;width:100%;height:100%;background:transparent}canvas{position:absolute;inset:0;width:100%;height:100%}</style><div id="root"></div><script>${bundle.replaceAll('</script','<\\/script')}</script>`}));
  await page.goto('http://brain-poster.local/');
  await page.waitForFunction(()=>window.__posterReady||window.__posterFailed);if(await page.evaluate(()=>window.__posterFailed))throw new Error('Actual brain renderer failed');
  const image=await page.evaluate(()=>window.__posterImage);
  await writeFile(`public/brain/entry-${name}.webp`,Buffer.from(image.split(',')[1],'base64'));
  console.log(name,await page.locator('[data-brain-canvas]').evaluate(el=>({model:el.dataset.brainModel,camera:el.dataset.cameraPose,fov:el.dataset.fov})));await page.close();
 }
 await writeFile('public/brain/model.json',JSON.stringify({id:'budai-neural-43f44c9',seed:43044,source:'Original repository BrainFlight SDF; deterministic sampling; no imported atlas/model',poster:'Actual BrainFlight first frame, fixed intro progress 0 and light time 1.9',variants:['entry-desktop.webp','entry-mobile.webp']},null,2)+'\n');
}finally{await browser.close();}
