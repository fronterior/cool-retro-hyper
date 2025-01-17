// adapted from https://github.com/Swordfish90/cool-retro-term/blob/master/app/qml/ShaderTerminal.qml

uniform lowp float screenCurvature;
uniform lowp vec3 frameColor;
uniform lowp float bazelSize;

vec2 distortCoordinates(vec2 coords){
	vec2 cc = (coords - vec2(0.5, 0.5));
	float dist = dot(cc, cc) * screenCurvature;
	return (coords + cc * (1. + dist) * dist);
}

float max2(vec2 v) {
	return max(v.x, v.y);
}

float min2(vec2 v) {
	return min(v.x, v.y);
}

vec4 texture(sampler2D buf, vec2 uv) {
	if(!(uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0))
		return texture2D(buf, uv);

	return vec4(0.0);
}

float roundSquare(vec2 p, vec2 b, float r) {
	return length(max(abs(p)-b,0.0))-r;
}

// Calculate normal to distance function and move along
// normal with distance to get point of reflection
vec2 borderReflect(vec2 p)
{
	float r = 0.01;
	float eps = 0.0001;
	vec2 epsx = vec2(eps,0.0);
	vec2 epsy = vec2(0.0,eps);
	vec2 b = (0.999+vec2(r,r))* 0.5;
	r /= 3.0;
	
	p -= 0.5;

	vec2 normal = vec2(roundSquare(p-epsx,b,r)-roundSquare(p+epsx,b,r),
					   roundSquare(p-epsy,b,r)-roundSquare(p+epsy,b,r))/eps;

	if (max2(abs(p) - b) < 0.0 || abs(normal.x * normal.y) > 0.1)
		return vec2(-1.0);

	float d = roundSquare(p, b, r);
	p += 0.5;

	return p + d*normal;
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 fragColor) {
	vec2 coords = distortCoordinates(uv);

	vec3 color = texture(inputBuffer, coords).rgb;

	float alpha = 0.0;

	float XbazelMargin = bazelSize * 0.01;
	float YbazelMargin = XbazelMargin * resolution.x / resolution.y;

	float innerShadowLength = 0.01;
  float innerShadow = min2(smoothstep(vec2(0.0), vec2(innerShadowLength), coords) - smoothstep(vec2(1.0 - innerShadowLength), vec2(1.0), coords));
  color *= innerShadow;

	float outShadowLength = 0.65 * screenCurvature;
	float outShadow = max2(1.0 - smoothstep(vec2(-outShadowLength), vec2(-XbazelMargin, -YbazelMargin), coords) + smoothstep(vec2(1.0 + XbazelMargin, 1.0 + YbazelMargin), vec2(1.0 + outShadowLength), coords));
	outShadow = clamp(sqrt(outShadow), 0.0, 1.0);
 
	vec2 reflected = borderReflect(coords);  
	float innerShadow2 = min2(smoothstep(vec2(0.0), vec2(innerShadowLength), reflected) - smoothstep(vec2(1.0 - innerShadowLength), vec2(1.0), reflected)); // FIXME: dedup  
	color += max(texture(inputBuffer, reflected).rgb * 0.5, 0.0) * innerShadow2;
	fragColor = vec4(color, 1.0);
}
