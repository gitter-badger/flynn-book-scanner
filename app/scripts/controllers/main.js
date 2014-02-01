'use strict';

// http://127.0.0.1:9000/#/book?isbn=9783499606601
var app = angular.module('flynnBookScannerApp');

app.factory('Base64', function() {
    var keyStr = 'ABCDEFGHIJKLMNOP' +
        'QRSTUVWXYZabcdef' +
        'ghijklmnopqrstuv' +
        'wxyz0123456789+/' +
        '=';
    return {
        encode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                    keyStr.charAt(enc1) +
                    keyStr.charAt(enc2) +
                    keyStr.charAt(enc3) +
                    keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
            } while (i < input.length);

            return output;
        },

        decode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                alert("There were invalid base64 characters in the input text.\n" +
                    "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                    "Expect errors in decoding.");
            }
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            do {
                enc1 = keyStr.indexOf(input.charAt(i++));
                enc2 = keyStr.indexOf(input.charAt(i++));
                enc3 = keyStr.indexOf(input.charAt(i++));
                enc4 = keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }

                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";

            } while (i < input.length);

            return output;
        }
    };
});

app.controller('BookController', ['$scope', '$http', '$location', '$resource', 'SettingsService', 'Base64', function ($scope, $http, $location, $resource, $settings, $base64) {
        var isbn = $location.search().isbn || '9783898646123',
            BookResource,
            credentials = $settings.load(),
            credentialsComplete = $settings.verify();

        if (!credentialsComplete) {
            $location.path("/settings");
        }

        $http.defaults.useXDomain = true;
        delete $http.defaults.headers.common['X-Requested-With'];
        $http.defaults.headers.post = {'Authorization': 'Basic ' + $base64.encode(credentials.user +':' + credentials.password), 'Content-Type': 'application/json' };

        BookResource = $resource(credentials.couchdb);

        function scan() {
            cordova.plugins.barcodeScanner.scan(
                function (result) {
                    alert('We got a barcode\n' +
                        'Result: ' + result.text + '\n' +  'Format: ' + result.format + '\n' +  'Cancelled: ' + result.cancelled);
                    retrieve(result.text);
                },
                function (error) {
                    alert('Scanning failed: ' + error);
                }
            );
        }

        function retrieve(isbn) {
            $http.get('https://www.googleapis.com/books/v1/volumes/?q=:isbn='+isbn+'&projection=full&maxResults=1').success(function(data) {
                $scope.books = data.items;
            }, function(error) {
                alert(JSON.stringify(error));
            });
        }

       function save(book) {
            var bookResource = new BookResource(book);
            bookResource.$save({
            }, function(data) {
                alert('Saving OK: ' + JSON.stringify(data));
            }, function(data) {
                alert('Failed: ' + JSON.stringify(data));
            });
        }

        retrieve(isbn);

        $scope.isbn = isbn;
        $scope.scan = scan;
        $scope.save = save;
        $scope.device = typeof cordova !== 'undefined';

 }]);

app.controller('SettingsController', ['$scope', '$location', 'SettingsService', function ($scope, $location, $settings) {
    var credentials = $settings.load(),
        defaultCouch = 'http://mmd.holisticon.de:5984/books/';

    function save() {
        $settings.save($scope.user, $scope.password, $scope.couchdb);
        $location.path("/book");
    }
    $scope.user = credentials.user;
    $scope.password = credentials.password;
    $scope.couchdb = credentials.couchdb || defaultCouch;
    $scope.save = save;
}]);

app.service('SettingsService',['localStorageService', function (localStorage){
    return {
        save: function(user, password, couchdb) {
            localStorage.clearAll();
            localStorage.add('settings', {'user': user, 'password' : password, 'couchdb': couchdb});
        },
        load: function() {
            var settings = localStorage.get('settings');
            if (settings) {
                return settings;
            } else {
                return {}
            }
        },
        verify: function() {
            var credentials = this.load();
            return (credentials && credentials.user && credentials.password && credentials.couchdb);
        }
    };

}]);