import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({args:['--no-sandbox','--disable-dev-shm-usage','--headless=new','--hide-scrollbars','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--force-device-scale-factor=1'],executablePath:'/tmp/chromium',headless:true,protocolTimeout:240000});
const p = await b.newPage(); await p.setViewport({width:1440,height:900});
await p.goto('http://127.0.0.1:3000/',{waitUntil:'domcontentloaded'}); await new Promise(r=>setTimeout(r,2500));
await p.evaluate(()=>{const btn=[...document.querySelectorAll('button')].find(x=>/^accept$/i.test((x.textContent||'').trim()));btn&&btn.click();});
await p.evaluate(()=>{document.documentElement.style.scrollBehavior='auto';});
const H = await p.evaluate(()=>document.body.scrollHeight);
let i=0;
for (let y=0; y<H; y+=860) {
  await p.evaluate((yy)=>window.scrollTo(0,yy), y);
  await new Promise(r=>setTimeout(r,1250));
  await p.screenshot({path:`/tmp/verify/w${String(i).padStart(2,'0')}.png`});
  i++;
}
await b.close(); console.log('sections', i, 'height', H);
