/*!
 * Deep-link.js
 *
 * Released under MIT license
 */

(function() {
	'use strict';

	/****************************************************************
	 * VARIABLES
	 ****************************************************************/

	var delay = 2000,
		OSs = {
			// Sometimes, Windows Phone contains Android in it’s UA
			// To prevent it from overlapping with Android, try Windows first
			windows: {
				store_prefix: 'zune:navigate?appid=',
				test: /Windows\s+Phone|IEMobile/i
			},

			android: {
				store_prefix: 'https://play.google.com/store/apps/details?id=',
				test: /Android/i
			},

			iOS: {
				store_prefix: 'https://itunes.apple.com/en/app/id',
				test: /iPhone|iPad|iPod/i
			}
		};

		var hidden, visibilityChange; 
		if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support 
			hidden = "hidden";
			visibilityChange = "visibilitychange";
		} else if (typeof document.msHidden !== "undefined") {
			hidden = "msHidden";
			visibilityChange = "msvisibilitychange";
		} else if (typeof document.webkitHidden !== "undefined") {
			hidden = "webkitHidden";
			visibilityChange = "webkitvisibilitychange";
		}


	/****************************************************************
	 * FUNCTIONS
	 ****************************************************************/

	// Get user agent
	var getUserAgent = function() {
		var k;

		for(k in OSs) {
			if(navigator.userAgent.match(OSs[k].test)) return k;
		}

		return '';
	};

	// Get current time in ms
	var getTime = function() {
		return new Date().getTime();
	};

	var open = function(url) {
		window.location.href = url;
	};

	var handleAndroidBrowsers = function(app, store, href, scheme) {
	  // Android Mobile
	  var isAndroidMobile = navigator.userAgent.indexOf('Android') > -1 &&
	                        navigator.userAgent.indexOf('Mozilla/5.0') > -1 &&
	                        navigator.userAgent.indexOf('AppleWebKit') > -1;
	  // Android Browser (not Chrome)
	  var regExAppleWebKit = new RegExp(/AppleWebKit\/([\d.]+)/);
	  var resultAppleWebKitRegEx = regExAppleWebKit.exec(navigator.userAgent);
	  var appleWebKitVersion = (resultAppleWebKitRegEx === null ? null : parseFloat(regExAppleWebKit.exec(navigator.userAgent)[1]));
	  var isAndroidBrowser = isAndroidMobile && appleWebKitVersion !== null && appleWebKitVersion > 500;


	  return app;
	}

	// Parse a single element
	var parseElement = function(el) {
		var clicked, timeout,
			OS = getUserAgent(),
			OSAttr = OS.toLowerCase(),

			href = el.getAttribute('href'),
			app = (
				el.getAttribute('data-app-' + OSAttr) ||
				el.getAttribute('data-app')
			),
			store = (
				el.getAttribute('data-store-' + OSAttr) ||
				el.getAttribute('data-store')
			),
			scheme = (
				el.getAttribute('data-android-scheme')
			);
			

		if(!app) return;
		if(!href) el.setAttribute('href', app);
		el.setAttribute('parsed', true);

		if(OS && app) {
			// Hijack click event
			el.onclick = function(e) {
				e.preventDefault();
				e.stopImmediatePropagation();

				var win;

				// Store start time
				var start = getTime();
				clicked = true;

				// Timeout to detect if the link worked
				timeout = setTimeout(function() {
					// Check if any of the values are unset
					if(!clicked || !timeout) return;

					// Get current time
					var now = getTime();

					// Reset things
					clicked = false;
					timeout = null;

					// Has the user left the screen? ABORT!
					if(now - start >= delay * 2) return;

					// Open store or original link
					if(store) open(OSs[OS].store_prefix + store);
					else if(href) open(href);
				}, delay);

				var finalURI = handleAndroidBrowsers(app, store, href, scheme);

				// Go to app
				win = open(finalURI);
			};
		} else if(!href || href === '#') {
			// Apps are presumably not supported
			el.style.display = 'none';
		}

		document.addEventListener(
			visibilityChange,
			() => {
				if (document[hidden]) {
					if(!clicked || !timeout) return;

					// Reset everything
					timeout = clearInterval(timeout);
					clicked = false;
				}
			},
			false
		);
	};


	/****************************************************************
	 * INITIALIZE
	 ****************************************************************/

	function deepInit()
	{
		var elements = document.getElementsByTagName('a'),
		i = elements.length;

		while(i--){
			if (null === elements[i].getAttribute('parsed')) {
				parseElement(elements[i]);
			}
		} 
	}

	deepInit();


})();
