import {test,expect,type Page} from "@playwright/test";

declare global {interface Window{__critical:Array<{phase:string;brains:number;loaders:number;wrong:number;logos:number;heroBrain:boolean;model:string|null;z:string|null;y:number}>;}}
async function instrument(page:Page,seen=false){
  await page.addInitScript(seen=>{
    if(seen)sessionStorage.setItem("budai:cinematic-intro:v1","1");
    localStorage.setItem("budai-cookies","declined");sessionStorage.setItem("budai-buddy-popup-dismissed","true");sessionStorage.setItem("budai-end-toast","1");
    window.__critical=[];
    const sample=()=>{
      const opening=document.querySelector("[data-global-loader]"),hero=document.querySelector("#intelligence"),brain=document.querySelector<HTMLCanvasElement>("[data-brain-canvas]");
      window.__critical.push({phase:document.documentElement?.dataset.budaiIntro??"",brains:document.querySelectorAll("[data-brain-canvas]").length,loaders:document.querySelectorAll("[data-global-loader]").length,wrong:document.querySelectorAll("[data-fallback-kind],.identity-fallback,.brain-fallback").length,logos:(opening?.querySelectorAll("[data-budai-mark],.intro-wordmark").length??0)+(hero?.querySelectorAll("[data-budai-mark],canvas,[data-brain-poster]").length??0),heroBrain:scrollY<2&&document.documentElement?.dataset.budaiIntro==="done"&&!!brain,model:brain?.dataset.brainModel??null,z:brain?.dataset.cameraZ??null,y:scrollY});
    };
    new MutationObserver(sample).observe(document,{subtree:true,childList:true,attributes:true,attributeFilter:["data-budai-intro","data-brain-model","data-camera-z"]});sample();
  },seen);
}
async function settledHero(page:Page){
  await expect(page.locator("html")).toHaveAttribute("data-budai-intro","done");
  await expect(page.locator("[data-global-loader],[data-brain-canvas]")).toHaveCount(0);
  await expect(page.getByRole("heading",{level:1})).toBeVisible();
  await expect(page.locator("#main")).not.toHaveAttribute("inert");
  await expect(page.locator("#intelligence [data-budai-mark],#intelligence canvas,#intelligence [data-brain-poster]")).toHaveCount(0);
}
async function verify(page:Page){
  const frames=await page.evaluate(()=>window.__critical);
  await test.info().attach("opening-and-hero-lifecycle",{body:JSON.stringify(frames),contentType:"application/json"});
  expect(Math.max(...frames.map(f=>f.brains))).toBeLessThanOrEqual(1);
  expect(Math.max(...frames.map(f=>f.loaders))).toBeLessThanOrEqual(1);
  expect(frames.every(f=>!f.wrong&&!f.logos&&!f.heroBrain)).toBe(true);
  expect(frames.filter(f=>f.model).every(f=>f.model==="budai-neural-43f44c9")).toBe(true);

}
for(const width of [1440,390,360])test(`critical opening ${width}: same intended model, one surface, no logo/SVG flash, disposed stable hero`,async({page})=>{
  await page.setViewportSize({width,height:width===1440?1000:844});await instrument(page);
  const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
  await page.goto("/",{waitUntil:"domcontentloaded"});
  await expect(page.locator("[data-brain-canvas]")).toHaveAttribute("data-rendered","true");
  await expect(page.locator("[data-brain-canvas]")).toHaveAttribute("data-brain-model","budai-neural-43f44c9");
  await expect.poll(async()=>Number(await page.locator("[data-brain-canvas]").getAttribute("data-camera-z"))).toBeLessThan(.8);
  await page.screenshot({path:`test-results/critical-opening-${width}.png`});
  await settledHero(page);await page.waitForTimeout(600);
  await page.screenshot({path:`test-results/critical-hero-${width}.png`});
  await page.setViewportSize({width:width===1440?1100:width+20,height:900});
  await page.emulateMedia({reducedMotion:"reduce"});await page.emulateMedia({reducedMotion:"no-preference"});
  await settledHero(page);await verify(page);expect(errors).toEqual([]);
});

test("delayed hydration first paint uses only a capture of the canonical model, never an alternate SVG",async({page})=>{
  await instrument(page);let delayed=false;
  await page.route("**/_next/static/chunks/*.js",async route=>{
    const response=await route.fetch(),body=await response.text();
    if(!delayed&&body.includes("Entering BudAI")){delayed=true;await new Promise(r=>setTimeout(r,850));}
    await route.fulfill({response,body});
  });
  await page.goto("/",{waitUntil:"commit"});
  await expect(page.locator("[data-global-loader] [data-brain-poster]")).toBeVisible();
  await expect(page.locator("[data-global-loader] svg")).toHaveCount(0);
  await expect(page.locator("[data-global-loader] img")).toHaveJSProperty("complete",true);
  await page.screenshot({path:"test-results/critical-first-paint.png"});
  await settledHero(page);await verify(page);
});

test("late brain import finishes preparation without a replacement brain and cannot wake up on the hero",async({page})=>{
  await instrument(page);let delayed=false;
  await page.route("**/_next/static/chunks/*.js",async route=>{
    const response=await route.fetch(),body=await response.text();
    if(!delayed&&body.includes("BrainFlight disabled")){delayed=true;await new Promise(r=>setTimeout(r,3300));}
    await route.fulfill({response,body});
  });
  await page.goto("/");await settledHero(page);await page.waitForTimeout(2300);await settledHero(page);expect(delayed).toBe(true);await verify(page);
});

test("normal and cache-disabled hard refresh never replay or initialise a hero brain",async({page})=>{
  await instrument(page);await page.goto("/");await settledHero(page);
  await page.reload();await settledHero(page);
  const cdp=await page.context().newCDPSession(page);await cdp.send("Network.enable");await cdp.send("Network.setCacheDisabled",{cacheDisabled:true});
  await page.reload({waitUntil:"domcontentloaded"});await settledHero(page);await verify(page);await cdp.detach();
});

test("WebGL failure releases the single opening and never swaps in a different brain or logo",async({page})=>{
  await instrument(page);
  await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(this:HTMLCanvasElement,kind:string,...args:unknown[]){if(kind.includes("webgl"))return null;return original.apply(this,[kind,...args] as Parameters<typeof original>);} as typeof original;});
  await page.goto("/");await settledHero(page);await verify(page);
  await page.getByRole("link",{name:"Open Playground",exact:true}).click();await expect(page.getByRole("textbox",{name:"Message BudAI",exact:true})).toBeVisible();
});

test("reduced motion has no opening or hero graphics; story, product and navigation remain available",async({page})=>{
  await page.emulateMedia({reducedMotion:"reduce"});await instrument(page);await page.goto("/");await settledHero(page);await verify(page);
  await page.locator("#signal").scrollIntoViewIfNeeded();await expect(page.locator("#signal [data-original-stage]")).toHaveCount(4);
  await expect(page.locator("#signal [data-brain-poster]")).toBeVisible();
});

test("scroll story is separate: it appears once only in its section, and cannot return with the hero or history",async({page})=>{
  await instrument(page,true);await page.goto("/");await settledHero(page);
  await page.locator("#signal").evaluate(el=>scrollTo({top:el.getBoundingClientRect().top+scrollY+450,behavior:"instant" as ScrollBehavior}));
  await expect(page.locator("[data-brain-canvas]")).toHaveAttribute("data-sequence","journey");
  await expect(page.locator("[data-brain-canvas]")).toHaveCount(1);await expect(page.locator("[data-global-loader]")).toHaveCount(0);
  await page.evaluate(()=>scrollTo({top:0,behavior:"instant" as ScrollBehavior}));await settledHero(page);
  await page.goto("/legal/privacy");await page.goBack();await settledHero(page);await verify(page);
});
