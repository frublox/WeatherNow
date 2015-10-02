/*jshint curly: true, eqeqeq: true, globals: false, es5: false, esnext: true, loopfunc: true, sub: true, browser: true*/

// A brief implementation of the Maybe monad

function Just(value) {
	this.value = value;
}

Just.prototype.bind = f => f(this.value);
Just.prototype.toString = () => "Just " + this.value;

var Nothing = {
	bind: () => this,
	toString: () => "Nothing"
};

// ---------------------------------------------------------------------------

// These globals are set when onDeviceReady is called to make sure they exist
var device, AdMob;

var app = {
	adConfigs: {
		banner: {
			adId: 'ca-app-pub-2529384802310422/8448183594',
			autoShow: true
		},
		interstitial: {
			adId: 'ca-app-pub-2529384802310422/7035169192',
			autoShow: false
		}
	},

	initialize: function () {
		this.bindEvents();
	},

	bindEvents: function () {
		document.addEventListener('deviceready', this.onDeviceReady, false);
		document.addEventListener('resume', this.onResume, false);
	},

	onDeviceReady: function () {
		configureGlobals();
		configureAdMob();

		log("Info", "App has started.");
	},

	onResume: function () {
		displayAds();
	}
};

function configureGlobals() {
	device = window.device;
	AdMob = window.AdMob;
}

function configureAdMob() {
	if (AdMob) {
		maybeGetCoords().bind(coords => {
			app.adConfigs.banner.location = coords;
			app.adConfigs.interstitial.location = coords;
		});
		
		app.adConfigs.banner.position = AdMob.AD_POSITION.BOTTOM_CENTER;
		
		AdMob.prepareInterstitial(app.adConfigs.interstitial);
	}
}

function displayAds() {
	if (AdMob) {
		AdMob.isInterstitialReady(isReady => {
			if (isReady) { 
				AdMob.showInterstitial(); 
			}
		});
		
		AdMob.createBanner(app.adConfigs.banner);
	}
}

function log(messageType, message) {
//	var request = new XMLHttpRequest(),
//		queryString = createLogQueryString(messageType, message),
//		url = 'http://localhost:8001/' + queryString;
	
//	window.alert(messageType + ": " + message);
//	request.open('GET', url, true);
//	request.send();
}

function createLogQueryString(messageType, message) {
	var maybeCoords = maybeGetCoords(),

		latitude = maybeCoords.bind(coords => coords[0]),
		longitude = maybeCoords.bind(coords => coords[1]),

		paramNames = [
	        "platform=", "model=", "uuid=", "latitude=", 
	        "longitude=", "messageType=", "message="
	    ],
		params = [
	        device.platform, device.model, device.uuid,
	        latitude, longitude, messageType, message
	    ],

	    queryString = "?";

	params.forEach((param, index) => {
		queryString += paramNames[index] + encodeURIComponent(param);
	});

	return queryString;
}

function maybeGetCoords() {
	return maybeGetPosition().bind(position =>
		[position.coords.latitude, position.coords.longitude]
	);
}

function maybeGetPosition() {
	var maybePosition;

	navigator.geolocation.getCurrentPosition(
		position => {
			maybePosition = new Just(position);
		},
		error => {
			var details = error.code + ": " + error.message,
				errorMessage = "Failed to get location. " + details;
			
			log("Error", errorMessage);
			
			maybePosition = Nothing;
		}
	);

	return maybePosition;
}

window.onerror = (message, url, lineNumber, columnNumber) => {
	var details = "Line: " + lineNumber + ", Col: " + columnNumber + ", Url:" + url,
		errorMessage = message + " - " + details;
	
	log("Error", errorMessage);
};

app.initialize();
