uniform sampler2D tex;
uniform float loaded;
uniform float uIsVisibility;
uniform float uIntroLogoVisibility;

varying vec2 vUv;
varying float vAlpha;

void main( void ) {

	vec4 col = vec4(0.2,0.141,0.067,1.0);

	col.w = vAlpha * uIntroLogoVisibility;

	gl_FragColor = col;

}