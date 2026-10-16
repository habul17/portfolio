export const imageVertex = /* glsl */ `
uniform vec2 uVelocity;
uniform vec2 uSize;
varying vec2 vUv;

void main() {
  vUv = uv;
  vec3 p = position;
  // The middle of the plane lags behind its edges while it moves.
  p.x -= sin(uv.y * 3.14159265) * uVelocity.x * 1.5 / uSize.x;
  p.y += sin(uv.x * 3.14159265) * uVelocity.y * 1.5 / uSize.y;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`;

export const imageFragment = /* glsl */ `
uniform sampler2D uTexture;
uniform vec2 uSize;
uniform vec2 uImageSize;
uniform vec2 uMouse;
uniform vec2 uVelocity;
uniform float uHover;
uniform float uTime;
uniform float uReveal;
uniform float uRadius;
uniform float uParallax;
uniform float uParallaxAmount;
varying vec2 vUv;

float roundedBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

void main() {
  vec2 uv = vUv;

  // object-fit: cover
  float rs = uSize.x / uSize.y;
  float ri = uImageSize.x / uImageSize.y;
  vec2 fit = rs > ri ? vec2(1.0, ri / rs) : vec2(rs / ri, 1.0);
  vec2 cuv = (uv - 0.5) * fit;

  // Settle in on reveal, push in on hover, leave headroom for parallax.
  float zoom = mix(1.3, 1.0, uReveal) * (1.0 - 0.06 * uHover) * (1.0 - uParallaxAmount);
  cuv *= zoom;
  cuv.y += uParallax * uParallaxAmount * 0.5;
  cuv += 0.5;

  // Liquid ripple around the pointer.
  vec2 dm = (uv - uMouse) * vec2(rs, 1.0);
  float d = length(dm);
  cuv += normalize(dm + 1e-5) * sin(d * 26.0 - uTime * 5.0) * exp(-d * 4.5) * 0.007 * uHover;

  // Chromatic split along the direction of motion.
  vec2 shift = uVelocity / uSize * 0.4;
  vec4 base = texture2D(uTexture, cuv);
  float r = texture2D(uTexture, cuv + shift).r;
  float b = texture2D(uTexture, cuv - shift).b;
  vec3 color = vec3(r, base.g, b) * mix(0.9, 1.0, uHover);

  // Reveal: a soft, wavy wipe from the bottom up.
  float edge = uv.y + sin(uv.x * 8.0 + uTime * 1.4) * 0.018;
  float mask = smoothstep(uReveal * 1.12, uReveal * 1.12 - 0.12, edge);

  vec2 px = (uv - 0.5) * uSize;
  float corner = 1.0 - smoothstep(-0.75, 0.75, roundedBox(px, uSize * 0.5, uRadius));

  gl_FragColor = vec4(color, mask * corner);
}
`;
