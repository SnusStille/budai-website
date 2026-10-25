import { test, expect, type Page } from "@playwright/test";

declare global { interface Window { __openingPoses:Array<{z:number;identity:number;phase:string;sequence:string;brains:number;loaders:number}>; } }
async function quiet(page:Page,skip=true){
  await page.addInitScript(skip=>{
    if(skip)sessionStorage.setItem("budai:cinematic-intro:v1","1");
    localStorage.setItem("budai-cookies","declined");sessionStorage.setItem("budai-buddy-popup-dismissed","true");sessionStorage.setItem("budai-end-toast","1");
  },skip);
}
async function dive(page:Page,p:number){
  await page.locator("#signal").evaluate((el,p)=>scrollTo({top:el.getBoundingClientRect().top+scrollY+(el.clientHeight-innerHeight)*p,behavior:"instant" as ScrollBehavior}),p);
  await page.waitForTimeout(400);
}

test("the only opening really enters the cortex, forms Confluence, then keeps the same pose/canvas on landing",async({page})=>{
  await quiet(page,false);
  await page.addInitScript(()=>{
    window.__openingPoses=[];
    new MutationObserver(()=>{
      const el=document.querySelector<HTMLCanvasElement>("[data-brain-canvas]");
      if(!el?.dataset.cameraZ)return;
      window.__openingPoses.push({z:Number(el.dataset.cameraZ),identity:Number(el.dataset.identityMorph),phase:document.documentElement.dataset.budaiIntro??"",sequence:el.dataset.sequence??"",brains:document.querySelectorAll("[data-brain-canvas]").length,loaders:document.querySelectorAll("[data-global-loader]").length});
    }).observe(document,{subtree:true,childList:true,attributes:true,attributeFilter:["data-camera-z","data-budai-intro"]});
  });
  await page.goto("/");
  const brain=page.locator("[data-brain-canvas]");
  await expect(brain).toHaveAttribute("data-rendered","true");
  const canvas=await brain.elementHandle();
  await expect(page.locator("html")).toHaveAttribute("data-budai-intro","done");
  await expect(brain).toHaveAttribute("data-sequence","hero");
  const poses=await page.evaluate(()=>window.__openingPoses),opening=poses.filter(p=>p.sequence==="intro");
  expect(opening.some(p=>p.z<.8&&p.z>-.8&&p.identity<.5)).toBe(true);
  expect(opening.some(p=>p.z<-1&&p.identity>.95)).toBe(true);
  expect(Math.max(...poses.map(p=>p.brains))).toBe(1);expect(Math.max(...poses.map(p=>p.loaders))).toBe(1);
  expect(Number(await brain.getAttribute("data-camera-z"))).toBeCloseTo(opening.at(-1)!.z,3);
  await expect(brain).toHaveAttribute("data-identity-morph","1.0000");
  expect(await canvas!.evaluate(el=>el.isConnected)).toBe(true);
  await page.screenshot({path:"test-results/confluence-landing-desktop.png"});
  await test.info().attach("actual-opening-camera",{body:JSON.stringify(poses),contentType:"application/json"});
});

for(const viewport of [{width:1440,height:1000},{width:834,height:1112},{width:390,height:844}])test(`real Playground arrival ${viewport.width}: one projected DOM surface, matched spatial frame, reversible, editable and expandable`,async({page})=>{
  await page.setViewportSize(viewport);await quiet(page);
  const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));page.on("console",m=>{if(m.type()==="error")errors.push(m.text());});
  await page.goto("/");
  const brain=page.locator("[data-brain-canvas]"),surface=page.locator("[data-playground-surface]"),anchor=page.locator("[data-playground-arrival]");
  await expect(brain).toHaveAttribute("data-rendered","true");
  await expect(page.locator("#signal")).toHaveAttribute("data-original-source","43f44c9");
  await expect(page.locator("[data-original-stage]")).toHaveCount(4);
  const input=page.getByRole("textbox",{name:"Message BudAI",exact:true}),sameInput=await input.elementHandle();
  const widths:number[]=[];
  for(const p of [.78,.86,.94]){
    await dive(page,p);
    await expect.poll(async()=>Math.abs(Number((await brain.getAttribute("data-portal-bounds"))?.split(",")[1])-((await surface.boundingBox())?.y??0))).toBeLessThan(2);
    const box=(await surface.boundingBox())!;widths.push(box.width);
    const projection=await brain.evaluate(el=>{
      const c=el.getBoundingClientRect(),m=el.getAttribute("data-portal-matrix")!.split(",").map(Number),w=el.getAttribute("data-portal-world")!.split(",").map(Number);
      return Array.from({length:4},(_,i)=>{
        const [x,y,z]=w.slice(i*3,i*3+3),cw=m[3]*x+m[7]*y+m[11]*z+m[15];
        return {x:c.left+((m[0]*x+m[4]*y+m[8]*z+m[12])/cw*.5+.5)*c.width,y:c.top+(.5-(m[1]*x+m[5]*y+m[9]*z+m[13])/cw*.5)*c.height};
      });
    });
    expect(projection[0].x).toBeCloseTo(box.x-5,0);expect(projection[0].y).toBeCloseTo(box.y-5,0);
    expect(projection[2].x).toBeCloseTo(box.x+box.width+5,0);expect(projection[2].y).toBeCloseTo(box.y+box.height+5,0);
    await expect(surface).toHaveCount(1);await expect(page.locator("[data-global-loader]")).toHaveCount(0);
    await page.screenshot({path:`test-results/playground-arrival-${viewport.width}-${p}.png`});
  }
  expect(widths[1]).toBeGreaterThan(widths[0]);expect(widths[2]).toBeGreaterThan(widths[1]);
  const pose=await brain.getAttribute("data-camera-pose");
  await dive(page,.86);await dive(page,.94);await expect(brain).toHaveAttribute("data-camera-pose",pose!);
  await dive(page,1);await expect(anchor).toHaveAttribute("data-arrival","1.0000");
  await expect(page.locator(".playground-plane")).toHaveCSS("transform","none");
  expect(await sameInput!.evaluate(el=>el.isConnected)).toBe(true);
  await input.fill("Keep this real input while changing the camera view.");
  await expect(page.getByRole("button",{name:"Send message",exact:true})).toBeEnabled();
  await page.getByRole("button",{name:"Expand Playground",exact:true}).click();
  await expect(anchor).toHaveAttribute("data-expanded","true");
  const expanded=(await surface.boundingBox())!;
  expect(expanded.x).toBeLessThanOrEqual(13);expect(expanded.y).toBeLessThanOrEqual(13);
  expect(expanded.width).toBeGreaterThan(viewport.width-27);
  await expect(input).toHaveValue("Keep this real input while changing the camera view.");
  await page.getByRole("button",{name:"Minimize Playground",exact:true}).click();
  await expect(anchor).toHaveAttribute("data-expanded","false");
  expect(errors).toEqual([]);
});

test("Confluence contains a real travelling signal and pauses on reduced motion without another logo canvas",async({page})=>{
  await quiet(page);await page.goto("/");
  const mark=page.locator(".site-navigation [data-budai-mark=confluence]");
  await expect(mark).toHaveAttribute("data-mark-motion","running");
  const offsets=await mark.locator(".confluence-trace").first().evaluate(el=>{
    const animation=el.getAnimations()[0];animation.pause();animation.currentTime=1200;const a=getComputedStyle(el).strokeDashoffset;
    animation.currentTime=2100;const b=getComputedStyle(el).strokeDashoffset;animation.play();return [a,b];
  });
  expect(offsets[0]).not.toBe(offsets[1]);
  await expect(page.locator("footer [data-budai-mark=confluence]").first()).toHaveAttribute("data-mark-motion","paused");
  await page.emulateMedia({reducedMotion:"reduce"});await expect(mark).toHaveAttribute("data-mark-motion","paused");
  await expect(mark.locator(".confluence-signal")).toHaveCSS("display","none");
  await expect(page.locator("[data-brain-canvas],[data-world-canvas]")).toHaveCount(0);
  await page.emulateMedia({reducedMotion:"no-preference"});await expect(mark).toHaveAttribute("data-mark-motion","running");
  await expect(page.locator("[data-brain-canvas]")).toHaveCount(1);await expect(page.locator("[data-global-loader]")).toHaveCount(0);
});
