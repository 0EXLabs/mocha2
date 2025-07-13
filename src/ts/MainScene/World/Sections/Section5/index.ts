import * as THREE from 'three';
import * as ORE from 'ore-three';
import { GUI } from 'lil-gui';

import { Section, ViewingState } from '../Section';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { TextRing } from './TextRing';
import { Grid } from './Grid';
import { Outro } from './Outro';

export class Section5 extends Section {

	private textring: TextRing;
	private grid: Grid;
	private outro: Outro;
	private gui: GUI;
	private ambientLight?: THREE.AmbientLight;
	private bakupos4: THREE.Object3D | undefined;
	private locatorModel?: THREE.Object3D;
	private mixer: THREE.AnimationMixer | undefined;
	constructor( manager: THREE.LoadingManager, parentUniforms: ORE.Uniforms ) {

		super( manager, 'section_5', parentUniforms );

		// params

		this.elm = document.querySelector( '.section5' ) as HTMLElement;

		this.bakuParam.materialType = 'dark';
		this.bakuParam.rotateSpeed = 0.0;
		this.ppParam.bloomBrightness = 0.0;
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
			intensity: 0.5
		};

		this.light2Data = {
			position: new THREE.Vector3( 5.0, - 10.7, 20 ),
			targetPosition: new THREE.Vector3( - 1.7, - 6.7, 12 ),
			intensity: 0.5,
		};
		this.ambientLight = new THREE.AmbientLight( 0xffffff, 0.1 );
		this.add( this.ambientLight );
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

		this.gui = new GUI();
		this.gui.hide();

	}

	protected onLoadedGLTF( gltf: GLTF ): void {

		let scene = gltf.scene;

		this.add( scene );
		console.log("GLTF Scene for Section 5:", gltf.scene);
		console.log("GLTF Animations for Section 5:", gltf.animations);
		// baku

		
		let baku3 = this.getObjectByName( 'Bakupos3' ) as THREE.Object3D;
		// textring

		baku3.add( this.textring );
		
		// grid

		baku3.add( this.grid );
		
		this.bakupos4 = this.getObjectByName( 'locator1' ) as THREE.Object3D;

		if ( this.bakupos4 ) {
			this.bakupos4.position.y = 0.176;
			const folder = this.gui.addFolder( 'Bakupos4' );
			folder.add( this.bakupos4.position, 'x', - 0, 1 ).name( 'Position X' ).step( 0.001 );
			folder.add( this.bakupos4.position, 'y', - 0, 1 ).name( 'Position Y' ).step( 0.001 );
			folder.add( this.bakupos4.position, 'z',  0, 1 ).name( 'Position Z' ).step( 0.001 );

		}

		gltf.scene.traverse((child) => {
            console.log("Child object in Section 3:", child.name, child);
            
            // Check if the current child is the 'tree' model
            // IMPORTANT: Replace 'tree' with the actual name of your tree model in the GLTF file.
            // You can verify the name from the console.log output above.
            if (child.name === 'locator1') { 
                this.locatorModel = child;
                // Set initial visibility of the tree based on the current section visibility
                this.switchLocatorisibility(this.sectionVisibility);
            }

            // Existing material modification logic
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                if (mesh.name === 'bloons') {
                    const originalMaterial = mesh.material as THREE.MeshStandardMaterial;
                    const newMaterial = new THREE.MeshStandardMaterial({
                        map: originalMaterial.map,
                        color: originalMaterial.color,
                        transparent: true
                    });
                    mesh.material = newMaterial;
                }
            }
        });

		if (gltf.animations && gltf.animations.length) {
            this.mixer = new THREE.AnimationMixer(gltf.scene);
            const bloonsClip = gltf.animations.find(clip => clip.name === 'bloonsAnimation.001');
            if (bloonsClip) {
                const action = this.mixer!.clipAction(bloonsClip);
                action.setLoop(THREE.LoopRepeat, Infinity);
                action.play();
            }
        }

	}

	public update( deltaTime: number ): void {

		if ( this.sectionVisibility ) {
			// this.bakuTransform.rotation.multiply( new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3( 0.0, 0.0, 1.0 ), deltaTime * 0.1 ) );
		}

		if ( this.sectionVisibility ) {
			// this.bakuTransform.rotation.multiply( new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3( 0.0, 0.0, 1.0 ), deltaTime * 0.1 ) );
		}

		let baku3 = this.getObjectByName( 'Bakupos3' ) as THREE.Object3D;

		if ( baku3 ) {


			baku3.rotateZ( - deltaTime * 0.1 );


		}

		if (this.mixer) {
            this.mixer.update(deltaTime);
        }

	}

	private outroTextTimer: number | null = null;

	public switchViewingState( viewing: ViewingState ): void {

		super.switchViewingState( viewing );

		this.textring.switchVisibility( this.sectionVisibility );
		this.grid.switchVisibility( this.sectionVisibility );

		if ( this.outroTextTimer ) {

			window.clearTimeout( this.outroTextTimer );
			this.outroTextTimer = null;

		}
		this.switchLocatorisibility(this.sectionVisibility);
		if ( this.ambientLight ) this.ambientLight.visible = this.sectionVisibility;
		this.outroTextTimer = window.setTimeout( () => {

			this.outro.switchVisibility( this.sectionVisibility );
			this.outroTextTimer = null;

		}, this.sectionVisibility ? 100 : 0 );

		if ( this.sectionVisibility ) {

			this.gui.show();

		} else {

			this.gui.hide();

		}

	}
	private switchLocatorisibility(isVisible: boolean): void {
        if (this.locatorModel) {
            // Traverse all children of the tree model and set their visibility
            this.locatorModel.traverse((child) => {
                child.visible = isVisible;
            });
        }
    }

}
