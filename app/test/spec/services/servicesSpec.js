var cordova;

describe('main', function() {

  // load the controller's module
  beforeEach(module('flynnBookScannerApp'));

  describe("GoogleBookService", function() {

    var service,
      httpBackend,
      settings;

    // Initialize the controller and a mock scope
    beforeEach(inject(function(GoogleBookService, $httpBackend) {
      service = GoogleBookService;
      httpBackend = $httpBackend;
    }));


    it('Init module failed', function() {
      expect(true).toBe(true);
    });

    it('do empty search', function() {
      var searchQuery = {};
      searchQuery.isbn = '9783898646123';
      var response = {};
      response.books = null;
      httpBackend.when("GET", "https://www.googleapis.com/books/v1/volumes/?q=:isbn=3898646122&projection=full&key=undefined").respond(response);
      var promise = service.search(searchQuery),
        books = null;
      promise.then(function(response) {
        books = response.books;
      });
      httpBackend.flush();
      //  scope.search();
    });

    it('do isbn search', function() {
      var validBookEntry = {
        "kind": "books#volumes",
        "totalItems": 77,
        "items": [{
          "kind": "books#volume",
          "id": "lwz8ZwEACAAJ",
          "etag": "b3Rk7DgfRR8",
          "selfLink": "https://www.googleapis.com/books/v1/volumes/lwz8ZwEACAAJ",
          "volumeInfo": {
            "title": "EJB 3.1 professionell",
            "subtitle": "Grundlagen- und Expertenwissen zu Enterprise JavaBeans 3.1 - inkl. JPA 2.0",
            "publishedDate": "2011",
            "industryIdentifiers": [{
              "type": "ISBN_10",
              "identifier": "3898646122"
            }, {
              "type": "ISBN_13",
              "identifier": "9783898646123"
            }],
            "readingModes": {
              "text": false,
              "image": false
            },
            "pageCount": 592,
            "printType": "BOOK",
            "contentVersion": "preview-1.0.0",
            "language": "de",
            "previewLink": "http://books.google.de/books?id=lwz8ZwEACAAJ&dq=:isbn%3D3898646122&hl=&cd=1&source=gbs_api",
            "infoLink": "http://books.google.de/books?id=lwz8ZwEACAAJ&dq=:isbn%3D3898646122&hl=&source=gbs_api",
            "canonicalVolumeLink": "http://books.google.de/books/about/EJB_3_1_professionell.html?hl=&id=lwz8ZwEACAAJ"
          },
          "saleInfo": {
            "country": "DE",
            "saleability": "NOT_FOR_SALE",
            "isEbook": false
          },
          "accessInfo": {
            "country": "DE",
            "viewability": "NO_PAGES",
            "embeddable": false,
            "publicDomain": false,
            "textToSpeechPermission": "ALLOWED",
            "epub": {
              "isAvailable": false
            },
            "pdf": {
              "isAvailable": false
            },
            "webReaderLink": "http://books.google.de/books/reader?id=lwz8ZwEACAAJ&hl=&printsec=frontcover&output=reader&source=gbs_api",
            "accessViewStatus": "NONE",
            "quoteSharingAllowed": false
          }
        }]
      };
      var searchQuery = {};
      searchQuery.isbn = '9783898646123';
      var response = {};
      response.books = [validBookEntry];
      httpBackend.when("GET", "https://www.googleapis.com/books/v1/volumes/?q=:isbn=3898646122&projection=full&key=undefined").respond(response);
      var promise = service.search(searchQuery),
        books = null;

      promise.then(function(response) {
        books = response.books;
      });
      httpBackend.flush();
      //expect(scope.books.length).toEqual(1);
    });
  });
});