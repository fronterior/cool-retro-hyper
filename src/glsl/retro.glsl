// adapted from https://github.com/Swordfish90/cool-retro-term/blob/master/app/qml/ShaderTerminal.qml

uniform highp vec3 fontColor;
uniform highp vec3 backgroundColor;
uniform lowp float chromaColor;

uniform highp float staticNoise;
uniform lowp sampler2D noiseSource;

uniform lowp float horizontalSyncStrength;
uniform lowp float horizontalSyncFrequency;

uniform lowp vec2 jitter;

uniform highp float glowingLine;

uniform lowp float flickering;
uniform lowp float ambientLight;

uniform lowp float pixelHeight;
uniform bool pixelization;

uniform lowp float rgbSplit;
uniform lowp float rgbSplitXDistance;
uniform lowp float rgbSplitYDistance;

float sum2(vec2 v) {
	return v.x + v.y;
}

float rgb2grey(vec3 v){
	float dp = dot(v, vec3(0.21, 0.72, 0.04));
	return dp == 0.0 ? 0.00001 : dp;
}

float randomPass(vec2 coords) {
	return fract(smoothstep(0.0, -120.0, coords.y - (resolution.y + 120.0) * fract(-time * 0.15)));
}

float getScanlineIntensity(vec2 coords) {
	float result = 1.0;
	float val = 0.0;
	vec2 rasterizationCoords = fract(coords * resolution * 0.0365 * pixelHeight);
	val += smoothstep(0.0, 0.5, rasterizationCoords.y);
	val -= smoothstep(0.5, 2.0 * 0.5, rasterizationCoords.y);
	result *= mix(0.3, 1.0, val);

	if (pixelization) {
		val = 0.0;
		val += smoothstep(0.0, 0.5, rasterizationCoords.x);
		val -= smoothstep(0.5, 2.0 * 0.5, rasterizationCoords.x);
		result *= mix(0.4, 1.0, val);
	}

	return result;
}

vec4 texture(sampler2D buf, vec2 uv) {
	if(!(uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0))
		return texture2D(buf, uv);
}

float noise(vec2 uv) {
	float limitedTime = mod(time, 10.0);
  vec2 v = vec2(uv.x + limitedTime * 0.5, uv.y + sin(limitedTime) * 0.5);

  return fract(sin(dot(v, vec2(12.9898, 78.233))) * 43758.5453);  
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 fragColor) {
	vec2 initialCoords = vec2(fract(time/2.0), fract(time/PI));
	vec4 initialNoiseTexel = texture2D(noiseSource, initialCoords);
	float randval = initialNoiseTexel.r;
	float distortionScale = step(1.0 - horizontalSyncFrequency, randval) * randval * horizontalSyncStrength * 0.1;
	float distortionFreq = mix(4.0, 40.0, initialNoiseTexel.g);

	vec2 coords = uv;

	float dst = sin((coords.y + time) * distortionFreq);
	coords.x += dst * distortionScale;

	vec4 noiseTexel = texture2D(noiseSource, resolution / (vec2(512, 512) * 0.75) * coords + vec2(fract(time * 1000.0 / 51.0), fract(time * 1000.0 / 237.0)));

	// jitter
	vec2 offset = vec2(noiseTexel.b, noiseTexel.a) - vec2(0.5);
	coords += offset * jitter;
	coords = clamp(coords, 0.0, 1.0);
  
	float color = 0.0001;

	// static noise
	float distance = length(vec2(0.5) - uv);

  vec2 scaledUv = uv * 10.0;
  
  float noiseValue = noise(scaledUv + noise(scaledUv.yx));

  noiseValue += distortionScale * 3.0;
  color += staticNoise * noiseValue * (1.0 - distance * 1.3);


	// glowingLine
	color += randomPass(uv * resolution) * glowingLine * 0.2;

	vec3 txt_color = texture(inputBuffer, coords).rgb;

	if (rgbSplit != 0.0) {
		vec3 rightColor = texture2D(inputBuffer, coords + vec2(-rgbSplitXDistance, -rgbSplitYDistance)).rgb;
		vec3 leftColor  = texture2D(inputBuffer, coords + vec2(rgbSplitXDistance, rgbSplitYDistance)).rgb;
		txt_color.r = rightColor.r * 0.6 * rgbSplit + txt_color.r * (1.0 - 0.6 * rgbSplit);
		txt_color.g =  leftColor.g * 0.4 * rgbSplit + txt_color.g * (1.0 - 0.4 * rgbSplit);
		txt_color.b =  leftColor.b * 0.2 * rgbSplit + txt_color.b * (1.0 - 0.2 * rgbSplit);
	}

	float greyscale_color = rgb2grey(txt_color);
	float reflectionMask = sum2(step(vec2(0.0), uv) - step(vec2(1.0), uv));
	reflectionMask = clamp(reflectionMask, 0.0, 1.0);

	vec3 foregroundColor = mix(fontColor, txt_color * fontColor / greyscale_color, chromaColor);
	vec3 finalColor = mix(backgroundColor, foregroundColor, greyscale_color * reflectionMask);

	finalColor += fontColor.rgb * vec3(color);

	finalColor *= 1.0 + (initialNoiseTexel.g - 0.5) * flickering;
	finalColor += vec3(ambientLight) * (1.0 - distance) * (1.0 - distance);

	if (pixelHeight != 0.0)
		finalColor *= getScanlineIntensity(coords);

	fragColor = vec4(finalColor, 1.0);
}
