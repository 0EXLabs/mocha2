varying vec3 vNormal;

void main() {
    // Convert the normal to view space (camera space)
    vNormal = normalize( normalMatrix * normal );

    // Standard projection
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
