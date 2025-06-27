uniform float time;
uniform float uVisibility;
uniform sampler2D uTex;
varying vec2 vUv;
varying vec3 vPos;

#pragma glslify: hsv2rgb = require('./hsv2rgb.glsl' )
#pragma glslify: random = require('./random.glsl' )

void main( void ) {

	vec3 color = texture2D( uTex, vUv ).rgb;
	gl_FragColor = vec4( color, 1.0 );


}