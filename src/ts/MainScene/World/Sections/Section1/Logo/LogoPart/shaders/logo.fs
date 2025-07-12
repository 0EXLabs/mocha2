uniform vec3 uColor;
varying vec3 vNormal;

uniform sampler2D uTex;

varying vec2 vUv;

void main( void ) {

	vec3 normal = normalize( vNormal );
	vec4 tex = texture2D( uTex, vUv );
	// col = vec3( 1.0 );

	gl_FragColor = vec4( tex.rgb, tex.a );

}