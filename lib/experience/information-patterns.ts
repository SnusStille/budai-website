/** Original, deliberately sparse records. Coordinates describe actual capability
 * concepts, not fake live data, quota counts, random particles or decorative tubes.
 */
export type InformationPoint={x:number;y:number;z:number;lane:number};
export function capabilityRecords():InformationPoint[]{
  const points:InformationPoint[]=[];
  const put=(lane:number,x:number,y:number,z=0)=>points.push({x,y:y+(2.5-lane)*.72,z,lane});
  for(let i=0;i<6;i++){
    put(i,-1.05,0);put(i,-.72,0);put(i,-.42,0);
    if(i===0)for(let row=0;row<3;row++)for(let k=0;k<7-row;k++)put(i,.05+k*.17,.17-row*.17); // text lines
    if(i===1)for(let k=0;k<5;k++){put(i,.05+k*.22,.2-k*.10);put(i,.1+k*.22,.2-k*.10,.13);} // repeatable steps
    if(i===2)for(const y of[-.2,0,.2]){put(i,.12,0);put(i,.55,y*.6);put(i,1.0,y);} // compare / choose
    if(i===3)for(let k=0;k<7;k++){put(i,k*.17,.13);put(i,k*.17,-.13,.12);} // paired language rows
    if(i===4)for(let column=0;column<4;column++)for(let row=0;row<3;row++)put(i,column*.28,row*.14-.14,-column*.06); // retained ordered sets
    if(i===5){for(const [x,y]of[[0,-.15],[.15,-.15],[.3,-.15],[0,0],[.3,0],[0,.15],[.15,.15],[.3,.15]])put(i,x,y);for(let k=0;k<5;k++){const h=.05+.13*Math.sin(k/4*Math.PI);put(i,.55+k*.12,-h);put(i,.55+k*.12,h);}} // image aperture / waveform
  }
  return points;
}
