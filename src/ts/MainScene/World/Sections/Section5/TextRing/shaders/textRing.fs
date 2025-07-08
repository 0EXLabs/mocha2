uniform sampler2D tex;

varying float vAlpha;
varying vec2 vUv;

void main( void ) {


	vec4 color = vec4( 1.,0.557,0.608, 1.0 );
	color.w *= texture2D( tex, vUv ).w;
	
	if( color.w < 0.2 ) discard;

	color.w *= vAlpha * 0.0;

	gl_FragColor = vec4( color );

}