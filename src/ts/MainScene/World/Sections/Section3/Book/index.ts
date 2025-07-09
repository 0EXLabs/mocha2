import * as THREE from 'three';
import * as ORE from 'ore-three';
import EventEmitter from 'wolfy87-eventemitter';


export class Book extends EventEmitter {

	public root: THREE.Object3D;
	private commonUniforms: ORE.Uniforms;
	private animator: ORE.Animator;

	constructor( root: THREE.Object3D, parentUniforms: ORE.Uniforms ) {

		super();

		this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
			// uNoiseTex: window.gManager.assetManager.getTex( 'noise' )
		} );

		/*-------------------------------
			Animator
		-------------------------------*/

		this.animator = window.gManager.animator;

		this.commonUniforms.uVisibility = this.animator.add( {
			name: 'sec3BookVisibility',
			initValue: 0,
		 } );

		/*-------------------------------
			Mesh
		-------------------------------*/

		this.root = root;
		// The book model's materials will be used directly from the GLTF.
		// No need to create new materials or shaders for it.

	}

	public switchVisibility( visible: boolean ) {

		if ( visible ) this.root.visible = true;

		this.animator.animate( "sec3BookVisibility", visible ? 1 : 0, 1, () => {

			if ( ! visible ) this.root.visible = false;

		} );

	}

}
