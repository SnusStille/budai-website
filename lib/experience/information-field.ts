import * as THREE from "three";
import type { InformationPoint } from "./information-patterns";

/**
 * Shared GPU point field for structured intelligence constellations.
 * Crisp, high-contrast luminous samples with active-lane focus intensification.
 */
export function createPointField(records: InformationPoint[], size = 3.8) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(records.flatMap(p => [p.x, p.y, p.z]), 3)
  );
  geometry.setAttribute(
    "aLane",
    new THREE.Float32BufferAttribute(records.map(p => p.lane), 1)
  );
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    toneMapped: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uSize: { value: size },
      uPixelRatio: { value: 1 },
      uFocus: { value: -1 },
      uOpacity: { value: 1 },
    },
    vertexShader: `attribute float aLane;uniform float uSize;uniform float uPixelRatio;uniform float uFocus;varying float vWeight;
      void main(){vWeight=uFocus<-.5||aLane<-.5?1.0:abs(aLane-uFocus)<.1?1.35:.48;vec4 p=modelViewMatrix*vec4(position,1.0);gl_Position=projectionMatrix*p;gl_PointSize=uSize*uPixelRatio*(.92+.22*vWeight);}`,
    fragmentShader: `uniform float uOpacity;varying float vWeight;void main(){vec2 p=gl_PointCoord*2.0-1.0;float r=dot(p,p);if(r>1.0)discard;float a=exp(-r*1.75)*uOpacity*min(1.0,vWeight);vec3 col=mix(vec3(.68,.88,.94),vec3(.90,.99,1.0),clamp(vWeight-1.0,0.0,1.0));gl_FragColor=vec4(col,a);}`,
  });
  return new THREE.Points(geometry, material);
}
