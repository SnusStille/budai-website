import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { identityVolume } from "./identity-volume";
import { clamp, lerp, smooth } from "./timeline";

/** Confluence manifold: one manufactured intelligence cell, six routed physical
 * instruments. Flat bonded waveguides, never random tubes or orbiting UI cards.
 */
export function createCapabilityEngine(parent:THREE.Group) {
  const root=new THREE.Group();root.position.y=1.4;parent.add(root);
  const assembly=new THREE.Group();assembly.rotation.set(.07,-.36,-.02);assembly.position.x=-.18;root.add(assembly);
  const alloy=new THREE.MeshStandardMaterial({color:"#253e49",roughness:.34,metalness:.58});
  const black=new THREE.MeshStandardMaterial({color:"#101c25",roughness:.48,metalness:.35});
  const silver=new THREE.MeshStandardMaterial({color:"#a6c1c7",roughness:.27,metalness:.5});
  const signal=new THREE.MeshBasicMaterial({color:"#b6dce0"});
  const amber=new THREE.MeshBasicMaterial({color:"#b9aa90"});
  const cache=new Map<string,THREE.BufferGeometry>();
  const box=(group:THREE.Group,w:number,h:number,d:number,x:number,y:number,z:number,material:THREE.Material,round=false)=>{
    const key=`${w},${h},${d},${round}`;
    let geometry=cache.get(key);
    if(!geometry){geometry=round?new RoundedBoxGeometry(w,h,d,2,.035):new THREE.BoxGeometry(w,h,d);cache.set(key,geometry);}
    const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);group.add(mesh);return mesh;
  };
  box(assembly,4.2,.18,2.1,0,-3.0,.1,alloy,true);
  box(assembly,3.9,5.7,.13,0,0,-.42,black,true);
  for(const x of [-2,2])box(assembly,.055,5.5,.15,x,0,-.26,silver);
  for(let i=0;i<8;i++)box(assembly,.15,.018,.04,-1.83,-2.45+i*.7,-.15,silver);

  // The exact same brand geometry as the opening, manufactured here as the core.
  const packed=identityVolume(),positions:number[]=[],normals:number[]=[];
  for(let i=0;i<packed.length;i+=6){positions.push(packed[i],packed[i+1],packed[i+2]+6.25);normals.push(packed[i+3],packed[i+4],packed[i+5]);}
  const coreGeometry=new THREE.BufferGeometry();coreGeometry.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));coreGeometry.setAttribute("normal",new THREE.Float32BufferAttribute(normals,3));
  const coreMaterial=new THREE.MeshStandardMaterial({color:"#b4ced1",metalness:.48,roughness:.3,emissive:"#99c8ce",emissiveIntensity:.045});
  const core=new THREE.Mesh(coreGeometry,coreMaterial);core.scale.setScalar(.75);core.position.set(-.96,0,.22);assembly.add(core);
  box(assembly,.035,4.9,.1,-.96,0,-.05,alloy);

  const instruments:THREE.Group[]=[],curves:THREE.CubicBezierCurve3[]=[],traces:THREE.MeshBasicMaterial[]=[],packets:THREE.Mesh[]=[];
  const ends:[[number,number],[number,number],[number,number],[number,number],[number,number],[number,number]]=[[1.1,2.3],[1.5,1.4],[1.7,.46],[1.7,-.46],[1.5,-1.4],[1.1,-2.3]];
  function ribbon(curve:THREE.Curve<THREE.Vector3>,width:number,z:number,material:THREE.Material){
    const v:number[]=[];
    for(let i=0;i<24;i++) {
      const a=curve.getPoint(i/24),b=curve.getPoint((i+1)/24),t=curve.getTangent((i+.5)/24),n=new THREE.Vector3(-t.y,t.x,0).multiplyScalar(width/2);
      const points=[a.clone().add(n),a.clone().sub(n),b.clone().sub(n),a.clone().add(n),b.clone().sub(n),b.clone().add(n)];
      points.forEach(p=>v.push(p.x,p.y,z));
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute("position",new THREE.Float32BufferAttribute(v,3));geometry.computeVertexNormals();
    const mesh=new THREE.Mesh(geometry,material);assembly.add(mesh);return mesh;
  }
  ends.forEach(([x,y],i)=>{
    const curve=new THREE.CubicBezierCurve3(new THREE.Vector3(-.96,0,.31),new THREE.Vector3(-.08,y*.1,.31),new THREE.Vector3(.05,y,.31),new THREE.Vector3(x-.2,y,.31));curves.push(curve);
    ribbon(curve,.095,.02,alloy);
    const trace=new THREE.MeshBasicMaterial({color:"#8dbbc3",transparent:true,opacity:.3,side:THREE.DoubleSide});traces.push(trace);ribbon(curve,.018,.11,trace);
    const packet=box(assembly,.045,.045,.055,-.96,0,.16,signal,true);packets.push(packet);
    const tool=new THREE.Group();tool.position.set(x,y,.34);instruments.push(tool);assembly.add(tool);
    // A cradle and connection pin physically attach every instrument to its route.
    box(tool,.72,.055,.55,.03,-.29,-.1,alloy,true);box(tool,.08,.3,.08,-.2,-.1,-.1,silver);
    if(i===0){
      for(let k=0;k<3;k++)box(tool,.62,.36,.025,k*.035,k*.045,.05-k*.07,silver,true);
      for(let k=0;k<3;k++)box(tool,.36-k*.06,.016,.015,-.035,.12-k*.085,.085,black);
    }else if(i===1){
      for(let k=0;k<3;k++){box(tool,.18,.18,.18,-.22+k*.24,k%2?.08:-.08,0,k===1?amber:silver,true);if(k<2)box(tool,.12,.025,.03,-.1+k*.24,0,.02,signal);}
    }else if(i===2){
      for(let k=0;k<3;k++){const fork=new THREE.Mesh(new THREE.ConeGeometry(.13,.25,3),k===1?amber:silver);fork.rotation.z=-Math.PI/2;fork.position.set(.04,k*.21-.21,0);tool.add(fork);box(tool,.18,.025,.04,-.16,k*.21-.21,-.02,alloy);}
    }else if(i===3){
      box(tool,.53,.13,.17,-.02,.12,0,silver,true);box(tool,.53,.13,.17,.12,-.12,-.05,amber,true);box(tool,.08,.32,.05,.3,0,.01,signal);
    }else if(i===4){
      for(let k=0;k<5;k++)box(tool,.07,.4,.36,-.22+k*.125,k%2?.025:0,0,k===3?amber:silver,true);
    }else{
      const aperture=new THREE.Mesh(new THREE.TorusGeometry(.17,.042,8,32),silver);aperture.position.set(-.12,.02,.02);tool.add(aperture);
      for(let k=0;k<5;k++)box(tool,.023,.06+Math.sin(k/4*Math.PI)*.25,.06,.2+k*.07,0,.04,signal);
    }
  });
  const access = new THREE.Group(); root.add(access);
  for (let i = 0; i < 3; i++) {
    const gate = new THREE.Group(); gate.position.set((i - 1) * 3.5, -.25, i === 1 ? -.4 : 0); access.add(gate);
    box(gate, 2.7, .18, 2.5, 0, -1.45, 0, alloy, true);
    for (let depth = 0; depth <= i; depth++) {
      const z = .7 - depth * .6;
      for (const x of [-1.05, 1.05]) box(gate, .13, 2.6, .13, x, -.08, z, silver, true);
      box(gate, 2.2, .13, .13, 0, 1.2, z, silver, true);
    }
    // Every access level contains the SAME six capabilities. Only access expands.
    for (let j = 0; j < 6; j++) box(gate, .75, .06, .08, 0, -.35 + j * .14, .71, i === 0 ? signal : silver);
    box(gate, .1, .1, .1, -.82, 1.2, .8, i === 0 ? signal : amber, true);
  }
  return {root,update(progress:number,focus:number,morph:number,time=0){
    const m=smooth(morph);assembly.visible=m<.999;assembly.scale.setScalar(lerp(1,.025,m));assembly.position.y=lerp(0,-.8,m);
    access.visible=m>.001;access.scale.setScalar(lerp(.025,1,m));access.rotation.y=lerp(-.3,-.08,m);
    instruments.forEach((instrument,i)=>{
      const active=focus===i,formed=smooth(clamp(progress*6-i+1));
      instrument.position.set(ends[i][0],ends[i][1],.34+(active?.12:0));
      instrument.scale.setScalar(.78+.22*formed);
      traces[i].opacity=active?.95:.2;
      const travel=active?(time*.22+i*.08)%1:clamp(progress*6-i);
      packets[i].position.copy(curves[i].getPoint(travel));packets[i].position.z=.16;packets[i].visible=active;
    });
    coreMaterial.emissiveIntensity=.045+.055*smooth(progress);
    return m;
  }};
}
