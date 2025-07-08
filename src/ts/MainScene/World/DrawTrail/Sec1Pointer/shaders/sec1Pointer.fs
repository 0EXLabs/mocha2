uniform sampler2D uTex;
uniform sampler2D uMatCapTex;
varying vec2 vUv;
varying vec3 vNormal;

void main( void ) {

	vec3 normal = normalize( vNormal );
	vec4 col = texture2D( uTex, vUv );

	gl_FragColor = col;

}