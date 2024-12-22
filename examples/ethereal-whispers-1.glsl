// @shadertoy
// https://www.shadertoy.com/view/XftczX

// Made with Hatch.one
// License: MIT

/* https://hatch.one uniforms.
uniform float speed; // default: 1.0, min: 0.1, max: 5.0, step: 0.1, title: "Color Speed"
uniform float waves; // default: 10.0, min: 1.0, max: 50.0, step: 1.0, title: "Number of Waves"
uniform float direction; // default: 0.0, min: 0.0, max: 360.0, step: 1.0, title: "Direction"
uniform float mouseInfluence; // default: 0.5, min: 0.0, max: 1.0, step: 0.01, title: "Mouse Influence"
uniform float waveHeight; // default: 0.5, min: 0.0, max: 2.0, step: 0.1, title: "Wave Height"
uniform float metallic; // default: 0.5, min: 0.0, max: 1.0, step: 0.01, title: "Metallic"
uniform vec4 baseColor; // default: #4411ff, type: Color, title: "Base Color"
*/

#define speed 1.0
#define waves 10.0
#define direction 305.
#define mouseInfluence 0.5
#define waveHeight .5
#define metallic 0.5
#define baseColor vec4(0.267, 0.067, 1.0, 1.0)

// Function to get height at a point
float getHeight(vec2 uv) {
    // Calculate direction
    float angle = direction * 3.14159 / 180.0;
    float x = uv.x * cos(angle) + uv.y * sin(angle);
    
    // Get normalized mouse position
    vec2 mouse = vec2(0.5, 0.5) / iResolution.xy;
    //if (iMouse.z <= 0.0) mouse = vec2(0.5);
    
    // Calculate distance from current pixel to mouse
    float distToMouse = distance(uv, mouse);
    float mouseWave = sin(distToMouse * 10.0) * mouseInfluence;
    
    // Create base wave pattern
    return sin(iTime * speed + x * waves + mouseWave) * waveHeight;
}

// Function to calculate surface normal from heightmap
vec3 getNormal(vec2 uv, float height, float eps) {
    vec2 e = vec2(eps, 0.0);
    float h = height;
    float hx = getHeight(uv + e.xy) - getHeight(uv - e.xy);
    float hy = getHeight(uv + e.yx) - getHeight(uv - e.yx);
    return normalize(vec3(-hx, -hy, eps * 2.0));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    
    // Get height at this point
    float h = getHeight(uv);
    
    // Calculate normal for lighting
    vec3 normal = getNormal(uv, h, 0.01);
    
    // Light direction (animated)
    vec3 lightDir = normalize(vec3(cos(iTime * 0.5), sin(iTime * 0.5), 1.0));
    
    // Basic lighting calculation
    float diffuse = max(dot(normal, lightDir), 0.0);
    
    // Specular reflection
    vec3 viewDir = normalize(vec3(0.0, 0.0, 1.0));
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
    
    // Create base color with height influence
    vec3 color = baseColor.rgb;
    
    // Add lighting
    vec3 ambient = color * 0.2;
    vec3 diffuseColor = color * diffuse;
    vec3 specColor = mix(vec3(1.0), color, metallic) * spec;
    
    // Combine all lighting components
    vec3 finalColor = ambient + diffuseColor + specColor;
    
    // Add subtle height-based color variation
    finalColor *= 1.0 + h * 0.2;
    
    // Output final color
    fragColor = vec4(finalColor, 1.0);
    fragColor *= 0.1;
}
