import {test,expect,type Page} from "@playwright/test";
declare global{interface Window{__outroDraws:number;}}
async function quiet(page:Page){await page.addInitScript(()=>{sessionStorage.setItem("budai:cinematic-intro:v1","1");localStorage.setItem("budai-cookies","declined");sessionStorage.setItem("budai-buddy-popup-dismissed","true");sessionStorage.setItem("budai-end-toast","1");});}
for(const width of[1440,390])test(`the signal continues ${width}: same roadmap, calm reversible retreat, settled GPU and usable footer`,async({page})=>{
  await page.setViewportSize({width,height:width===1440?1000:844});await quiet(page);
  const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
  await page.addInitScript(()=>{
    window.__outroDraws=0;const prototype=WebGL2RenderingContext.prototype,arrays=prototype.drawArrays,elements=prototype.drawElements;
    prototype.drawArrays=function(this:WebGL2RenderingContext,...args:Parameters<typeof arrays>){if((this.canvas as HTMLCanvasElement).hasAttribute("data-world-canvas"))window.__outroDraws++;return arrays.apply(this,args);};
    prototype.drawElements=function(this:WebGL2RenderingContext,...args:Parameters<typeof elements>){if((this.canvas as HTMLCanvasElement).hasAttribute("data-world-canvas"))window.__outroDraws++;return elements.apply(this,args);};
  });
  await page.goto("/#roadmap");await expect(page.locator("[data-world-canvas]")).toHaveCount(1);
  const canvas=page.locator("[data-world-canvas]");
  const move=async(p:number)=>{
    await page.locator("#continuation").evaluate((el,p)=>{
      const top=el.getBoundingClientRect().top+scrollY,start=top-innerHeight*.8,end=Math.min(top,document.documentElement.scrollHeight-innerHeight);
      scrollTo({top:start+(end-start)*p,behavior:"instant" as ScrollBehavior});
    },p);await page.waitForTimeout(400);
  };
  const cameras:string[]=[];
  for(const p of[.15,.55,1]){await move(p);cameras.push((await canvas.getAttribute("data-camera"))!);await page.screenshot({path:`test-results/signal-outro-${width}-${p}.png`});}
  expect(new Set(cameras).size).toBe(3);await expect(canvas).toHaveAttribute("data-outro-state","settled");
  await expect(page.locator(".roadmap-milestone")).toHaveCount(4);
  await expect(page.locator("[data-global-loader],[data-brain-canvas]")).toHaveCount(0);
  await expect(page.locator("#continuation").getByRole("heading",{name:"Continue the conversation.",exact:true})).toBeVisible();
  const stopped=await page.evaluate(()=>window.__outroDraws);await page.waitForTimeout(600);expect(await page.evaluate(()=>window.__outroDraws)).toBe(stopped);
  await move(.55);await expect(canvas).toHaveAttribute("data-camera",cameras[1]);
  await page.locator("#continuation").getByRole("link",{name:"Privacy Policy",exact:true}).click();
  await expect(page.getByRole("dialog",{name:"Privacy Policy",exact:true})).toBeVisible();await page.getByRole("dialog",{name:"Privacy Policy",exact:true}).getByRole("button",{name:"Close",exact:true}).click();
  await page.locator("#continuation").getByRole("link",{name:"Back to Playground",exact:true}).click();
  await expect(page).toHaveURL(/#playground/);await expect(page.getByRole("textbox",{name:"Message BudAI",exact:true})).toBeEnabled();
  expect(errors).toEqual([]);
});

test("reduced-motion ending is immediately readable and every existing footer destination remains",async({page})=>{
  await page.emulateMedia({reducedMotion:"reduce"});await quiet(page);await page.goto("/#continuation");
  const footer=page.locator("#continuation");await expect(footer.getByRole("heading",{name:"Continue the conversation.",exact:true})).toBeVisible();
  await expect(footer.getByRole("link",{name:"Privacy Policy",exact:true})).toBeVisible();await expect(footer.getByRole("link",{name:"Terms of Service",exact:true})).toBeVisible();
  await expect(footer.locator("p").filter({hasText:"Developed by"}).getByRole("link",{name:"Stilledev",exact:true})).toBeVisible();
  await expect(footer.locator("p").filter({hasText:"Developed by"})).toHaveCount(1);await expect(page.locator("canvas")).toHaveCount(0);
});
