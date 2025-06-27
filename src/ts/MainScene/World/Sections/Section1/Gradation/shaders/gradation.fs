uniform float time;
varying vec2 vUv;

#pragma glslify: hsv2rgb = require('./hsv2rgb.glsl' )
#pragma glslify: random = require('./random.glsl' )

void main( void ) {

	float pinkHue = 0.95;

// Create a time-based oscillation for saturation.
// When 't' is 0, saturation is low (white-ish).
// When 't' is 1, saturation is high (full pink).
float t = sin(time * 0.7) * 0.35 + 0.35; // (sin_output * half_of_range) + half_of_range

// Adjust the saturation range.
// mix(0.1, 1.0, t) means saturation will go from 0.1 (almost white) to 1.0 (full pink).
// The '0.1' ensures it doesn't become completely black when desaturated.
float saturation = mix(0.01, 1.0, t); // Start with a very low saturation for pure white

// Keep value at maximum for brightness
float value = 1.0;

// Apply subtle variation from vUv and random to the HUE *within a very tiny range*
// or just to the saturation/value, to avoid changing the base color too much.
// Here, we'll apply it as a *slight* offset to the hue, but keep it very small.
float hueOffset = (random(gl_FragCoord.xy * 0.01) * 0.01 - 0.005) + (vUv.y * 0.01); // Very small random/UV offset
pinkHue = mod(pinkHue + hueOffset, 1.0); // Ensure it wraps around if offset pushes it over 1

vec3 sec1 = hsv2rgb( vec3( pinkHue, saturation, value ) );
	gl_FragColor = vec4( sec1, 1.0 );

}