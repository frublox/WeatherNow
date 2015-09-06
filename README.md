# WeatherNow

In-progress.

## Building

To add the `browser` and `android` platforms, run `cordova platform add browser` and `cordova platform add android`, respectively.

Run `cordova build` to build the project for both Android and the browser, or specify one by adding `browser` or `android` after `cordova build`.

## Running

For the browser, use `cordova serve` to serve the files from localhost.

For Android, use `cordova emulate target='name_of_avd'` to run on an emulator or `cordova run --device` to run on an Android device connected with USB debugging turned on.
