import * as THREE from "three";
import type {InformationPoint} from "./information-patterns";

/** Shared light vocabulary: very small, stable samples with depth, not a cloud
 * of glowing spheres. One buffer/program, no private RAF or animation controller.
 */
export function createPointField(records:InformationPoint[],size=3.0){
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute("position",new THREE.Float32BufferAttribute(records.flatMap(p=>[p.x,p.y,p.z]),3));
  geometry.setAttribute("aLane",new THREE.Float32BufferAttribute(records.map(p=>p.lane),1));
  const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,toneMapped:false,
    uniforms:{uSize:{value:size},uPixelRatio:{value:1},uFocus:{value:-1},uOpacity:{value:1}},
    vertexShader:`attribute float aLane;uniform float uSize;uniform float uPixelRatio;uniform float uFocus;varying float vWeight;
      void main(){vWeight=uFocus<-.5||aLane<-.5?1.0:abs(aLane-uFocus)<.1?1.0:.45;vec4 p=modelViewMatrix*vec4(position,1.0);gl_Position=projectionMatrix*p;gl_PointSize=uSize*uPixelRatio*(.9+.1*vWeight);}`,
    fragmentShader:`uniform float uOpacity;varying float vWeight;void main(){vec2 p=gl_PointCoord*2.0-1.0;float r=dot(p,p);if(r>1.0)discard;float a=exp(-r*1.8)*uOpacity*vWeight;gl_FragColor=vec4(vec3(.74,.86,.89),a);}`,
  });
  return new THREE.Points(geometry,material);
}
