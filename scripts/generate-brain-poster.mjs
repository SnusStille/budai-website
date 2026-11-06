/** Same-model entry poster, not replacement artwork. Uses the actual BrainFlight
 * component, the LANDING PAGE hero pose, seeded geometry and a fully composed
 * frame. No dev route/test flag is shipped and no extra dependency is required.
 */
import path from 'node:path';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {chromium} from '@playwright/test';
import {browserRuntime} from './browser-runtime.mjs';
const require=createRequire(import.meta.url),wp=require('next/dist/compiled/webpack/webpack');
// Next 16 no longer ships the `init()` bootstrap on its bundled webpack.
// It is still required on Next 14/15, so keep it optional.
if(typeof wp.init==='function')wp.init();
const root=process.cwd(),work=path.join(root,'.cache/brain-poster');await mkdir(work,{recursive:true});await mkdir('public/brain',{recursive:true});

// The poster MUST be captured at the hero pose. The old generator used
// intro progress zero, where brainVisualAt() returns cortex 0.14 and
// neural 0. FS_POINTS multiplies the point cloud by
// smoothstep(0.04,0.32,uJourney) = 0 there, and curAct starts near zero, so
// only dim wire lines survived. That made the loading screen (and every WebGL
// fallback) look like a dead, black brain while the live hero was bright.
// `onReady` also fired after the FIRST draw, before bloom/points had settled —
// and a WebGL canvas with preserveDrawingBuffer:false cannot be reliably read
// with toDataURL(). Playwright's element screenshot captures the real
// composited frame instead, then Chromium encodes it to WebP.
const entry=`import React from 'react';import{createRoot}from'react-dom/client';import BrainFlight from '${path.join(root,'components/effects/BrainFlight.tsx')}';const motion={current:{kind:'hero',progress:0}};createRoot(document.getElementById('root')).render(React.createElement(BrainFlight,{motion,mode:'intro',activity:1,active:true,onFail:()=>window.__posterFailed=true}));`;
await writeFile(path.join(work,'entry.js'),entry);
await new Promise((resolve,reject)=>wp.webpack({mode:'production',optimization:{minimize:false},context:root,target:'web',entry:path.join(work,'entry.js'),output:{path:work,filename:'render.js'},resolve:{extensions:['.tsx','.ts','.js'],alias:{'@':root},modules:[path.join(root,'node_modules')]},module:{rules:[{test:/\.tsx?$/,use:path.join(root,'scripts/poster-loader.cjs')}]}},(error,stats)=>error||stats.hasErrors()?reject(error||new Error(stats.toString({all:false,errors:true}))):resolve()));
const bundle=await readFile(path.join(work,'render.js'),'utf8');
const browser=await chromium.launch({...await browserRuntime(),headless:true});
try{
 for(const [name,width,height]of[['desktop',1440,1000],['mobile',390,844]]){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
  // The canvas is transparent and Playwright's element screenshot captures the
  // whole composited layer under its box, so baking the same ambient glow the
  // hero has into THIS page bakes it into the poster. Without it the poster is
  // an opaque black rectangle that hides .opening-brain-frame's radial glow,
  // which is why the loading screen looked like a dead wire brain.
  const glow=`background:
    radial-gradient(ellipse 26% 34% at 50% 48%,rgba(0,214,240,.17),transparent 72%),
    radial-gradient(ellipse 18% 24% at 54% 42%,rgba(167,139,250,.12),transparent 72%),
    radial-gradient(ellipse 40% 46% at 50% 47%,rgba(11,36,48,.55),transparent 70%),
    #020205`;
  await page.route('http://brain-poster.local/**',route=>route.fulfill({contentType:'text/html',body:`<!doctype html><style>html,body,#root{margin:0;width:100%;height:100%;${glow}}canvas{position:absolute;inset:0;width:100%;height:100%}</style><div id="root"></div><script>${bundle.replaceAll('</script','<\\/script')}</script>`}));
  await page.goto('http://brain-poster.local/');
  await page.waitForFunction(()=>document.querySelector('[data-brain-canvas]')?.dataset.rendered==='true'||window.__posterFailed);
  if(await page.evaluate(()=>window.__posterFailed))throw new Error('Actual brain renderer failed');
  // Let several real frames composite so the point cloud, wave and bloom settle.
  await page.waitForTimeout(900);
  const png=await page.locator('[data-brain-canvas]').screenshot();
  // Re-encode PNG -> WebP inside Chromium; no native image dependency.
  const dataUrl=await page.evaluate(async b64=>{
   const img=new Image();img.src='data:image/png;base64,'+b64;await img.decode();
   const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;
   const ctx=c.getContext('2d');ctx.fillStyle='#020205';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(img,0,0);
   return c.toDataURL('image/webp',.88);
  },png.toString('base64'));
  await writeFile(`public/brain/entry-${name}.webp`,Buffer.from(dataUrl.split(',')[1],'base64'));
  console.log(name,await page.locator('[data-brain-canvas]').evaluate(el=>({model:el.dataset.brainModel,camera:el.dataset.cameraPose,fov:el.dataset.fov})));await page.close();
 }
 await writeFile('public/brain/model.json',JSON.stringify({id:'budai-neural-43f44c9',seed:43044,source:'Original repository BrainFlight SDF; deterministic sampling; no imported atlas/model',poster:'Actual BrainFlight composed frame at the hero pose (cortex 1, activity 1) with orbiting relay nodes, captured by the browser compositor; matches the landing-page brain',variants:['entry-desktop.webp','entry-mobile.webp']},null,2)+'\n');
}finally{await browser.close();}
