import * as THREE from 'three';
import * as ORE from 'ore-three';

import { Section, ViewingState } from '../Section';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { TextRing } from './TextRing';
import { Grid } from './Grid';
import { Outro } from './Outro';

export class Section5 extends Section {

    private textring: TextRing;
    private grid: Grid;
    private outro: Outro;

    // Declare token variables to make them accessible throughout the class
    private token1: THREE.Object3D | null = null;
    private token2: THREE.Object3D | null = null;
    private token3: THREE.Object3D | null = null;

    constructor( manager: THREE.LoadingManager, parentUniforms: ORE.Uniforms ) {

        super( manager, 'section_5', parentUniforms );

        // params

        this.elm = document.querySelector( '.section5' ) as HTMLElement;

        this.bakuParam.materialType = 'dark';
        this.bakuParam.rotateSpeed = 0.18;
        this.bakuParam2.rotateSpeed = 0.18;
        this.ppParam.bloomBrightness = 1.0;
        this.ppParam.vignet = 1.0;
        this.cameraRange.set( 0.02, 0.02 );

        /*-------------------------------
            Lights
        -------------------------------*/

        this.light1Data = {
            position: new THREE.Vector3( 10.7, 15.5, 18.7 ),
            targetPosition: new THREE.Vector3(
                - 1.2926819324493408,
                - 12.504984855651855,
                13.764548301696777
            ),
            intensity: 0
        };

        this.light2Data = {
            position: new THREE.Vector3( 5.0, - 10.7, 20 ),
            targetPosition: new THREE.Vector3( - 1.7, - 6.7, 12 ),
            intensity: 0.5,
        };

        /*-------------------------------
            TextRing
        -------------------------------*/

        this.textring = new TextRing( this.commonUniforms );
        this.textring.switchVisibility( this.sectionVisibility );

        /*-------------------------------
            Grid
        -------------------------------*/

        this.grid = new Grid( this.commonUniforms );
        this.grid.switchVisibility( this.sectionVisibility );

        /*-------------------------------
            Outro
        -------------------------------*/

        this.outro = new Outro();

    }

    protected onLoadedGLTF( gltf: GLTF ): void {

        let scene = gltf.scene;

        this.add( scene );

        // Log the scene and its children for debugging
        console.log("GLTF Scene:", scene);
        scene.traverse((obj) => {
            if (obj.isObject3D) {
                console.log("Object in GLTF scene:", obj.name);
            }
        });

        // baku

        let baku = this.getObjectByName( 'Baku' ) as THREE.Object3D;
        let baku2 = this.getObjectByName( 'Bakupos' ) as THREE.Object3D;
        let baku3 = this.getObjectByName( 'Bakupos2' ) as THREE.Object3D;

        // Assign tokens to class properties
        this.token1 = this.getObjectByName( 'token1' ) as THREE.Object3D;
        this.token2 = this.getObjectByName( 'token2' ) as THREE.Object3D;
        this.token3 = this.getObjectByName( 'token3' ) as THREE.Object3D;

        // textring

        baku.add( this.textring );

        // grid

        baku.add( this.grid );

        // Set initial visibility for tokens
        this.updateTokenVisibility();
    }

    public update( deltaTime: number ): void {

        if ( this.sectionVisibility ) {
            // this.bakuTransform.rotation.multiply( new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3( 0.0, 0.0, 1.0 ), deltaTime * 0.1 ) );
        }

        let baku2 = this.getObjectByName( 'Bakupos' ) as THREE.Object3D;
        let baku3 = this.getObjectByName( 'Bakupos2' ) as THREE.Object3D;
        if ( baku2 ) {
            baku2.rotateZ( - deltaTime * 0.1 );
            baku3.rotateZ( - deltaTime * 0.1 );
        }
        
        // Add rotation to tokens if they exist and the section is visible
        if (this.sectionVisibility) {
            if (this.token1) {
                this.token1.rotateY(deltaTime * 0.2); // Example: Rotate around Y-axis
            }
            if (this.token2) {
                this.token2.rotateX(deltaTime * 0.15); // Example: Rotate around X-axis
            }
            if (this.token3) {
                this.token3.rotateZ(deltaTime * 0.1); // Example: Rotate around Z-axis
            }
        }
    }

    private outroTextTimer: number | null = null;

    public switchViewingState( viewing: ViewingState ): void {

        super.switchViewingState( viewing );

        this.textring.switchVisibility( this.sectionVisibility );
        this.grid.switchVisibility( this.sectionVisibility );
        this.updateTokenVisibility(); // Call to update token visibility

        if ( this.outroTextTimer ) {

            window.clearTimeout( this.outroTextTimer );
            this.outroTextTimer = null;

        }

        this.outroTextTimer = window.setTimeout( () => {

            this.outro.switchVisibility( this.sectionVisibility );
            this.outroTextTimer = null;

        }, this.sectionVisibility ? 100 : 0 );

    }

    // New method to update token visibility
    private updateTokenVisibility(): void {
        if (this.token1) {
            this.token1.visible = this.sectionVisibility;
        }
        if (this.token2) {
            this.token2.visible = this.sectionVisibility;
        }
        if (this.token3) {
            this.token3.visible = this.sectionVisibility;
        }
    }
}