/* After deviceready fires, we can bind an event handler to show the OAuth consent 
page when the login button is tapped, and update the placeholder with the status of 
the OAuth dance after it completes.  We make that call to googleapi.authorize and
show the consent page the same as opening a popup from JavaScript using the window.open
method from the Cordova InAppBrowser plugin.
One problem is the consent window is pointing at a different origin, so according to 
the same origin policy, we are not allowed to access any details of its document, 
including the title. In Cordova the rules around the same origin policy are relaxed, 
like for AJAX requests, but I suspect we aren’t dealing with a fully specification 
conformant window object either. So the document title likely isn’t exposed in any 
way that would allow us to access it.
The authorization code isn’t set in the title until the very end of the OAuth flow, 
and we have no way of knowing when it is set. So we use InAppBrowser’s executeScript 
method to insert some code to use window.opener.postMessage to notify us when we have 
the authorization code.
The loadstart event will be fired by the InAppBrowser and includes the URL that 
InAppBrowser is about to load whenever the InAppBrowser’s location changes. So we 
need a way to detect and parse the authorization code from the URL.  There are two 
redirect URI options for installed applications.  We set redirect_uri: 'http://localhost'
Granting access redirects us to http://localhost?code=your_authorization_code. 
Denying access redirects us to http://localhost?error=access_denied. 
Since we don’t have an HTTP server running on our mobile device, we woulc see an
error page, but it doesn’t matter because we can detect the authorization code in 
the loadstart event handler and close the InAppBrowser before any errors are displayed.
Then we have an authorization code (or an error) and we can exchange it for an access token
*/
var googleapi = {
    setToken: function(data) {
        //Cache the token
        localStorage.access_token = data.access_token;
        //Cache the refresh token, if there is one
        localStorage.refresh_token = data.refresh_token || localStorage.refresh_token;
        //Figure out when the token will expire by using the current
        //time, plus the valid time (in seconds), minus a 1 minute buffer
        var expiresAt = new Date().getTime() + parseInt(data.expires_in, 10) * 1000 - 60000;
        localStorage.expires_at = expiresAt;
    },
    authorize: function(options) {
        var deferred = $.Deferred();

        //Build the OAuth consent page URL
        var authUrl = 'https://accounts.google.com/o/oauth2/auth?' + $.param({
            client_id: options.client_id,
            redirect_uri: options.redirect_uri,
            response_type: 'code',
            scope: options.scope
        });

        //Open the OAuth consent page in the InAppBrowser
        var authWindow = window.open(authUrl, '_blank', 'location=no,toolbar=no');

        //The recommendation is to use the redirect_uri "urn:ietf:wg:oauth:2.0:oob"
        //which sets the authorization code in the browser's title. However, we can't
        //access the title of the InAppBrowser.
        //
        //Instead, we pass a bogus redirect_uri of "http://localhost", which means the
        //authorization code will get set in the url. We can access the url in the
        //loadstart and loadstop events. So if we bind the loadstart event, we can
        //find the authorization code and close the InAppBrowser after the user
        //has granted us access to their data.
        authWindow.addEventListener('loadstart', googleCallback);
        function googleCallback(e){
            var url = (typeof e.url !== 'undefined' ? e.url : e.originalEvent.url);
            var code = /\?code=(.+)$/.exec(url);
            var error = /\?error=(.+)$/.exec(url);

            if (code || error) {
                //Always close the browser when match is found
                authWindow.close();
            }

            if (code) {
                //Exchange the authorization code for an access token
                $.post('https://accounts.google.com/o/oauth2/token', {
                    code: code[1],
                    client_id: options.client_id,
                    client_secret: options.client_secret,
                    redirect_uri: options.redirect_uri,
                    grant_type: 'authorization_code'
                }).done(function(data) {
                    googleapi.setToken(data);
                    deferred.resolve(data);
                }).fail(function(response) {
                    deferred.reject(response.responseJSON);
                });
            } else if (error) {
                //The user denied access to the app
                deferred.reject({
                    error: error[1]
                });
            }
        }

        return deferred.promise();
    },
    getToken: function(options) {
        var deferred = $.Deferred();

        if (new Date().getTime() < localStorage.expires_at) {
            deferred.resolve({
                access_token: localStorage.access_token
            });
        } else if (localStorage.refresh_token) {
            $.post('https://accounts.google.com/o/oauth2/token', {
                refresh_token: localStorage.refresh_token,
                client_id: options.client_id,
                client_secret: options.client_secret,
                grant_type: 'refresh_token'
            }).done(function(data) {
                googleapi.setToken(data);
                deferred.resolve(data);
            }).fail(function(response) {
                deferred.reject(response.responseJSON);
            });
        } else {
            deferred.reject();
        }

        return deferred.promise();
    },
    userInfo: function(options) {
        return $.getJSON('https://www.googleapis.com/oauth2/v1/userinfo', options);
    }
};

var app = {
    client_id: 'your_google_client_id_goes_here',
    client_secret: 'your_google_client_id_goes_here',
    redirect_uri: 'http://localhost',
    scope: 'https://www.googleapis.com/auth/userinfo.profile',

    init: function() {
        $('#login a').on('click', function() {
            app.onLoginButtonClick();
        });

        //Check if we have a valid token
        //cached or if we can get a new
        //one using a refresh token.
        googleapi.getToken({
            client_id: app.client_id,
            client_secret: app.client_secret
        }).done(function() {
            //Show the greet view if we get a valid token
            app.showGreetView();
        }).fail(function() {
            //Show the login view if we have no valid token
            app.showLoginView();
        });
    },
    showLoginView: function() {
        $('#login').show();
        $('#greet').hide();
    },
    showGreetView: function() {
        $('#login').hide();
        $('#greet').show();

        //Get the token, either from the cache
        //or by using the refresh token.
        googleapi.getToken({
            client_id: app.client_id,
            client_secret: app.client_secret
        }).then(function(data) {
            //Pass the token to the API call and return a new promise object
            return googleapi.userInfo({ access_token: data.access_token });
        }).done(function(user) {
            //Display a greeting if the API call was successful
            $('#greet h1').html('Hello ' + user.name + '!');
        }).fail(function() {
            //If getting the token fails, or the token has been
            //revoked, show the login view.
            app.showLoginView();
        });
    },
    onLoginButtonClick: function() {
        //Show the consent page
        googleapi.authorize({
            client_id: app.client_id,
            client_secret: app.client_secret,
            redirect_uri: app.redirect_uri,
            scope: app.scope
        }).done(function() {
            //Show the greet view if access is granted
            app.showGreetView();
        }).fail(function(data) {
            //Show an error message if access was denied
            $('#login p').html(data.error);
        });
    }
};

$(document).on('deviceready', function() {
    app.init();
});
