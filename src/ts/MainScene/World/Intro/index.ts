import * as THREE from 'three';
import * as ORE from 'ore-three';
import { Logo } from './Logo';
import { CameraController } from './CameraController';
import { IntroGrid } from './IntroGrid';
import { IntroText } from './IntroText';
import EventEmitter from 'wolfy87-eventemitter';
import { IntroUI } from './IntroUI';
import logoVert from './Logo/shaders/cloud.vs';
import logoFrag from './Logo/shaders/cloud.fs';
export class Intro extends EventEmitter {

	private commonUniforms: ORE.Uniforms;

	private animator: ORE.Animator;

	private ui: IntroUI;
	private ambientLight?: THREE.AmbientLight;
	private renderer: THREE.WebGLRenderer;
	public scene: THREE.Scene;
	public camera: THREE.PerspectiveCamera;
	private cameraController: CameraController;

	public renderTarget: THREE.WebGLRenderTarget;

	private logo: Logo;
	private text1: IntroText;
	private text2: IntroText;
	private text3: IntroText;

	private dirLight: THREE.DirectionalLight;
	private aLight: THREE.AmbientLight;

	public finished: boolean = false;
	private layoutControllerList: ORE.LayoutController[] = [];

	constructor( renderer: THREE.WebGLRenderer, introObj: THREE.Object3D, parentUniforms: ORE.Uniforms ) {

		super();

		this.renderer = renderer;

		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color( "#000" );

		this.camera = new THREE.PerspectiveCamera( 38, 16 / 9, 0.01, 1000, );
		this.camera.position.set( 0, 0, 10 );
		this.scene.add( this.camera );

		this.renderTarget = new THREE.WebGLRenderTarget( 1, 1 );

		this.scene.add( introObj );

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
		} );

		/*-------------------------------
			UI
		-------------------------------*/

		this.ui = new IntroUI();

		this.ui.addListener( 'skip', () => {

			this.skip();
			this.emitEvent( 'finish' );

			this.text1.swithVisibility( false );
			this.text2.swithVisibility( false );
			this.text3.swithVisibility( false );

		} );

		/*-------------------------------
			Animator
		-------------------------------*/

		this.animator = window.gManager.animator;

		this.commonUniforms.loaded = this.animator.add( {
			name: 'loaded',
			initValue: 0,
			userData: {
				pane: {
					min: 0,
					max: 1
				}
			}
		} );

		this.animator.add( {
			name: 'introLightIntensity',
			initValue: 0,
			easing: ORE.Easings.sigmoid( 1 )
		} );

		/*-------------------------------
			Logo
		-------------------------------*/

		this.logo = new Logo( this.scene.getObjectByName( 'Logo' ) as THREE.Mesh, this.commonUniforms );
		this.logo.addListener( 'showImaging', () => {

			this.animator.animate( 'introLightIntensity', 1, 10 );

		} );

		/*-------------------------------
			Text1
		-------------------------------*/
		// Inside your constructor, after this.scene.add( introObj );

const plane = this.scene.getObjectByName('Plane') as THREE.Mesh;
if (plane && plane.isMesh) {
    // Get the texture that was loaded for the original material, if it exists
    const originalMaterial = plane.material as THREE.MeshStandardMaterial;
    const textureFromGLB = originalMaterial?.map || null;

    const basicMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff, // White, so the texture's colors show true
        map: textureFromGLB,
        side: THREE.DoubleSide, // Ensure both sides are visible if needed
		transparent: true
    });

    plane.material = basicMaterial;

    // Ensure texture properties are set if we're reusing a GLB texture
    if (textureFromGLB) {
        textureFromGLB.flipY = false;
        
    }
}

const plane2 = this.scene.getObjectByName('Plane2') as THREE.Mesh;
if (plane2 && plane2.isMesh) {
    const originalMaterial2 = plane2.material as THREE.MeshStandardMaterial;
    const textureFromGLB2 = originalMaterial2?.map || null;

    const basicMaterial2 = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        map: textureFromGLB2,
        side: THREE.DoubleSide,
		transparent: true
    });
    plane2.material = basicMaterial2;

    if (textureFromGLB2) {
        textureFromGLB2.flipY = false;
        
    }
}
		this.text1 = new IntroText( this.scene.getObjectByName( 'Text1' ) as THREE.Object3D, this.commonUniforms, 'HELLO', document.querySelector( '.intro-text-item.introText1' ) as HTMLElement );
		this.text2 = new IntroText( this.scene.getObjectByName( 'Text2' ) as THREE.Object3D, this.commonUniforms, 'TO', document.querySelector( '.intro-text-item.introText2' ) as HTMLElement );
		this.text3 = new IntroText( this.scene.getObjectByName( 'Text3' ) as THREE.Object3D, this.commonUniforms, 'YOU', document.querySelector( '.intro-text-item.introText3' ) as HTMLElement );

		/*-------------------------------
			Scene
		-------------------------------*/

		this.dirLight = new THREE.DirectionalLight();
		this.dirLight.position.set( 1, 1, - 0.0 );
		this.scene.add( this.dirLight );

		this.aLight = new THREE.AmbientLight();
		this.scene.add( this.aLight );

		let introGrid = new IntroGrid( ORE.UniformsLib.mergeUniforms( this.commonUniforms,
			{
				uVisibility: this.animator.getVariableObject( 'introLightIntensity' )!
			}
		) );
		introGrid.position.z = - 1.0;
		this.scene.add( introGrid );

		/*-------------------------------
			CameraController
		-------------------------------*/

		this.cameraController = new CameraController( this.camera );

		/*-------------------------------
			Layout
		-------------------------------*/
		
		const applyShaderMaterial = (objectName: string, offset: number = 0.0) => {
			const obj = this.scene.getObjectByName(objectName);
		
			if (!obj) {
				
				return;
			}
		
			
		
			obj.traverse(child => {
				if ((child as THREE.Mesh).isMesh) {
					const mesh = child as THREE.Mesh;
					const baseMaterial = mesh.material as THREE.MeshStandardMaterial;
		
					
		
					const emissiveColor = baseMaterial?.emissive
						? baseMaterial.emissive.clone().convertLinearToSRGB()
						: new THREE.Color(0xffffff);
		
					if (!baseMaterial?.emissive) {
						
					}
		
					// const shaderMat = new THREE.ShaderMaterial({
					// 	vertexShader: logoVert,
					// 	fragmentShader: logoFrag,
					// 	uniforms: ORE.UniformsLib.mergeUniforms(this.commonUniforms, {
					// 		uColor: { value: emissiveColor },
					// 		uMatCapTex: window.gManager.assetManager.getTex('matCapCloud'),
					// 		num: { value: 1.0 - offset }
					// 	}),
					// 	side: THREE.DoubleSide,
					// 	transparent: false
					// });
		
					// mesh.material = shaderMat;
		
					
				}
			});
		};
		
		
		// ✅ Apply to each object
		// applyShaderMaterial('Wave_Left', 0.1);
		// applyShaderMaterial('Wave_Right', 0.2);
		// applyShaderMaterial('Cube', 0.3);
		
		// this.layoutControllerList.push(new ORE.LayoutController(this.scene.getObjectByName('Wave_Left')!, {
		// 	position: new THREE.Vector3(1.7, 0.4, 0.0)
		// }));
		
		// this.layoutControllerList.push(new ORE.LayoutController(this.scene.getObjectByName('Wave_Right')!, {
		// 	position: new THREE.Vector3(-1.5, 0.0, 0.0)
		// }));
		
		// this.layoutControllerList.push(new ORE.LayoutController(this.scene.getObjectByName('Cube')!, {
		// 	position: new THREE.Vector3(-1.0, -0.5, 0.0),
		// 	scale: 0.6
		// }));

		
	}		

	public hover( args: ORE.TouchEventArgs ) {

		this.cameraController.updateCursor( args.screenPosition );

	}

	public update( deltaTime: number ) {

		if ( this.finished ) return;

		this.logo.update( deltaTime );

		this.cameraController.update( deltaTime );

		let lightIntensity = this.animator.get<number>( 'introLightIntensity' ) || 0;

		this.dirLight.intensity = 0.5 * lightIntensity;
		this.aLight.intensity = 0.05 * lightIntensity;

		this.dirLight.position.y = 1 - ( 1.0 - lightIntensity ) * 2.0;

		let rt = this.renderer.getRenderTarget();
		this.renderer.setRenderTarget( this.renderTarget );
		this.renderer.render( this.scene, this.camera );
		this.renderer.setRenderTarget( rt );

	}

	public async updateLoadState( percentage: number ) {

		this.animator.animate( 'loaded', percentage, 0.5, async () => {

			if ( percentage == 1.0 ) {

				if ( this.finished ) return;

				this.ui.switchSkipVisibility( true );

				await this.logo.start();

				if ( this.finished ) return;

				this.emitEvent( 'showImaging' );

				await this.text1.start();

				if ( this.finished ) return;

				await this.text2.start();

				if ( this.finished ) return;

				await this.text3.start( true );

				this.finished = true;

				this.emitEvent( 'finish' );

			}

		} );

	}

	public resize( info: ORE.LayerInfo ) {

		this.renderTarget.setSize( info.size.canvasPixelSize.x, info.size.canvasPixelSize.y );

		this.camera.aspect = info.size.canvasAspectRatio;
		this.camera.fov = 38 + info.size.portraitWeight * 10.0;
		this.camera.updateProjectionMatrix();

		let isSP = info.size.windowSize.x <= 800;

		this.text1.setEnable( ! isSP );
		this.text2.setEnable( ! isSP );
		this.text3.setEnable( ! isSP );

		this.layoutControllerList.forEach( item => {

			item.updateTransform( info.size.portraitWeight );

		} );

	}

	public skip() {

		this.finished = true;

		this.logo.cancel();

	}

}
