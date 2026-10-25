import * as THREE from "three";
import {createPointField} from "./information-field";
import {capabilityRecords} from "./information-patterns";
import {clamp,lerp,smooth} from "./timeline";

/** A single information register organises six real capabilities. No cable
 * network, manufactured machine, logo sculpture, doors or orbiting cards.
 */
export function createCapabilityEngine(parent:THREE.Group){
  const root=new THREE.Group();root.position.y=1.4;parent.add(root);
  const assembly=new THREE.Group();root.add(assembly);
  const records=capabilityRecords();
  const field=createPointField(records,3.3);assembly.add(field);
  const linePositions:number[]=[];
  for(let i=0;i<6;i++){const y=(2.5-i)*.72;linePositions.push(-1.05,y,0,-.42,y,0);}
  const guides=new THREE.LineSegments(new THREE.BufferGeometry().setAttribute("position",new THREE.Float32BufferAttribute(linePositions,3)),new THREE.LineBasicMaterial({color:"#7297a4",transparent:true,opacity:.17}));assembly.add(guides);
  const pulse=createPointField([{x:-1.05,y:1.8,z:.04,lane:-1}],4.8);assembly.add(pulse);
  // Same records in every access level. No visual implication that Basic loses
  // capabilities; only the real DOM plan data describes limits/availability.
  const access=new THREE.Group();root.add(access);
  for(let i=0;i<3;i++){
    const band=createPointField(records.map(p=>({x:(i-1)*3.3+p.x*.6,y:p.y*.62,z:p.z-.2*i,lane:p.lane})),3.0);
    band.material.uniforms.uOpacity.value=i===0?.8:.45;access.add(band);
  }
  return {root,update(progress:number,focus:number,morph:number){
    const m=smooth(morph);
    assembly.visible=m<.999;access.visible=m>.001;
    assembly.scale.setScalar(lerp(1,.8,m));assembly.position.z=-m*.6;assembly.rotation.y=lerp(-.14,0,smooth(progress));
    field.material.uniforms.uOpacity.value=1-m;field.material.uniforms.uFocus.value=focus;
    (guides.material as THREE.LineBasicMaterial).opacity=.17*(1-m);
    pulse.material.uniforms.uOpacity.value=.9*(1-m);
    const y=(2.5-Math.max(0,focus))*.72;
    pulse.position.y=y-1.8;
    pulse.position.x=lerp(0,.62,smooth(clamp(progress*6-Math.max(0,focus))));
    access.scale.setScalar(lerp(.8,1,m));
    access.children.forEach((object,i)=>(object as typeof field).material.uniforms.uOpacity.value=(i===0?.8:.45)*m);
    return m;
  }};
}
