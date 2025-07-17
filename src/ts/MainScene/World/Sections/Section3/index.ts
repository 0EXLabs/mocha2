import * as THREE from 'three';
import * as ORE from 'ore-three';
import { Section, ViewingState } from '../Section';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Displays } from './Displays';
import { Lights } from './Lights';
import { BackText } from './BackText';
import { CursorLight } from './CursorLight';
import { Wire } from './Wire';
import { Sec3Particle } from './Sec3Particle';
import { Book } from './Book';
import { GUI } from 'lil-gui';

export class Section3 extends Section {

    private displays?: Displays;
    private lights?: Lights;
    private wire?: Wire;
    private book?: Book;
    private directionLightList: THREE.DirectionalLight[] = [];
    private backText?: BackText;
    private mixer?: THREE.AnimationMixer;
    private bookAnimationAction?: THREE.AnimationAction;
    

    private cursorLight: CursorLight;
    private renderer: THREE.WebGLRenderer;
    private particle?: Sec3Particle;

    private ambientLight?: THREE.AmbientLight;
    private mainDirectionalLight?: THREE.DirectionalLight;

    private info?: ORE.LayerInfo;

    // New property to store the tree model
    private treeModel?: THREE.Object3D;

    constructor( manager: THREE.LoadingManager, parentUniforms: ORE.Uniforms, renderer: THREE.WebGLRenderer ) {

        super( manager, 'section_3', ORE.UniformsLib.mergeUniforms( parentUniforms, {
            uEnvMap: {
                value: null
            }
        } ) );

        // params
        this.renderer = renderer;
        this.elm = document.querySelector( '.section3' ) as HTMLElement;
        this.ppParam.bloomBrightness = 0.7;
        this.bakuParam.rotateSpeed = 0.0;
        this.cameraSPFovWeight = 18;
        this.bakuParam.materialType = 'line';
        this.bakuParam2.materialType = 'line';
        
        /*-------------------------------
            Light
        -------------------------------*/

        this.light2Data = {
            intensity: 1,
            position: new THREE.Vector3( - 3.0, - 11.0, - 3.0 ),
            targetPosition: new THREE.Vector3( 0, - 11.0, 0 ),
        };

        // cursorLight
        this.cursorLight = new CursorLight();
        this.add( this.cursorLight );

        // Added AmbientLight
        this.ambientLight = new THREE.AmbientLight( 0xffffff, 0.17);
        this.add( this.ambientLight );

        // Initialize GUI
        

        // Added DirectionalLight
        // this.mainDirectionalLight = new THREE.DirectionalLight( 0xffffff, 1.0 );
        // this.mainDirectionalLight.position.set( 5, 10, 5 );
        // this.add( this.mainDirectionalLight );

    }

    protected onLoadedGLTF( gltf: GLTF ): void {

        this.add( gltf.scene );
        

        // Traverse the GLTF scene to find the 'tree' model and store its reference
        gltf.scene.traverse((child) => {
            
            
            if (child.name === 'tree') { 
                this.treeModel = child;
                // Set initial visibility of the tree based on the current section visibility
                this.switchTreeVisibility(this.sectionVisibility);
            }

            // Existing material modification logic
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                if (mesh.name === 'model_6002' || mesh.name === 'model_6002_2' || mesh.name === 'model_6002_4') {
                    const originalMaterial = mesh.material as THREE.MeshStandardMaterial;
                    const newMaterial = new THREE.MeshStandardMaterial({
                        map: originalMaterial.map,
                        color: originalMaterial.color,
                        transparent: true,
                        side: THREE.DoubleSide
                    });
                    mesh.material = newMaterial;
                }
            }
        });

        /*-------------------------------
            Displays (commented out in original)
        -------------------------------*/
        // this.displays = new Displays( this.getObjectByName( 'Displays' ) as THREE.Object3D, this.commonUniforms );
        // this.displays.switchVisibility( this.sectionVisibility );

        /*-------------------------------
            Lights (commented out in original)
        -------------------------------*/
        // this.lights = new Lights( this.getObjectByName( 'Lights' ) as THREE.Object3D, this.commonUniforms );
        // this.lights.switchVisibility( this.sectionVisibility );

        /*-------------------------------
            Wire (commented out in original)
        -------------------------------*/
        // this.wire = new Wire( this.getObjectByName( 'Wire' )as THREE.Mesh, this.commonUniforms );
        // this.wire.switchVisibility( this.sectionVisibility );

        /*-------------------------------
            BackText
        -------------------------------*/
        this.backText = new BackText( this.getObjectByName( 'BackText' ) as THREE.Mesh, this.commonUniforms );
        this.backText.switchVisibility( this.sectionVisibility );

        /*-------------------------------
            Particle
        -------------------------------*/
        let baku = this.getObjectByName( 'Bakupos' )!;

        this.particle = new Sec3Particle( this.commonUniforms );
        this.particle.switchVisibility( this.sectionVisibility );
        this.particle.position.copy( baku.position );
        this.particle.position.y += 2.8;

        this.add( this.particle );

        /*-------------------------------
            Book (commented out in original)
        -------------------------------*/
        // Changed from 'bookpos' to 'armature' as the root object for the Book component
        // const bookRootObject = this.getObjectByName( 'locator1' );
        // console.log(bookRootObject);
        // if ( bookRootObject ) {
        //  // Create a parent group to control the overall position of the animated book
        //  const bookParentGroup = new THREE.Group();
        //  bookParentGroup.add( bookRootObject );
        //  this.add( bookParentGroup );

        //  // Traverse the book model and apply MeshBasicMaterial
        //  bookRootObject.traverse(( child ) => {
        //       if ( ( child as THREE.Mesh ).isMesh ) {
        //           const mesh = child as THREE.Mesh;
        //           const originalMaterial = mesh.material as THREE.MeshStandardMaterial;

        //           const newMaterial = new THREE.MeshBasicMaterial( {
        //               map: originalMaterial.map, // Preserve existing texture map
        //               color: originalMaterial.color,
        //           } );

        //           mesh.material = newMaterial;
        //       }
        //  } );

        //  this.book = new Book( bookRootObject as THREE.Object3D, this.commonUniforms );
        //  this.book.switchVisibility( this.sectionVisibility );

        //  // Set static position, rotation, and scale for the book's parent group
        //  bookParentGroup.position.set( 0.3, -11.48, 0.32 ); // Set X, Y, Z coordinates
        //  bookParentGroup.rotation.set( -Math.PI/2, 0, Math.PI/2 ); // Example: Set X, Y, Z rotation in radians
        //  bookParentGroup.scale.set( 50, 50, 50 );    // Example: Set X, Y, Z scale

        //  // Add GUI controls for book transformations (on the parent group)
        //  if ( this.gui ) {
        //       const bookFolder = this.gui.addFolder( 'Book Transform' );
        //       bookFolder.add( bookParentGroup.position, 'x', -20, 20 ).name( 'Position X' );
        //       bookFolder.add( bookParentGroup.position, 'y', -20, 20 ).name( 'Position Y' );
        //       bookFolder.add( bookParentGroup.position, 'z', -20, 20 ).name( 'Position Z' );

        //       bookFolder.add( bookParentGroup.rotation, 'x', -Math.PI, Math.PI ).name( 'Rotation X' );
        //       bookFolder.add( bookParentGroup.rotation, 'y', -Math.PI, Math.PI ).name( 'Rotation Y' );
        //       bookFolder.add( bookParentGroup.rotation, 'z', -Math.PI, Math.PI ).name( 'Rotation Z' );

        //       bookFolder.add( bookParentGroup.scale, 'x', 0.1, 50 ).name( 'Scale X' );
        //       bookFolder.add( bookParentGroup.scale, 'y', 0.1, 50 ).name( 'Scale Y' );
        //       bookFolder.add( bookParentGroup.scale, 'z', 0.1, 50 ).name( 'Scale Z' );

        //       bookFolder.open();
        //  }

        // } else {
        //  console.warn( "Armature object (locator1) not found in the GLTF scene for Section3. Ensure your GLTF model contains an object named 'locator1'." );
        // }

        /*-------------------------------
            Animations
        -------------------------------*/
        this.mixer = new THREE.AnimationMixer( gltf.scene );

        // if ( gltf.animations && gltf.animations.length > 0 ) {
        //  // Assuming the first animation clip is for the book. 
        //  // You may need to change gltf.animations[0] to a specific animation by name
        //  // e.g., gltf.animations.find(clip => clip.name === 'BookAnimationName');
        //  const bookClip = gltf.animations[ 0 ]; 
        //  this.bookAnimationAction = this.mixer.clipAction( bookClip );
        //  this.bookAnimationAction.setLoop( THREE.LoopOnce, 1 );
        //  this.bookAnimationAction.clampWhenFinished = true;
        // }

        if ( this.info ) {
            this.resize( this.info );
        }
    }

    public update( deltaTime: number ) {
        super.update( deltaTime );

        this.cursorLight.update( deltaTime );
        this.cursorLight.intensity = this.animator.get( 'sectionVisibility' + this.sectionName ) || 0;

        if ( this.mixer ) {
            this.mixer.update( deltaTime );
        }
    }

    public resize( info: ORE.LayerInfo ) {
        super.resize( info );
        this.info = info;
    }

    public switchViewingState( viewing: ViewingState ): void {
        super.switchViewingState( viewing );

        if ( this.backText ) this.backText.switchVisibility( this.sectionVisibility );

        window.cameraController.switchCameraMove( this.sectionVisibility );

        if ( this.lights ) this.lights.switchVisibility( this.sectionVisibility );

        if ( this.wire ) this.wire.switchVisibility( this.sectionVisibility );

        if ( this.displays ) this.displays.switchVisibility( this.sectionVisibility );

        if ( this.particle ) this.particle.switchVisibility( this.sectionVisibility );

        // if ( this.book ) this.book.switchVisibility( this.sectionVisibility );

        if ( this.ambientLight ) this.ambientLight.visible = this.sectionVisibility;
        // if ( this.mainDirectionalLight ) this.mainDirectionalLight.visible = this.sectionVisibility;

        // Toggle the visibility of the tree model
        this.switchTreeVisibility(this.sectionVisibility);

        // if ( this.sectionVisibility ) {
        //  if ( this.bookAnimationAction ) {
        //       this.bookAnimationAction.stop(); // Stop previous animation if any
        //       this.bookAnimationAction.play();
        //  }
        // }
    }

    // New helper method to control the visibility of the tree model
    private switchTreeVisibility(isVisible: boolean): void {
        if (this.treeModel) {
            // Traverse all children of the tree model and set their visibility
            this.treeModel.traverse((child) => {
                child.visible = isVisible;
            });
        }
    }

    public hover( args: ORE.TouchEventArgs ) {
        this.cursorLight.hover( args );
    }

 
}
