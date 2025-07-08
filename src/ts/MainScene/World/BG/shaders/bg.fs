uniform vec3 uColor;
uniform float time;
uniform float uSection[6];

varying vec2 vUv;

#pragma glslify: hsv2rgb = require('./hsv2rgb.glsl' )
#pragma glslify: random = require('./random.glsl' )
#define linearstep(edge0, edge1, x) min(max(((x) - (edge0)) / ((edge1) - (edge0)), 0.0), 1.0)

void main( void ) {

	float pinkHue = 0.95;

// Create a time-based oscillation for saturation.
// When 't' is 0, saturation is low (white-ish).
// When 't' is 1, saturation is high (full pink).
float t = sin(time * 0.7) * 0.35 + 0.35; // (sin_output * half_of_range) + half_of_range

// Adjust the saturation range.
// mix(0.1, 1.0, t) means saturation will go from 0.1 (almost white) to 1.0 (full pink).
// The '0.1' ensures it doesn't become completely black when desaturated.
float saturation = mix(0.05, 1.0, t); // Start with a very low saturation for pure white

// Keep value at maximum for brightness
float value = 1.0;

// Apply subtle variation from vUv and random to the HUE *within a very tiny range*
// or just to the saturation/value, to avoid changing the base color too much.
// Here, we'll apply it as a *slight* offset to the hue, but keep it very small.
float hueOffset = (random(gl_FragCoord.xy * 0.01) * 0.01 - 0.005) + (vUv.y * 0.01); // Very small random/UV offset
pinkHue = mod(pinkHue + hueOffset, 1.0); // Ensure it wraps around if offset pushes it over 1

vec3 sec1 = vec3( 0.859,0.875,0.745 );
	vec3 sec2 = vec3( 1.0 );
	vec3 sec3 = vec3( 0.863,0.875,0.753 );
	vec3 sec4 = vec3( 1.0 );
	float gradient = smoothstep(0.0, 1.0, vUv.y) * 0.1 + 0.88;
vec3 sec5 = vec3(0.631,0.871,0.996 );

	// Define the top and bottom colors in RGB for sec6
	vec3 colorTop = vec3( 10.0 / 255.0, 13.0 / 255.0, 54.0 / 255.0 ); // #0A0D36
	vec3 colorBottom = vec3( 98.0 / 255.0, 93.0 / 255.0, 204.0 / 255.0 ); // #625DCC

	// Mix the colors based on vUv.y. Since vUv.y is 0 at the bottom and 1 at the top,
	// we want to mix towards colorTop as vUv.y approaches 1.
	// Using smoothstep for a softer, more natural gradient transition.
	vec3 sec6 = mix( colorBottom, colorTop, smoothstep( 0.0, 1.0, vUv.y ) );

	vec3 color = vec3( 0.0 );
	color = mix( color, sec1, uSection[ 0 ] );
	color = mix( color, sec2, uSection[ 1 ] );
	color = mix( color, sec3, uSection[ 2 ] );
	color = mix( color, sec4, uSection[ 3 ] );
	color = mix( color, sec5, uSection[ 4 ] );
	color = mix( color, sec6, uSection[ 5 ] );

	gl_FragColor = vec4( color, 1.0 );

}