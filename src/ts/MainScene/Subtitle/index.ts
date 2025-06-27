import { NoiseText } from '../NoiseText';

export class Subtitles {

	private elm: HTMLElement;

	private noiseTextList: NoiseText[] = [];

	private textList: string[] = [
		"",
		"",
		"",
		""
	];

	constructor( ) {

		this.elm = document.querySelector( '.subtitles' ) as HTMLElement;

	}

	public changeSection( sectionIndex: number ) {

		let text = this.textList[ sectionIndex ] || '';

		this.show( text );

	}

	public show( text: string, duration: number = 1.0, textHideDuration: number = 3.5 ) {

		this.hideAll();

		if ( ! text ) return;

		let textElm = document.createElement( 'p' );
		textElm.classList.add( "subtitles-text" );

		let span = document.createElement( 'span' );
		textElm.appendChild( span );
		this.elm.appendChild( textElm );

		let noiseText = new NoiseText( span );
		noiseText.noise = "このサイト作るの意外と大変なんですよこれが";
		noiseText.show( text, duration, 40 );

		noiseText.onFinishAnimation = () => {

			setTimeout( () => {

				noiseText.hide();

			}, textHideDuration * 1000 );

		};

		noiseText.onFinishHide = () => {

			this.noiseTextList = this.noiseTextList.filter( item => ! item.elm.isEqualNode( noiseText.elm ) );
			noiseText.elm.remove();

		};

		this.noiseTextList.push( noiseText );

	}

	public hideAll() {

		this.noiseTextList.forEach( item => item.hide() );

	}

}
