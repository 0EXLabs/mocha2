uniform sampler2D tex;
uniform float uVisibility;
varying vec2 vUv;

void main( void ) {
    vec4 texel = texture2D( tex, vUv ); // Get the full texel (including alpha)
    float alpha = texel.a; // Extract the alpha channel

    vec3 desiredLetterColor = vec3(0.0,0.0,0.0); 

    // Create the final color using the desired color and the texture's alpha
    vec4 finalColor = vec4(desiredLetterColor, alpha);

    finalColor.w *= uVisibility; // Apply visibility

    gl_FragColor = finalColor;
}