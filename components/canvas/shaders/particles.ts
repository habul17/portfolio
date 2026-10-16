import { noiseGLSL } from "./noise";

export const SHAPE_COUNT = 6;

/** Velocity pass: springs towards the morph target, plus turbulence, pointer and shockwave forces. */
export const velocityShader = /* glsl */ `
#define SHAPES ${SHAPE_COUNT}.0
uniform float uTime;
uniform float uDelta;
uniform float uStage;
uniform float uIntro;
uniform float uSpring;
uniform float uDamping;
uniform float uNoise;
uniform float uScrollWind;
uniform sampler2D uTargets;
uniform vec3 uScale[${SHAPE_COUNT}];
uniform vec3 uOffset[${SHAPE_COUNT}];
uniform vec3 uPointer;
uniform vec3 uPointerVel;
uniform float uPointerRadius;
uniform float uPointerForce;
uniform vec4 uBurst;

${noiseGLSL}

mat3 rotX(float a) { float c = cos(a), s = sin(a); return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c); }
mat3 rotY(float a) { float c = cos(a), s = sin(a); return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c); }
mat3 rotZ(float a) { float c = cos(a), s = sin(a); return mat3(c, s, 0.0, -s, c, 0.0, 0.0, 0.0, 1.0); }

vec3 shapePos(int i, vec2 uv) {
  vec3 p = texture2D(uTargets, vec2(uv.x, (uv.y + float(i)) / SHAPES)).xyz;
  float t = uTime;
  if (i == 0) {
    // core: slow spin with a breathing surface
    p = rotY(t * 0.12) * rotX(0.35) * p;
    p *= 1.0 + snoise(p * 1.6 + vec3(0.0, t * 0.25, 0.0)) * 0.07;
  } else if (i == 1) {
    // name: a soft ripple running through the letters
    p.z += sin(p.x * 2.6 + t * 1.1) * 0.05 + sin(p.y * 4.0 + t * 0.7) * 0.03;
  } else if (i == 2) {
    // terrain: rolling waves
    p.y += sin(p.x * 3.2 + t * 0.7) * 0.11 + sin(p.z * 4.1 - t * 0.55) * 0.09;
    p.y += snoise(vec3(p.x * 1.6, p.z * 1.6, t * 0.18)) * 0.12;
  } else if (i == 3) {
    // lattice: tumbling slowly on two axes
    p = rotY(t * 0.22 + 0.6) * rotX(t * 0.13 + 0.45) * p;
  } else if (i == 4) {
    // helix
    p = rotY(t * 0.4) * p;
  } else {
    // galaxy: inner stars orbit faster than outer ones
    float r = length(p.xz);
    p = rotY(t * 0.16 / (0.22 + r)) * p;
    p = rotZ(0.32) * rotX(1.08) * p;
  }
  return p * uScale[i] + uOffset[i];
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 posData = texture2D(tPosition, uv);
  vec3 pos = posData.xyz;
  float seed = posData.w;
  vec3 vel = texture2D(tVelocity, uv).xyz;

  float stage = clamp(uStage, 0.0, SHAPES - 1.0);
  float s0 = floor(stage);
  float s1 = min(s0 + 1.0, SHAPES - 1.0);
  float f = stage - s0;
  float k = clamp((f - seed * 0.4) / 0.6, 0.0, 1.0);
  k = k * k * (3.0 - 2.0 * k);
  vec3 target = mix(shapePos(int(s0), uv), shapePos(int(s1), uv), k);

  // Intro: everything is born in a dense core and blooms outward.
  float intro = clamp(uIntro * 1.2 - seed * 0.2, 0.0, 1.0);
  target *= mix(0.015, 1.0, intro);

  vec3 acc = (target - pos) * uSpring;

  float transit = sin(3.14159265 * k);
  float turbulence = uNoise + transit * 2.6 + (1.0 - intro) * 3.5;
  acc += curlNoise(pos * 0.42 + vec3(seed * 0.3, uTime * 0.07, 0.0)) * turbulence;

  // Pointer: push away inside a radius and drag along with the motion.
  vec3 dp = pos - uPointer;
  float infl = 1.0 - smoothstep(0.0, uPointerRadius, length(dp.xy));
  infl *= infl;
  acc += normalize(vec3(dp.xy, dp.z * 0.35) + vec3(0.0, 0.0, 1e-4)) * infl * uPointerForce;
  acc += uPointerVel * infl * 2.2;

  // Click shockwave: an expanding ring that kicks particles outward.
  if (uBurst.w >= 0.0 && uBurst.w < 1.6) {
    vec3 db = pos - uBurst.xyz;
    float dist = length(db);
    float band = exp(-pow((dist - uBurst.w * 7.5) * 1.6, 2.0));
    acc += normalize(db + 1e-4) * band * 55.0 * (1.0 - uBurst.w / 1.6);
  }

  acc.y += uScrollWind * (0.35 + seed * 0.65);

  vel += acc * uDelta;
  vel *= pow(uDamping, uDelta * 60.0);
  gl_FragColor = vec4(vel, 1.0);
}
`;

export const positionShader = /* glsl */ `
uniform float uDelta;
void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 p = texture2D(tPosition, uv);
  p.xyz += texture2D(tVelocity, uv).xyz * uDelta;
  gl_FragColor = p;
}
`;

export const pointsVertex = /* glsl */ `
uniform sampler2D uPositions;
uniform sampler2D uVelocities;
uniform float uSize;
uniform float uPixelRatio;
uniform float uTime;
uniform float uOpacity;
uniform vec3 uAccent;
attribute vec2 aRef;
attribute vec3 aColor;
attribute float aSeed;
varying vec3 vColor;
varying float vAlpha;

void main() {
  vec3 pos = texture2D(uPositions, aRef).xyz;
  vec3 vel = texture2D(uVelocities, aRef).xyz;
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;

  // Fast particles (scattered by the pointer, mid-morph) flare towards the accent.
  float energy = smoothstep(1.5, 7.0, length(vel));
  float size = uSize * mix(0.55, 1.45, aSeed * aSeed) * (1.0 + energy * 0.4);
  gl_PointSize = max(1.0, size * uPixelRatio / -mv.z);

  float depth = smoothstep(18.0, 5.0, -mv.z);
  float twinkle = 0.78 + 0.22 * sin(uTime * (0.8 + aSeed * 2.4) + aSeed * 40.0);
  vColor = mix(aColor, uAccent, energy * 0.55);
  vAlpha = uOpacity * twinkle * mix(0.3, 1.0, depth) * (1.0 + energy * 0.35);
}
`;

export const pointsFragment = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;

void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float a = pow(smoothstep(0.5, 0.0, d), 1.8);
  gl_FragColor = vec4(vColor * a * vAlpha, 1.0);
  #include <colorspace_fragment>
}
`;
