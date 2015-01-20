OauthLogin Example For Ionic Framework
======================================

This example demonstrates how to use ngCordova to authenticate with Facebook and retrieve
an access token for use with the Facebook REST API.


Requirements
-------------

* Apache Cordova 3.5+
* [Apache Cordova InAppBrowser Plugin](http://cordova.apache.org/docs/en/3.0.0/cordova_inappbrowser_inappbrowser.md.html)
* [ngCordova](http://www.ngcordova.com)

    $ ionic platform add android
    $ cordova plugin add https://git-wip-us.apache.org/repos/asf/cordova-plugin-inappbrowser.git

The above commands will add the Android build platform and install the required Apache InAppBrowser plugin.

This example application requires you to have your own Facebook application registered with Facebook.com.  Doing so
will give you a unique client id that can be included into your project.  When registering your application with Facebook,
make sure to set the callback uri to **http://localhost/callback**, otherwise ngCordova will not function.

With the client id in hand, open **www/js/app.js** and find the following line:

    $cordovaOauth.facebook("CLIENT_ID_HERE", ["email", "read_stream", "user_website", "user_location", "user_relationships"])

You will want to replace **CLIENT_ID_HERE** with the official key.


Usage
-------------

With this example project configured on your computer, run the following from the Terminal or command prompt:

    $ ionic build android

Install the application binary to your device or simulator.

The application is currently composed of three parts and makes use of two of the official Facebook RESTful APIs.

1. Oauth sign in
2. Basic profile (GET /me)
3. Basic stream (GET /me/feed)

You will be required to sign into the application using your own Facebook username and password.  Once logged in, you can
view very basic information found in your profile or navigate to your stream.  The stream will show posts with a comment and
like count.

