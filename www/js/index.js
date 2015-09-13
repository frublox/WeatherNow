/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var position = null;

var app = {
    initialize: function() {
        this.bindEvents();
    },

    // Common events are: 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onDeviceReady: function() {
        app.receivedEvent('deviceready');

        showAd();
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {

    }
};

function setPosition() {
    navigator.geolocation.getCurrentPosition(
        function (pos) {
            position = pos;
        },
        function (error) {
            log("Error", "Failed to get location. " + error.code + ": " + error.message);
        }
    );
}

function showAd() {
    var admobid = {        
        banner:         'ca-app-pub-2529384802310422/8448183594',
        interstitial:   'ca-app-pub-2529384802310422/7035169192'
    };

    options = { 
        adId: admobid.banner, 
        position: AdMob.AD_POSITION.BOTTOM_CENTER, 
        autoShow: true
    };

    if (position) {
        options.location = [coords.latitude, coords.longitude];
    }

    if (AdMob) {
        AdMob.createBanner(options);
    }
}

// Sends a message to the logging server
// messageType can be "Error" or "Info"
function log(messageType, message) {
    request = new XMLHttpRequest();
    request.onreadystatechange = function () {};

    content = device.platform + "\n" + device.model + "\n" + messageType + "\n" + message;

    http.open('GET', 'http://localhost/' + content, true);
    http.send(null);
}

app.initialize();
