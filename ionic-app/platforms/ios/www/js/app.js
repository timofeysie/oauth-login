// Based on the Ionic Starter App by Nic Raboy.
var app = angular.module('starter', ['ionic', 'ngStorage', 'ngCordova'])

var fb_clientId = "1442923555932613";
var google_requestToken = "";
var google_accessToken = "";
var google_clientId = "894630188452-c1vat825u58ohi9pqn85kp78gfgcnd5i.apps.googleusercontent.com";
var google_clientSecret = "R_JnLzpMcNY4i-apFkCdeb6O";

app.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if(window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if(window.StatusBar) {
            StatusBar.styleDefault();
        }
    });
});

app.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('login', {
            url: '/login',
            templateUrl: 'templates/login.html',
            controller: 'LoginController'
        })
        .state('profile', {
            url: '/profile',
            templateUrl: 'templates/profile.html',
            controller: 'ProfileController'
        })
        .state('feed', {
            url: '/feed',
            templateUrl: 'templates/feed.html',
            controller: 'FeedController'
        })
        .state('secure', {
                url: '/secure',
                templateUrl: 'templates/secure.html',
                controller: 'SecureController'
            });
    $urlRouterProvider.otherwise('/login');
});

app.controller("LoginController", function($scope, $http, $cordovaOauth, $localStorage, $location) {
    $scope.fb_login = function() {
        $cordovaOauth.facebook(fb_clientId, ["email", "read_stream", "user_website", "user_location", "user_relationships"]).then(function(result) {
            $localStorage.google_accessToken = result.access_token;
            $location.path("/profile");
        }, function(error) {
            alert("There was a problem signing in!  See the console for logs");
            console.log(error);
        });
    };
    $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
 
    $scope.google_login = function() {
        var ref = window.open('https://accounts.google.com/o/oauth2/auth?client_id=' + googl_clientId + '&redirect_uri=http://localhost/callback&scope=https://www.googleapis.com/auth/urlshortener&approval_prompt=force&response_type=code&access_type=offline', '_blank', 'location=no');
        ref.addEventListener('loadstart', function(event) { 
            if((event.url).startsWith("http://localhost/callback")) {
                google_requestToken = (event.url).split("code=")[1];
                $http({method: "post", url: "https://accounts.google.com/o/oauth2/token", data: "client_id=" + google_clientId + "&client_secret=" + google_clientSecret + "&redirect_uri=http://localhost/callback" + "&grant_type=authorization_code" + "&code=" + google_requestToken })
                    .success(function(data) {
                        google_accessToken = data.access_token;
                        $location.path("/secure");
                    })
                    .error(function(data, status) {
                        alert("ERROR: " + data);
                    });
                ref.close();
            }
        });
    }

    if (typeof String.prototype.startsWith != 'function') {
        String.prototype.startsWith = function (str){
            return this.indexOf(str) == 0;
        };
    }
});

app.controller('SecureController', function($scope, $http) {
    $scope.google_accessToken = google_accessToken; 
});

app.controller("ProfileController", function($scope, $http, $localStorage, $location) {
    $scope.init = function() {
        if($localStorage.hasOwnProperty("google_accessToken") === true) {
            $http.get("https://graph.facebook.com/v2.2/me", { params: { access_token: $localStorage.google_accessToken, fields: "id,name,gender,location,website,picture,relationship_status", format: "json" }}).then(function(result) {
                $scope.profileData = result.data;
            }, function(error) {
                alert("There was a problem getting your profile.  Check the logs for details.");
                console.log(error);
            });
        } else {
            alert("Not signed in");
            $location.path("/login");
        }
    };
});

app.controller("FeedController", function($scope, $http, $localStorage, $location) {
    $scope.init = function() {
        if($localStorage.hasOwnProperty("google_accessToken") === true) {
            $http.get("https://graph.facebook.com/v2.2/me/feed", { params: { access_token: $localStorage.google_accessToken, format: "json" }}).then(function(result) {
                $scope.feedData = result.data.data;
                $http.get("https://graph.facebook.com/v2.2/me", { params: { access_token: $localStorage.google_accessToken, fields: "picture", format: "json" }}).then(function(result) {
                    $scope.feedData.myPicture = result.data.picture.data.url;
                });
            }, function(error) {
                alert("There was a problem getting your profile.  Check the logs for details.");
                console.log(error);
            });
        } else {
            alert("Not signed in");
            $location.path("/login");
        }
    };
});
