export class Outro {

	private elm: HTMLElement;

	private textElmWrapList: HTMLElement[];

	// Added properties for countdown feature
	private countdownContainerElm: HTMLElement | null = null; // Initialize to null
	private countdownDisplaySpans: HTMLElement[] = []; // Initialize to empty array
	private previousSecondsValue: number = -1; // To track seconds for animation, -1 to ensure first tick animates

	private targetDate: Date; // Keep this declaration

	constructor( ) {

		this.elm = document.querySelector( '.section5-content' ) as HTMLElement;
		this.textElmWrapList = Array.from( this.elm.querySelectorAll( '.section5-text-wrap' ) );


		let textInnerList = Array.from( this.elm.querySelectorAll( '.section5-text-inner' ) );
		let textInnerList2 = Array.from( this.elm.querySelectorAll( '.section5-text-inner2' ) );
		let textInnerList3 = Array.from( this.elm.querySelectorAll( '.section5-text-inner3' ) );
		textInnerList.forEach( item => {

			let str = item.innerHTML;
			item.innerHTML = '';

			str.split( "" ).forEach( char => {

				item.innerHTML += '<span>' + char + '</span>';

			} );

		} );
		textInnerList2.forEach( item => {

			let str = item.innerHTML;
			item.innerHTML = '';

			str.split( "" ).forEach( char => {

				item.innerHTML += '<span>' + char + '</span>';

			} );

		} );
		textInnerList3.forEach( item => {

			let str = item.innerHTML;
			item.innerHTML = '';

			str.split( "" ).forEach( char => {

				item.innerHTML += '<span>' + char + '</span>';

			} );

		} );

		// Get references to the individual spans for the countdown, after they've been created by the loop above
		const countdownParentElm = this.elm.querySelector( '.section5-text > .section5-text-inner' ) as HTMLElement;
		if ( countdownParentElm ) {
			this.countdownContainerElm = countdownParentElm;
			this.countdownDisplaySpans = Array.from( countdownParentElm.querySelectorAll( 'span' ) );
		} else {
			console.warn("Countdown element .section5-text-inner not found!");
			// this.countdownDisplaySpans will remain an empty array due to initialization
		}

		this.targetDate = new Date( 'Aug 30, 2025 23:59:59' ); // User's target countdown date

		this.initCountdown(); // Initialize the countdown

	}

	private timeoutList: number[] = [];

	public switchVisibility( visible: boolean ) {

		let waitSum = 0.0;

		this.timeoutList.forEach( item => {

			window.clearTimeout( item );

		} );

		if ( visible ) {

			for ( let i = 0; i < this.textElmWrapList.length; i ++ ) {

				let elm = this.textElmWrapList[ i ];

				let itemList = Array.from( elm.querySelectorAll( '.section5-text' ) );

				this.timeoutList.push( window.setTimeout( () => {

					for ( let j = 0; j < itemList.length; j ++ ) {

						let item = itemList[ j ];

						// Check if this is the parent of the countdown element. If so, do not apply original text animation.
						// The countdown's appearance and animation will be managed by updateCountdown() via inline styles.
						if (item.querySelector('.section5-text-inner') === this.countdownContainerElm) {
							item.removeAttribute('data-visible5line');
						} else {
							this.timeoutList.push( window.setTimeout( () => {
								item.setAttribute( 'data-visible5line', 'true' );
							}, 200 * j ) );
						}

					}

				}, waitSum ) );

				waitSum += itemList.length * 200 + 400;

			}

		} else {

			let items = Array.from( this.elm.querySelectorAll( '.section5-text' ) );

			items.forEach( item => {

				item.setAttribute( 'data-visible5line', "false" );

			} );

		}

	}

	// New countdown methods
	private initCountdown() {
		this.updateCountdown(); // Initial call to display countdown immediately
		setInterval( () => this.updateCountdown(), 1000 ); // Update every second
	}

	private updateCountdown() {
		const now = new Date().getTime();
		const distance = this.targetDate.getTime() - now;

		let countdownString: string;
		let currentSeconds: number;

		if ( distance < 0 ) {
			countdownString = "EXPIRED"; // Removed trailing space
			currentSeconds = -1; // Indicate expired, no animation
		} else {
			const days = Math.floor( distance / ( 1000 * 60 * 60 * 24 ) );
			const remainingMillisecondsAfterDays = distance % ( 1000 * 60 * 60 * 24 );
			const minutes = Math.floor( ( remainingMillisecondsAfterDays % ( 1000 * 60 * 60 ) ) / ( 1000 * 60 ) ); // Corrected minutes calculation
			const seconds = Math.floor( ( remainingMillisecondsAfterDays % ( 1000 * 60 ) ) / 1000 ); // Corrected seconds calculation

			countdownString =
				`${days.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
			currentSeconds = seconds;
		}

		// Apply base inline styles to ALL individual spans for countdown, overriding SCSS
		this.countdownDisplaySpans.forEach(span => {
			if (span) {
				span.style.color = '#fff'; // Make text always white
				span.style.right = '0px'; // Remove initial offset
				span.style.opacity = '1'; // Make visible
				span.style.fontSize = '5em'; // Use desired font size for individual characters
				span.style.letterSpacing = 'normal'; // Use normal letter spacing
				span.style.transition = 'none'; // Temporarily disable SCSS transitions
			}
		});

		// Update the text content of individual spans
		for ( let i = 0; i < this.countdownDisplaySpans.length; i++ ) {
			if ( i < countdownString.length ) {
				this.countdownDisplaySpans[i].textContent = countdownString[i];
			} else {
				this.countdownDisplaySpans[i].textContent = ''; // Clear if countdownString is shorter than available spans
			}
		}

		// Apply animation for seconds if value changed and not expired
		if ( currentSeconds !== this.previousSecondsValue && currentSeconds !== -1 ) {
			// Target the seconds digits (last two spans) and the colon before them (indices 5, 6, 7 for DD:MM:SS)
			const secondsAnimationSpans = [
				this.countdownDisplaySpans[5], // Colon
				this.countdownDisplaySpans[6], // First digit of seconds
				this.countdownDisplaySpans[7]  // Second digit of seconds
			];

			secondsAnimationSpans.forEach(span => {
				if (span) {
					// Apply instant shrink and fade
					span.style.transition = 'none';
					span.style.transform = 'scale(0.8)';
					span.style.opacity = '0.5';

					// Force a reflow to ensure the instant style is applied before transition
					void span.offsetWidth; 

					// Animate back to original size and opacity
					span.style.transition = 'transform 0.2s ease-out, opacity 0.2s ease-out';
					span.style.transform = 'scale(1)';
					span.style.opacity = '1';
				}
			});
		}
		this.previousSecondsValue = currentSeconds; // Update previous seconds value
	}

}