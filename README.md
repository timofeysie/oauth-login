## Oath Login

This project is a collection of OAuth sample applications to explore the different approaches to OAuth for hybrid mobile projects.
There are currently two sub-projects split into two directories.  The notes for each are below.

## PhoneGap JQuery App

Example demonstrating how to use Google's OAuth with PhoneGap based on Michael Dellanoce's Google API OAuth Phonegap tutorial.
This is a JQuery solution which uses the InAppBrowser plugin. 

This project works with Google+ only.  You must replace your Google+ app credentials in the index.js file.

    client_id: 'your_google_client_id_goes_here',
    client_secret: 'your_google_client_id_goes_here',

# Running the example

1. from the phonegapp-js-app directory run:```$ npm install```
2. Add a platform, for example ios: ```$ cordova platform add ios```
3. Build the platform's project: ```$cordova build ios```
4. Launch the platform's simulator: ```cordova emulate ios```
5. Run on a device.  The iOS project by double clicking on the X code project file in the following directory:

``ionic-app/platforms/ios/GoogleOauthPhonegap.xcodeproj``

This is normally only done on Mac and requires an Apple Developers license.
For Android, you can use the debug.keystore in the ant.properties file and copy the .apk file from the directory below to you device. 

``ionic-app/platforms/android/ant-build/CordovaApp-debug.apk``


## Ionic App

Ionic Cordova Oauth Login demo project based on the Ionic Starter App by Nic Raboy.

To test, replace "ID_HERE" with your Facebook credentials in the ionic-app/www/js/app.js file to test the Ionic app.
$cordovaOauth.facebook("ID_HERE", ...

Currently works with Facebook OAuth.  Working on Google+.

# Running the example

1. from the ionic-aoo directory: ```$ npm install```
2. Add a platform: ```$ ionic platform add ios/android```
3. Build the app: ```$ ionic build ios/android```
4. Test (You must have appropriate emulators installed for this step):```$ ionic emulate ios/android```
5. Run on a device.  The iOS project by double clicking on the X code project file in the following directory:

``phonegap-js-app/platforms/ios/GoogleOauthPhonegap.xcodeproj``

This is normally only done on Mac and requires an Apple Developers license.
For Android, you can use the debug.keystore in the ant.properties file and copy the .apk file from the directory below to you device. 
```phonegap-js-app/platforms/android/ant-build/CordovaApp-debug.apk```

## Notes

Be aware that the the code for Android apk files can be read by unzipping the repository and therefore you should find a alternative method for storing your private ids.  One solution by [Lam Tran]([I'm an inline-style link](https://www.google.com)) states that he "sends the code value up to my server. I then do the call to Google on the server to get the access_token. This way, the client_secret lives on the server".

In the comments Lam points out that you should authenticate with your own server before authenticating with Google so that you know you are talking to your own backend and not someone elses.

## Links

[Google API OAuth with PhoneGap's InAppBrowser](http://phonegap-tips.com/articles/google-api-oauth-with-phonegaps-inappbrowser.html)

[Using An Oauth 2.0 Service With IonicFramework](https://blog.nraboy.com/2014/07/using-oauth-2-0-service-ionicframework/)
