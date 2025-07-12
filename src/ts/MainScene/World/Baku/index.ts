import * as THREE from 'three';
import * as ORE from 'ore-three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { PowerMesh } from 'power-mesh';

import bakuFrag from './shaders/baku.fs';
import bakuVert from './shaders/baku.vs';
import passThroughFrag from './shaders/passThrough.fs';

export type BakuMaterialType = 'normal' | 'glass' | 'line' | 'dark'

export class Baku extends THREE.Object3D {

    // animation

    private animator: ORE.Animator;
    private animationMixer?: THREE.AnimationMixer;
    private currentAnimationSection: string | null = null;
    private animationClipNameList: string[] = [];
    private animationActions: { [name:string]: THREE.AnimationAction} = {};

    // state

    private jumping: boolean = false;

    private manager: THREE.LoadingManager;
    private commonUniforms: ORE.Uniforms;

    private container: THREE.Object3D;
    private mesh?: PowerMesh;
    protected meshLine?: THREE.SkinnedMesh<THREE.BufferGeometry, THREE.ShaderMaterial>;

    private passThrough?: ORE.PostProcessing;
    public sceneRenderTarget: THREE.WebGLRenderTarget;
    public onLoaded?: () => void;

    constructor( manager: THREE.LoadingManager, parentUniforms: ORE.Uniforms ) {

        super();

        this.manager = manager;

        this.commonUniforms = ORE.UniformsLib.mergeUniforms( parentUniforms, {
            uSceneTex: {
                value: null
            },
            uNoiseTex: window.gManager.assetManager.getTex( 'noise' ),
            winResolution: {
                value: new THREE.Vector2()
            },
            roughness: {
                value: 0.0 // Start with a mid-range value, then adjust
            },
            ambientLightColor: { value: new THREE.Color( 0xffffff ) },
            opacity: { value: 1.0 }
        } );

        /*-------------------------------
            Animator
        -------------------------------*/

        this.animator = window.gManager.animator;

        this.commonUniforms.uTransparent = this.animator.add( {
            name: 'bakuTransparent',
            initValue: 0,
            easing: ORE.Easings.easeOutCubic,
            userData: {
                pane: {
                    min: 0, max: 1
                }
            }
        } );

        this.commonUniforms.uLine = this.animator.add( {
            name: 'bakuLine',
            initValue: 1,
            easing: ORE.Easings.easeOutCubic,
            userData: {
                pane: {
                    min: 0, max: 1
                }
            }
        } );

        this.commonUniforms.uRimLight = this.animator.add( {
            name: 'bakuRimLight',
            initValue: 1,
            easing: ORE.Easings.easeOutCubic,
            userData: {
                pane: {
                    min: 0, max: 1
                }
            }
        } );

        this.animator.add( {
            name: 'bakuIntroRotate',
            initValue: 1,
            easing: ORE.Easings.easeOutCubic
        } );

        this.animator.add( {
            name: 'bakuRotateSpeed',
            initValue: 0.0,
        } );

        this.animator.add( {
            name: 'bakuRotateValue',
            initValue: 0,
            easing: ORE.Easings.easeOutCubic
        } );

        /*-------------------------------
            RenderTarget
        -------------------------------*/

        this.sceneRenderTarget = new THREE.WebGLRenderTarget( 1, 1 );

        /*-------------------------------
            container
        -------------------------------*/

        this.container = new THREE.Object3D();
        this.add( this.container );

        /*-------------------------------
            Load
        -------------------------------*/

        let loader = new GLTFLoader( this.manager );

        loader.load( './assets/scene/baku.glb', ( gltf ) => {

            let bakuWrap = gltf.scene.getObjectByName( "baku_amature" ) as THREE.Object3D;

            this.container.add( bakuWrap );

            /*-------------------------------
                MainMesh
            -------------------------------*/

            this.mesh = new PowerMesh( bakuWrap.getObjectByName( 'Baku' ) as THREE.Mesh, {
                fragmentShader: bakuFrag,
                vertexShader: bakuVert,
                uniforms: this.commonUniforms,
            }, true );

            this.mesh.castShadow = true;
            this.mesh.renderOrder = 2;

            this.mesh.onBeforeRender = ( renderer ) => {

                if ( ! this.passThrough ) {

                    this.passThrough = new ORE.PostProcessing( renderer, {
                        fragmentShader: passThroughFrag,
                    } );

                }

                let currentRenderTarget = renderer.getRenderTarget();

                if ( currentRenderTarget ) {

                    this.passThrough.render( { tex: currentRenderTarget.texture }, this.sceneRenderTarget );

                    this.commonUniforms.uSceneTex.value = this.sceneRenderTarget.texture;

                }

            };

            /*-------------------------------
                Line Mesh
            -------------------------------*/

            const lineMat = new THREE.ShaderMaterial( {
                vertexShader: bakuVert,
                fragmentShader: bakuFrag,
                uniforms: ORE.UniformsLib.mergeUniforms( this.commonUniforms, {
                    ambientLightColor: { value: new THREE.Color( 0xffffff ) }
                } ),
                side: THREE.BackSide,
                depthWrite: false,
                transparent: true,
                defines: {
                    IS_LINE: ''
                },
            } );

            this.meshLine = new THREE.SkinnedMesh( this.mesh.geometry, lineMat );
            this.meshLine.skeleton = this.mesh.skeleton;
            this.container.add( this.meshLine );

            /*-------------------------------
                animation
            -------------------------------*/

            this.animationMixer = new THREE.AnimationMixer( this );
            this.animations = gltf.animations;

            for ( let i = 0; i < this.animations.length; i ++ ) {

                let clip = this.animations[ i ];

                this.animator.add( {
                    name: "BakuWeight/" + clip.name,
                    initValue: 1,
                    userData: {
                        pane: {
                            min: 0,
                            max: 1
                        }
                    },
                    easing: ORE.Easings.easeOutCubic
                } );

                this.animationClipNameList.push( clip.name );

                let action = this.animationMixer.clipAction( this.animations[ i ] );
                
                // Set default to no looping for all actions initially
                action.loop = THREE.LoopRepeat; // Or whatever your default loop behavior is for non-jump animations

                this.animationActions[ clip.name ] = action;

            }

            if ( this.currentAnimationSection ) {

                this.changeSectionAction( this.currentAnimationSection );

            }

            if ( this.onLoaded ) {

                this.onLoaded();

            }

        } );

    }

    public changeMaterial( type: BakuMaterialType ) {

        this.animator.animate( 'bakuTransparent', type == 'glass' ? 1 : 0, 1 );
        this.animator.animate( 'bakuLine', type == 'line' ? 1 : 0, 1 );
        this.animator.animate( 'bakuRimLight', type == 'dark' ? 0.0 : 1.0 );
        this.animator.animate( 'opacity', type == 'glass' ? 0.2 : 1.0, 1 );

    }

    private playingSectionAction: THREE.AnimationAction | null = null;

    public changeSectionAction( sectionName: string ) {

        let action = this.animationActions[ sectionName ];
        let lastSectionAction = this.playingSectionAction;
        this.playingSectionAction = action;

        if ( action ) {

            action.play();

        }

        for ( let i = 0; i < this.animationClipNameList.length; i ++ ) {

            let name = this.animationClipNameList[ i ];
            this.animator.animate( 'BakuWeight/' + name, name == sectionName ? 1 : 0, 1.0, () =>{

                if ( lastSectionAction && lastSectionAction.getClip().name == name ) {

                    lastSectionAction.stop();

                }

            } );

        }

        this.currentAnimationSection = sectionName;

    }

    public update( deltaTime: number ) {

        if ( this.animationMixer ) {

            this.animationMixer.update( deltaTime );

            for ( let i = 0; i < this.animationClipNameList.length; i ++ ) {

                let name = this.animationClipNameList[ i ];

                let action = this.animationActions[ name ];

                if ( action ) {

                    action.weight = this.animator.get( 'BakuWeight/' + name ) || 0;

                }

                // 無理やりループ - This part needs to be handled carefully with the jump
                // It might be better to manage looping behavior directly when changing sections
                // or if an animation is specifically designed to loop.
                // For a one-shot jump, this loop condition should not apply.
                if ( action.loop != THREE.LoopOnce ) {
                     if ( action.time > 15.33333333333 ) {
                         action.time = 0;
                     }
                 }

            }

        }

        if ( this.mesh ) {

            this.rotation.z -= ( this.animator.get<number>( 'bakuIntroRotate' ) ?? 0 ) * 3.0;

        }

        if ( ! this.animator.isAnimatingVariable( 'bakuRotateValue' ) ) {


            this.animator.setValue( "bakuRotateValue", ( this.animator.get<number>( 'bakuRotateValue' ) ?? 0 ) + ( this.animator.get<number>( 'bakuRotateSpeed' ) ?? 0 ) * deltaTime );

        }

        this.container.rotation.z = this.animator.get<number>( 'bakuRotateValue' ) ?? 0;

    }

    public jump() {

        if ( this.jumping ) return;

        this.jumping = true;

        let action = this.animationActions[ "section_4_jump" ];
        if (!action) {
            console.warn("Animation 'section_4_jump' not found.");
            this.jumping = false;
            return;
        }

        // 1. Stop all other playing animations immediately (or set their weight to 0)
        // Iterate through all animation actions and set their weight to 0, except for the jump animation
        for (let name in this.animationActions) {
            const currentAction = this.animationActions[name];
            if (currentAction && currentAction.getClip().name !== "section_4_jump") {
                currentAction.weight = 0; // Immediately set weight to 0
                currentAction.stop(); // Stop them
            }
        }
        
        // Ensure the previous playingSectionAction is stopped if any
        if (this.playingSectionAction && this.playingSectionAction !== action) {
             this.playingSectionAction.stop();
        }


        // 2. Prepare and play the jump animation
        action.reset();
        action.loop = THREE.LoopOnce;
        action.enabled = true; // Ensure it's enabled
        action.weight = 1.0; // Set its weight to 1 immediately
        action.play();

        // 3. Transition weights
        this.animator.setValue('BakuWeight/section_4_jump', 1.0); // Set to 1 instantly
        this.animator.setValue('BakuWeight/section_4', 0.0);       // Set to 0 instantly

        // Store the jump action as the currently playing one for cleanup
        this.playingSectionAction = action;
        this.currentAnimationSection = "section_4_jump";

        if ( this.animationMixer ) {

            let onFinished = ( e: any ) => {

                let finishedAction = e.action as THREE.AnimationAction;
                let clip = finishedAction.getClip();

                if ( clip.name == 'section_4_jump' ) {
                    // When jump finishes, transition back to section_4 (or whatever the default is)
                    // You can choose to animate this return or set it instantly.
                    // To instantly return to section_4:
                    this.animator.setValue( 'BakuWeight/section_4', 1.0 );
                    this.animator.setValue( 'BakuWeight/section_4_jump', 0.0 );
                    
                    // Stop the jump action
                    finishedAction.stop();

                    // If you want to resume the previous section that was playing before the jump,
                    // you'd need to store that section's name before the jump and play it here.
                    // For now, it assumes a return to 'section_4'.
                    const resumeSectionName = 'section_4'; // Or whatever your default idle animation is
                    const resumeAction = this.animationActions[resumeSectionName];
                    if (resumeAction) {
                        resumeAction.reset();
                        resumeAction.play();
                        this.playingSectionAction = resumeAction;
                        this.currentAnimationSection = resumeSectionName;
                    }


                    this.jumping = false;

                    // Remove the event listener to prevent it from firing again for other animations
                    if ( this.animationMixer ) {
                        this.animationMixer.removeEventListener( 'finished', onFinished );
                    }
                }
            };

            this.animationMixer.addEventListener( 'finished', onFinished );

        }
		console.log("jumped")
        setTimeout(() => {
            this.dispatchEvent( {
                type: 'jump'
            } );
        }, 1700); // 300ms delay

    }

    public changeRotateSpeed( speed: number ) {

        if ( speed == 0.0 ) {

            this.animator.setValue( 'bakuRotateSpeed', 0 );
            this.animator.setValue( 'bakuRotateValue', ( this.container.rotation.z + Math.PI ) % ( Math.PI * 2.0 ) - Math.PI );
            this.animator.animate( 'bakuRotateValue', 0 );

            return;

        }

        this.animator.animate( 'bakuRotateSpeed', speed );


    }

    public show( duration: number = 1.0 ) {

        this.animator.animate( 'bakuIntroRotate', 0, duration );

    }

    public resize( info: ORE.LayerInfo ) {

        this.sceneRenderTarget.setSize( info.size.canvasPixelSize.x, info.size.canvasPixelSize.y );
        this.commonUniforms.winResolution.value.copy( info.size.canvasPixelSize );

    }

}