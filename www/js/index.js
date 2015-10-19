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
	name: "WeatherNow",
	
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
			if (isReady)
				AdMob.showInterstitial(); 
		});
		
		AdMob.createBanner(app.adConfigs.banner);
	}
}

function log(messageType, message) {
	$.ajax({
		method: "POST",
		url: "http://localhost:3000/log",
		data: createLogJSON(messageType, message)
	});
}

function createLogJSON(messageType, message) {
	var location = maybeGetCoords().bind(coords => coords[0] + ", " + coords[1]);
	
	if (location === Nothing)
		location = "Unknown";
		
	return {
		"appId": app.name,
		"message": message,
		"messageType": messageType,
		"location": location,
		"uuid": device.uuid,
		"platform": device.platform,
		"model": device.model
	};
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
				errorMessage = "Failed to get location - " + details;
			
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
