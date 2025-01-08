var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/docs.ts
import { Terminal } from "https://cdn.jsdelivr.net/npm/@xterm/xterm@5.5.0/+esm";
import { WebglAddon } from "https://cdn.jsdelivr.net/npm/@xterm/addon-webgl@0.18.0/+esm";
import { FitAddon } from "https://cdn.jsdelivr.net/npm/@xterm/addon-fit@0.10.0/+esm";
import { WebLinksAddon } from "https://cdn.jsdelivr.net/npm/@xterm/addon-web-links@0.11.0/+esm";

// src/createCRTEffect.ts
import * as THREE from "three";
import { Effect, BlendFunction, CopyPass, BloomEffect } from "postprocessing";
import { EffectPass } from "postprocessing";
var defaultCRTOptions = {
  bloom: 2,
  // 0 ~ 5
  burnInTime: 0.4,
  jitter: 0.8,
  screenCurvature: 0.1,
  noise: 0.4,
  glowingLine: 0.75,
  flickering: 0.2,
  ambientLight: 0.5,
  pixelHeight: 6,
  pixelization: false,
  rgbSplit: 0.25,
  rgbSplitXDistance: 0.13,
  rgbSplitYDistance: 0.08,
  bazelSize: 0.4
};
function createCRTEffect({
  options,
  noiseTexture: noiseTexture2,
  userEffectPasses,
  glslEffects
}) {
  const saveTarget = new THREE.WebGLRenderTarget(
    window.innerWidth,
    window.innerHeight,
    { format: THREE.RGBAFormat, stencilBuffer: false }
  );
  const savePass = new CopyPass(saveTarget);
  const burnInTime = options.crt?.burnInTime ?? defaultCRTOptions.burnInTime;
  const bloom = options.crt?.bloom ?? defaultCRTOptions.bloom;
  const jitter = options.crt?.jitter ?? defaultCRTOptions.jitter;
  const screenCurvature = options.crt?.screenCurvature ?? defaultCRTOptions.screenCurvature;
  const noise = options.crt?.noise ?? defaultCRTOptions.noise;
  const glowingLine = options.crt?.glowingLine ?? defaultCRTOptions.glowingLine;
  const flickering = options.crt?.flickering ?? defaultCRTOptions.flickering;
  const ambientLight = options.crt?.ambientLight ?? defaultCRTOptions.ambientLight;
  const pixelHeight = options.crt?.pixelHeight ?? defaultCRTOptions.pixelHeight;
  const pixelization = options.crt?.pixelization ?? defaultCRTOptions.pixelization;
  const rgbSplit = options.crt?.rgbSplit ?? defaultCRTOptions.rgbSplit;
  const rgbSplitXDistance = options.crt?.rgbSplitXDistance ?? defaultCRTOptions.rgbSplitXDistance;
  const rgbSplitYDistance = options.crt?.rgbSplitYDistance ?? defaultCRTOptions.rgbSplitYDistance;
  const bazelSize = options.crt?.bazelSize ?? defaultCRTOptions.bazelSize;
  const burnInEffect = new Effect("burn-in", glslEffects.burnIn, {
    blendFunction: BlendFunction.NORMAL,
    uniforms: /* @__PURE__ */ new Map([
      ["burnInSource", new THREE.Uniform(saveTarget.texture)],
      ["burnInTime", new THREE.Uniform(burnInTime)]
    ])
  });
  const retroEffect = new Effect("retro", glslEffects.retro, {
    blendFunction: BlendFunction.NORMAL,
    uniforms: /* @__PURE__ */ new Map([
      ["fontColor", new THREE.Uniform(new THREE.Vector3(1, 1, 1))],
      ["chromaColor", new THREE.Uniform(2.5)],
      ["staticNoise", new THREE.Uniform(noise * 0.1)],
      ["noiseSource", new THREE.Uniform(1.01)],
      [
        "jitter",
        new THREE.Uniform(new THREE.Vector2(1e-3 * jitter, 1e-3 * jitter))
      ],
      ["glowingLine", new THREE.Uniform(glowingLine * 0.1)],
      ["flickering", new THREE.Uniform(flickering)],
      ["ambientLight", new THREE.Uniform(ambientLight * 1e-3)],
      ["pixelHeight", new THREE.Uniform(pixelHeight)],
      ["pixelization", new THREE.Uniform(pixelization)],
      ["rgbSplit", new THREE.Uniform(rgbSplit)],
      ["rgbSplitXDistance", new THREE.Uniform(rgbSplitXDistance * 0.01)],
      ["rgbSplitYDistance", new THREE.Uniform(rgbSplitYDistance * 0.01)]
    ])
  });
  const noiseSource = retroEffect.uniforms.get("noiseSource");
  if (noiseSource) noiseSource.value = noiseTexture2;
  const bloomEffect = new BloomEffect({
    kernelSize: bloom,
    blendFunction: BlendFunction.LIGHTEN
  });
  const frameEffect = new Effect("retro-frame", glslEffects.retroFrame, {
    blendFunction: BlendFunction.NORMAL,
    uniforms: /* @__PURE__ */ new Map([
      [
        "frameColor",
        new THREE.Uniform(new THREE.Vector3(25 / 255, 25 / 255, 25 / 255))
      ],
      ["screenCurvature", new THREE.Uniform(screenCurvature)],
      ["bazelSize", new THREE.Uniform(bazelSize)]
    ])
  });
  const scaleEffects = [
    new Effect("scale", glslEffects.scale, {
      defines: /* @__PURE__ */ new Map([["scale", "0.985"]])
    }),
    new Effect("sampling", glslEffects.sampling, {
      blendFunction: BlendFunction.NORMAL
    })
  ];
  return {
    passes: [
      new EffectPass(void 0, ...scaleEffects),
      new EffectPass(void 0, bloomEffect),
      ...burnInEffect ? [new EffectPass(void 0, burnInEffect)] : [],
      ...userEffectPasses,
      new EffectPass(void 0, retroEffect),
      savePass,
      ...screenCurvature ? [new EffectPass(void 0, frameEffect)] : []
    ],
    coordinateTransform(x, y) {
      const cx = x - 0.5;
      const cy = y - 0.5;
      const dist = (screenCurvature + 0.05) * (cx * cx + cy * cy);
      return [x + cx * (1 + dist) * dist, y + cy * (1 + dist) * dist];
    }
  };
}

// src/glsl/index.ts
var glsl_exports = {};
__export(glsl_exports, {
  burnIn: () => burn_in_default,
  retro: () => retro_default,
  retroFrame: () => retro_frame_default,
  sampling: () => sampling_default,
  scale: () => scale_default
});

// src/glsl/burn-in.glsl
var burn_in_default = "\nuniform lowp sampler2D burnInSource;\nuniform lowp float burnInTime;\n\nvoid mainImage(const in vec4 inputColor, const in vec2 coords, out vec4 fragColor) {\n    vec4 accColor = texture2D(burnInSource, coords) * (1. * burnInTime) - vec4(0.005);\n    fragColor = max(accColor, inputColor);\n}\n";

// src/glsl/retro.glsl
var retro_default = "// adapted from https://github.com/Swordfish90/cool-retro-term/blob/master/app/qml/ShaderTerminal.qml\n\nuniform highp vec3 fontColor;\nuniform highp vec3 backgroundColor;\nuniform lowp float chromaColor;\n\nuniform highp float staticNoise;\nuniform lowp sampler2D noiseSource;\n\nuniform lowp float horizontalSyncStrength;\nuniform lowp float horizontalSyncFrequency;\n\nuniform lowp vec2 jitter;\n\nuniform highp float glowingLine;\n\nuniform lowp float flickering;\nuniform lowp float ambientLight;\n\nuniform lowp float pixelHeight;\nuniform bool pixelization;\n\nuniform lowp float rgbSplit;\nuniform lowp float rgbSplitXDistance;\nuniform lowp float rgbSplitYDistance;\n\nfloat sum2(vec2 v) {\n	return v.x + v.y;\n}\n\nfloat rgb2grey(vec3 v){\n	float dp = dot(v, vec3(0.21, 0.72, 0.04));\n	return dp == 0.0 ? 0.00001 : dp;\n}\n\nfloat randomPass(vec2 coords) {\n	return fract(smoothstep(0.0, -120.0, coords.y - (resolution.y + 120.0) * fract(-time * 0.15)));\n}\n\nfloat getScanlineIntensity(vec2 coords) {\n	float result = 1.0;\n	float val = 0.0;\n	vec2 rasterizationCoords = fract(coords * resolution * 0.0365 * pixelHeight);\n	val += smoothstep(0.0, 0.5, rasterizationCoords.y);\n	val -= smoothstep(0.5, 2.0 * 0.5, rasterizationCoords.y);\n	result *= mix(0.3, 1.0, val);\n\n	if (pixelization) {\n		val = 0.0;\n		val += smoothstep(0.0, 0.5, rasterizationCoords.x);\n		val -= smoothstep(0.5, 2.0 * 0.5, rasterizationCoords.x);\n		result *= mix(0.4, 1.0, val);\n	}\n\n	return result;\n}\n\nvec4 texture(sampler2D buf, vec2 uv) {\n	if(!(uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0))\n		return texture2D(buf, uv);\n}\n\nfloat noise(vec2 uv) {\n	float limitedTime = mod(time, 10.0);\n  vec2 v = vec2(uv.x + limitedTime * 0.5, uv.y + sin(limitedTime) * 0.5);\n\n  return fract(sin(dot(v, vec2(12.9898, 78.233))) * 43758.5453);  \n}\n\nvoid mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 fragColor) {\n	vec2 initialCoords = vec2(fract(time/2.0), fract(time/PI));\n	vec4 initialNoiseTexel = texture2D(noiseSource, initialCoords);\n	float randval = initialNoiseTexel.r;\n	float distortionScale = step(1.0 - horizontalSyncFrequency, randval) * randval * horizontalSyncStrength * 0.1;\n	float distortionFreq = mix(4.0, 40.0, initialNoiseTexel.g);\n\n	vec2 coords = uv;\n\n	float dst = sin((coords.y + time) * distortionFreq);\n	coords.x += dst * distortionScale;\n\n	vec4 noiseTexel = texture2D(noiseSource, resolution / (vec2(512, 512) * 0.75) * coords + vec2(fract(time * 1000.0 / 51.0), fract(time * 1000.0 / 237.0)));\n\n	// jitter\n	vec2 offset = vec2(noiseTexel.b, noiseTexel.a) - vec2(0.5);\n	coords += offset * jitter;\n	coords = clamp(coords, 0.0, 1.0);\n  \n	float color = 0.0001;\n\n	// static noise\n	float distance = length(vec2(0.5) - uv);\n\n  vec2 scaledUv = uv * 10.0;\n  \n  float noiseValue = noise(scaledUv + noise(scaledUv.yx));\n\n  noiseValue += distortionScale * 3.0;\n  color += staticNoise * noiseValue * (1.0 - distance * 1.3);\n\n\n	// glowingLine\n	color += randomPass(uv * resolution) * glowingLine * 0.2;\n\n	vec3 txt_color = texture(inputBuffer, coords).rgb;\n\n	if (rgbSplit != 0.0) {\n		vec3 rightColor = texture2D(inputBuffer, coords + vec2(-rgbSplitXDistance, -rgbSplitYDistance)).rgb;\n		vec3 leftColor  = texture2D(inputBuffer, coords + vec2(rgbSplitXDistance, rgbSplitYDistance)).rgb;\n		txt_color.r = rightColor.r * 0.6 * rgbSplit + txt_color.r * (1.0 - 0.6 * rgbSplit);\n		txt_color.g =  leftColor.g * 0.4 * rgbSplit + txt_color.g * (1.0 - 0.4 * rgbSplit);\n		txt_color.b =  leftColor.b * 0.2 * rgbSplit + txt_color.b * (1.0 - 0.2 * rgbSplit);\n	}\n\n	float greyscale_color = rgb2grey(txt_color);\n	float reflectionMask = sum2(step(vec2(0.0), uv) - step(vec2(1.0), uv));\n	reflectionMask = clamp(reflectionMask, 0.0, 1.0);\n\n	vec3 foregroundColor = mix(fontColor, txt_color * fontColor / greyscale_color, chromaColor);\n	vec3 finalColor = mix(backgroundColor, foregroundColor, greyscale_color * reflectionMask);\n\n	finalColor += fontColor.rgb * vec3(color);\n\n	finalColor *= 1.0 + (initialNoiseTexel.g - 0.5) * flickering;\n	finalColor += vec3(ambientLight) * (1.0 - distance) * (1.0 - distance);\n\n	if (pixelHeight != 0.0)\n		finalColor *= getScanlineIntensity(coords);\n\n	fragColor = vec4(finalColor, 1.0);\n}\n";

// src/glsl/retro-frame.glsl
var retro_frame_default = "// adapted from https://github.com/Swordfish90/cool-retro-term/blob/master/app/qml/ShaderTerminal.qml\n\nuniform lowp float screenCurvature;\nuniform lowp vec3 frameColor;\nuniform lowp float bazelSize;\n\nvec2 distortCoordinates(vec2 coords){\n	vec2 cc = (coords - vec2(0.5, 0.5));\n	float dist = dot(cc, cc) * screenCurvature;\n	return (coords + cc * (1. + dist) * dist);\n}\n\nfloat max2(vec2 v) {\n	return max(v.x, v.y);\n}\n\nvec4 texture(sampler2D buf, vec2 uv) {\n	if(!(uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0))\n		return texture2D(buf, uv);\n\n	return vec4(0.0);\n}\n\nfloat roundSquare(vec2 p, vec2 b, float r) {\n	return length(max(abs(p)-b,0.0))-r;\n}\n\n// Calculate normal to distance function and move along\n// normal with distance to get point of reflection\nvec2 borderReflect(vec2 p)\n{\n	float r = 0.01;\n	float eps = 0.0001;\n	vec2 epsx = vec2(eps,0.0);\n	vec2 epsy = vec2(0.0,eps);\n	vec2 b = (0.999+vec2(r,r))* 0.5;\n	r /= 3.0;\n	\n	p -= 0.5;\n\n	vec2 normal = vec2(roundSquare(p-epsx,b,r)-roundSquare(p+epsx,b,r),\n					   roundSquare(p-epsy,b,r)-roundSquare(p+epsy,b,r))/eps;\n\n	if (max2(abs(p) - b) < 0.0 || abs(normal.x * normal.y) > 0.1)\n		return vec2(-1.0);\n\n	float d = roundSquare(p, b, r);\n	p += 0.5;\n\n	return p + d*normal;\n}\n\nvoid mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 fragColor) {\n	vec2 coords = distortCoordinates(uv);\n	vec3 color = texture(inputBuffer, coords).rgb;	// fragColor = vec4(color, 1.0);\n\n	float alpha = 0.0;\n	float outShadowLength = 0.65 * screenCurvature;\n	 \n	float XbazelMargin = bazelSize * 0.01;\n	float YbazelMargin = XbazelMargin * resolution.x / resolution.y;\n	float outShadow = max2(1.0 - smoothstep(vec2(-outShadowLength), vec2(-XbazelMargin, -YbazelMargin), coords) + smoothstep(vec2(1.0 + XbazelMargin, 1.0 + YbazelMargin), vec2(1.0 + outShadowLength), coords));\n	outShadow = clamp(sqrt(outShadow), 0.0, 1.0);\n	color += frameColor * outShadow;\n\n	vec2 reflected = borderReflect(coords);\n	color += max(texture(inputBuffer, reflected).rgb * 0.3 - 0.1, 0.0);\n	fragColor = vec4(color, 1.0);\n}\n";

// src/glsl/sampling.glsl
var sampling_default = '// if uv is outside the bounds of 0 to 1, instead sets the output color to the\n// "outOfBoundsColor" define.\n\n// defaults to black\n#ifndef outOfBoundsColor\n#define outOfBoundsColor vec4(0.0, 0.0, 0.0, 1.0)\n#endif\n\nvoid mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {\n	float isOutOfBounds = step(0.0, uv.x) * step(-1.0, -uv.x) * step(0.0, uv.y) * step(-1.0, -uv.y);\n	outputColor = mix(outOfBoundsColor, inputColor, isOutOfBounds);\n}\n';

// src/glsl/scale.glsl
var scale_default = "// scales the image\n\n// default 1.0\n#ifndef scale\n#define scale 1.0\n#endif\n\nvoid mainUv(inout vec2 uv) {\n	uv -= 0.5;\n	uv *= 1.0 / scale;\n	uv += 0.5;\n}\n";

// src/docs.ts
import * as THREE2 from "three";

// src/XTermConnector.ts
import { EffectPass as EffectPass2 } from "postprocessing";
import { EffectComposer, Pass, RenderPass } from "postprocessing";
import {
  CanvasTexture,
  Clock,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  Vector2 as Vector22,
  WebGLRenderer
} from "three";
var XTermConnector = class {
  canvas = Object.assign(document.createElement("canvas"), {
    className: "cool-retro-hyper"
  });
  scene = new Scene();
  renderer = new WebGLRenderer({
    canvas: this.canvas,
    preserveDrawingBuffer: true,
    alpha: true
  });
  camera = new OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 1, 1e3);
  composer = new EffectComposer(this.renderer);
  clock = new Clock(true);
  renderPasse = new RenderPass(this.scene, this.camera);
  shaderPasses = [];
  passes = [];
  screenElement;
  cancelDraw = () => {
  };
  resetScreenElementOpacity = () => {
  };
  removeMouseHandlers = () => {
  };
  coordinateTransform = (x, y) => [x, y];
  resizeObserver;
  debounceTimeout;
  options = {};
  constructor() {
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.camera.position.z = 1;
  }
  setResizeObserver() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    this.resizeObserver = new ResizeObserver((entries) => {
      if (this.debounceTimeout) {
        clearTimeout(this.debounceTimeout);
      }
      this.debounceTimeout = setTimeout(() => {
        const entry = entries[0];
        if (entry) {
          const { width, height } = entry.contentRect;
          this.handleResize(width, height);
        }
      }, 32);
    });
    if (this.screenElement) {
      this.resizeObserver.observe(this.screenElement);
    }
  }
  handleResize(width, height) {
    const { devicePixelRatio } = window;
    const aspect = width / height;
    this.dispose();
    this.renderer.setSize(width, height, false);
    this.composer.setSize(width, height);
    this.camera = new OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 1, 1e3);
    this.camera.position.z = 1;
    const uniformValues = {
      aspect,
      resolution: new Vector22(
        width * devicePixelRatio,
        height * devicePixelRatio
      )
    };
    for (const [uniformKey, uniformValue] of Object.entries(uniformValues)) {
      for (const pass of this.shaderPasses) {
        const material = pass.fullscreenMaterial;
        const uniform = material.uniforms[uniformKey];
        if (uniform) {
          uniform.value = uniformValue;
        }
      }
    }
  }
  setPasses(passes) {
    const { composer } = this;
    composer.removeAllPasses();
    for (const pass of this.passes) {
      pass.dispose();
    }
    composer.addPass(this.renderPasse);
    if (passes.length) {
      passes[passes.length - 1].renderToScreen = true;
      for (const pass of passes) {
        composer.addPass(pass);
      }
    }
    this.shaderPasses = passes.filter(
      (pass) => pass instanceof Pass && !(pass instanceof EffectPass2)
    );
  }
  getLayers(term2) {
    const canvasList = term2._core.screenElement.getElementsByTagName("canvas");
    return canvasList;
  }
  connect(xTerm, crtEffect2, options) {
    if (!this.canvas.parentNode) {
      document.getElementById("hyper")?.append(this.canvas);
    }
    this.resetScreenElementOpacity();
    this.setPasses(crtEffect2.passes);
    this.options = options;
    this.passes = crtEffect2.passes;
    this.screenElement = xTerm._core.screenElement;
    this.resetScreenElementOpacity = (() => {
      const opacity = this.screenElement.style.opacity;
      return () => {
        this.screenElement.style.opacity = opacity;
      };
    })();
    this.screenElement.style.opacity = "0";
    this.setResizeObserver();
    this.connectXTerm();
    this.removeMouseHandlers();
    if (typeof crtEffect2.coordinateTransform === "function") {
      this.coordinateTransform = crtEffect2.coordinateTransform;
      this.removeMouseHandlers = (() => {
        const handle = this.handleEvent.bind(this);
        this.canvas.addEventListener("mousedown", handle);
        this.canvas.addEventListener("mousemove", handle);
        this.canvas.addEventListener("mouseup", handle);
        this.canvas.addEventListener("click", handle);
        this.canvas.addEventListener("wheel", handle);
        return () => {
          this.canvas.removeEventListener("mousedown", handle);
          this.canvas.removeEventListener("mousemove", handle);
          this.canvas.removeEventListener("mouseup", handle);
          this.canvas.removeEventListener("click", handle);
          this.canvas.removeEventListener("wheel", handle);
        };
      })();
    }
    this.start();
  }
  connectXTerm() {
    const xTermCanvasElements = this.screenElement.getElementsByTagName("canvas");
    const xTermLayers = Array.from(xTermCanvasElements, (canvas) => {
      const { zIndex } = window.getComputedStyle(canvas);
      return {
        canvas,
        zIndex: zIndex === "auto" ? 0 : Number(zIndex) || 0
      };
    }).sort((a, b) => a.zIndex - b.zIndex).map(({ canvas }) => canvas);
    this.scene.clear();
    for (const [i, xTermLayer] of xTermLayers.entries()) {
      const geometry = new PlaneGeometry(1, 1);
      const material = new MeshBasicMaterial({ transparent: true });
      const mesh = new Mesh(geometry, material);
      mesh.position.z = -xTermLayers.length + i;
      this.scene.add(mesh);
      const texture = new CanvasTexture(xTermLayer);
      texture.minFilter = LinearFilter;
      mesh.material.map = texture;
    }
  }
  start() {
    this.cancelDraw();
    const materials = Array.from(
      this.scene.children,
      (mesh) => mesh.material
    );
    const timeUniforms = this.shaderPasses.reduce(
      (acc, pass) => {
        const material = pass.fullscreenMaterial;
        if (!material.uniforms.time) {
          return acc;
        }
        acc.push(material.uniforms.time);
        return acc;
      },
      []
    );
    const fps = 1e3 / (this.options.fps ?? 60);
    const { clock, composer } = this;
    let previousTime = 0;
    let requestAnimationFrameId = requestAnimationFrame(function draw(time) {
      const dist = time - previousTime;
      if (dist < fps) {
        requestAnimationFrame(draw);
        return;
      }
      previousTime = time;
      for (const timeUniform of timeUniforms) {
        timeUniform.value = clock.getElapsedTime();
      }
      for (const material of materials) {
        material.map.needsUpdate = true;
      }
      composer.render(clock.getDelta());
      requestAnimationFrameId = requestAnimationFrame(draw);
    });
    this.cancelDraw = function cancelDraw() {
      cancelAnimationFrame(requestAnimationFrameId);
    };
  }
  handleEvent(ev) {
    if (ev.syntethic) {
      return;
    }
    ev.preventDefault();
    ev.stopPropagation();
    const { clientX, clientY } = ev;
    const { width, height, left, bottom } = ev.target.getBoundingClientRect();
    let x = (clientX - left) / width;
    let y = (bottom - clientY) / height;
    [x, y] = this.coordinateTransform?.(x, y) ?? [x, y];
    const copy = {};
    for (const attr in ev) {
      copy[attr] = ev[attr];
    }
    ;
    [copy.clientX, copy.clientY] = [x * width + left, bottom - y * height];
    const TargetEvent = ev.constructor;
    const clonedEvent = new TargetEvent(ev.type, copy);
    clonedEvent.syntethic = true;
    this.screenElement.dispatchEvent(clonedEvent);
  }
  dispose() {
    this.scene.children.forEach((child) => {
      if (child instanceof Mesh) {
        if (child.material instanceof MeshBasicMaterial) {
          if (child.material.map) {
            child.material.map.dispose();
          }
          child.material.dispose();
        }
        child.geometry.dispose();
      }
    });
  }
};

// package.json
var package_default = {
  name: "cool-retro-hyper",
  version: "0.0.5",
  description: "A Hyper terminal plugin that applies a retro CRT monitor effect.",
  main: "dist/index.js",
  scripts: {
    build: "tsup src/index.ts --format cjs",
    dev: "pnpm run build --watch",
    "build:prod": "tsup src/index.ts --format cjs --minify",
    "build:docs": "tsup src/docs.ts --format esm --watch --out-dir ./docs",
    test: 'echo "Error: no test specified" && exit 1'
  },
  repository: {
    type: "git",
    url: "https://github.com/fronterior/cool-retro-hyper"
  },
  keywords: [
    "hyper",
    "hyperterm",
    "hyper-plugin",
    "xterm",
    "retro",
    "threejs",
    "postprocessing",
    "glsl",
    "crt"
  ],
  homepage: "https://github.com/fronterior/cool-retro-hyper#readme",
  bugs: {
    url: "https://github.com/fronterior/cool-retro-hyper/issues",
    email: "lowfronterior@gmail.com"
  },
  author: {
    name: "fronterior",
    email: "lowfronterior@gmail.com"
  },
  license: "MIT",
  dependencies: {
    postprocessing: "6.36.3",
    three: "0.171.0"
  },
  devDependencies: {
    "@types/node": "22.10.1",
    "@types/three": "0.171",
    prettier: "3.4.2",
    tsup: "8.3.5",
    typescript: "5.7.2"
  },
  peerDependencies: {
    "@types/react": "18.2.79",
    "@types/react-dom": "18.2.25",
    react: "^18.0.0",
    "react-dom": "^18.0.0",
    xterm: "4.19.0"
  },
  packageManager: "pnpm@9.15.0"
};

// src/docs.ts
var version = package_default.version;
var noiseTexture = await new Promise((res) => {
  new THREE2.TextureLoader().load("./allNoise512.png", (texture) => {
    texture.minFilter = THREE2.LinearFilter;
    texture.wrapS = THREE2.RepeatWrapping;
    texture.wrapT = THREE2.RepeatWrapping;
    res(texture);
  });
});
var configuration = {
  crt: {
    screenCurvature: 0.3
  },
  shaderPaths: []
};
var term = new Terminal();
var webglAddon = new WebglAddon();
var fitAddon = new FitAddon();
var webLinksAddon = new WebLinksAddon();
var hostname = "cool-retro-hyper";
var hyperPromptText = `\x1B[1;38;2;255;255;255m${hostname}\x1B[0m \x1B[1;33m$\x1B[0m `;
var HyperASCIILogo = `
   \u2592\u2592\u2592\u2592\u2592\u2592\u2592\u2592\u2592\u2592\u2592\u2592\u2592\u2592\u2592\u2592\u2592\u2592\u2592\u2592\u2592\u2592\u2592\u2592\u2592\u2592  
 \u2592\u2592\u2592\u2591                      \u2591\u2592\u2592\u2592
\u2592\u2592\u2592      \x1B[38;2;255;255;184m\u2593\x1B[0m                   \u2592\u2592\u2592
\u2592\u2592     \x1B[38;2;255;255;184m\u2592\u2588\u2591\x1B[0m                    \u2592\u2592
\u2592\u2592   \x1B[38;2;255;255;184m\u2592\u2588\u2588\u2588\x1B[0m                     \u2592\u2592
\u2592\u2592     \x1B[38;2;255;255;184m\u2592\u2588\u2588\u2592\x1B[0m                   \u2592\u2592
\u2592\u2592     \x1B[38;2;255;255;184m\u2588\u2588\x1B[0m                     \u2592\u2592
\u2592\u2592    \x1B[38;2;255;255;184m\u2592\u2588     \u2588\u2588\u2588\u2588\u2588\x1B[0m            \u2592\u2592
\u2592\u2592                            \u2592\u2592
\u2592\u2592                            \u2592\u2592
\u2592\u2592                            \u2592\u2592
\u2592\u2592                            \u2592\u2592
\u2592\u2592                            \u2592\u2592
\u2592\u2592\u2592                          \u2592\u2592\u2592
 \u2592\u2592\u2592\u2591                      \u2591\u2592\u2592\u2592
   \u2592\u2592\u2592\u2592\u2592\u2592\u2592\u2592\u2592\u2592\u2592\u2592\u2592\u2592\u2592\u2592\u2592\u2592\u2592\u2592\u2592\u2592\u2592\u2592\u2592\u2592
`.split("\n");
var HyperInfo = `
\x1B[1;38;2;0;255;0mWelcome to Cool Retro Hyper Example\x1B[0m
------------------------------------
\x1B[1;33mVersion\x1B[0m: ${version}
\x1B[1;33mRepositiry\x1B[0m: \x1B[38;2;0;255;255mhttps://github.com/fronterior/cool-retro-hyper\x1B[0m 

\x1B[1;33mUsage\x1B[0m: crh [command]
  -h, --help                   Show this message
  -c, --config                 Get all configuration
  -c, --config <key>           Get configuration
  -c, --config <key> <value>   Set configuration
  -r, --reset                  Reset configuration

\x1B[1;33mExamples\x1B[0m:
  crh --config crt.screenCurvature 0.2
  crh -c shaderPaths <SHADER_TEXT_URL>
  crh -r
`.split("\n");
term.open(document.getElementById("terminal"));
term.loadAddon(webglAddon);
term.loadAddon(fitAddon);
term.loadAddon(webLinksAddon);
function getRawText(text) {
  return text.replaceAll(/\x1B.*?m/g, "");
}
function crhFetch() {
  const paddingLeft = 3;
  const lineWidth = 35;
  const maxLineWidth = paddingLeft + lineWidth + Math.max(...HyperInfo.map((line) => getRawText(line).length));
  if (term.cols > maxLineWidth) {
    const maxLineHeight = Math.max(HyperASCIILogo.length, HyperInfo.length);
    for (let i = 0; i < maxLineHeight; i++) {
      const logoLine = HyperASCIILogo[i];
      const textWidth = logoLine.replaceAll(/\x1B.*?m/g, "").length;
      const line = " ".repeat(paddingLeft) + logoLine.padEnd(lineWidth + logoLine.length - textWidth, " ") + HyperInfo[i];
      term.write(`${line}
\r`);
    }
  } else {
    const logoPaddingLeft = Math.floor((term.cols - 32) / 2);
    for (const line of 32 > term.cols ? [] : HyperASCIILogo) {
      term.write(`${" ".repeat(logoPaddingLeft)}${line}
\r`);
    }
    for (const line of HyperInfo) {
      term.write(`${line}
\r`);
    }
  }
}
function prompt() {
  term.write(hyperPromptText);
}
function run(cmd) {
  if (cmd.length === 0) {
    return;
  }
  const [name, flag, ...args] = cmd.split(" ");
  if (name !== "crh") {
    term.write(`
\rcommand not found: ${name}`);
    return;
  }
  if (flag === "-c" || flag === "--config") {
    const [key, ...values] = args;
    let targetObject = configuration;
    key?.split(".").forEach((field, i, { length }) => {
      if (i + 1 === length) {
        const value = +values[0];
        if (!Number.isNaN(value)) {
          targetObject[field] = value;
        }
        return;
      }
      targetObject = targetObject[field];
    });
    console.log(configuration);
    const crtEffect2 = createCRTEffect({
      options: configuration,
      noiseTexture,
      glslEffects: glsl_exports,
      userEffectPasses: []
    });
    xTermConnector.connect(term, crtEffect2, connectOptions);
  }
  term.write("\n\r \u26A0\uFE0F Working in progress \u26A0\uFE0F");
}
var inputHistory = [];
var inputText = "";
var cursor = 0;
term.onKey(({ key, domEvent }) => {
  const keyCode = key.charCodeAt(0);
  const { cursorX, cursorY } = term.buffer.active;
  switch (keyCode) {
    case 13:
      const cmd = inputText.trim();
      inputHistory.push(cmd);
      run(cmd);
      term.write("\n");
      term.write(key);
      prompt();
      inputText = "";
      cursor = 0;
      return;
    case 27:
      const eventKey = domEvent.key;
      if (eventKey === "ArrowUp" || eventKey === "ArrowDown") {
        return;
      }
      if (eventKey === "ArrowLeft" && !cursor) {
        return;
      }
      if (eventKey === "ArrowRight" && cursor === inputText.length) {
        return;
      }
      term.write(key);
      cursor += eventKey === "ArrowLeft" ? -1 : eventKey === "ArrowRight" ? 1 : 0;
      return;
    case 127:
      if (!cursor) {
        return;
      }
      term.buffer.active.getLine(cursorY)?.translateToString() ?? "";
      const promptText = inputText;
      const nextText = promptText.slice(0, cursor - 1) + promptText.slice(cursor);
      term.write(
        `\r${hyperPromptText}${nextText} \x1B[${cursorY + 1};${cursorX}H`
      );
      inputText = nextText;
      cursor -= 1;
      return;
    default:
      const writeText = inputText.slice(0, cursor) + domEvent.key + inputText.slice(cursor);
      term.write(
        `\r${hyperPromptText}${writeText}\x1B[${cursorY + 1};${cursorX + 2}H`
      );
      inputText = writeText;
      cursor += 1;
  }
});
function debounce(cb, delay) {
  let timer = -1;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(cb, delay);
  };
}
window.addEventListener(
  "resize",
  debounce(() => {
    fitAddon.fit();
    term.reset();
    crhFetch();
    prompt();
  }, 32)
);
fitAddon.fit();
crhFetch();
prompt();
var crtEffect = createCRTEffect({
  options: configuration,
  noiseTexture,
  glslEffects: glsl_exports,
  userEffectPasses: []
});
var connectOptions = {
  fps: 60,
  shaderPaths: configuration.shaderPaths
};
var xTermConnector = new XTermConnector();
xTermConnector.connect(term, crtEffect, connectOptions);
