/*
* Primary file for the api
*
*/

// Dependencies
var http = require('http');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;

// Create server
var httpServer = http.createServer(function (request, response) {

    // Get url and parse it
    var parseUrl = url.parse(request.url, true);

    // Get the path
    var path = parseUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Get the query string as an object
    var queryStringObject = parseUrl.query;

    // Get http method
    var method = request.method.toLowerCase();

    // Get headers as an object
    var headers = request.headers;

    // Get payloads, if any
    var decoder = new StringDecoder('utf-8');
    var buffer = '';
    request.on('data', function (data) {
        buffer += decoder.write(data);
    });

    request.on('end', function () {
        buffer += decoder.end();

        // Choose the handler 
        var chooseHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        // Data to send to the handler
        var data = {
            'trimmedPath' : trimmedPath,
            'queryStringObject' : queryStringObject,
            'method' : method,
            'headers' : headers,
            'payload' : buffer
        };

        chooseHandler(data, function (statusCode, payload) {
            // Use the status code called by the handler, or default to 200
             statusCode = typeof(statusCode)  == 'number' ? statusCode : 200;
             
             // Use the payload called back by the handler, or default to an empty object
             payload = typeof(payload) == 'object' ? payload : {};
             
             // Convert payload object to string
             var payloadString = JSON.stringify(payload);
            
             // Return the response
             response.setHeader('Content-Type', 'application/json');
             response.writeHead(statusCode);
             response.end(payloadString);
            
             //Log the request path
             console.log('Returning this response: ', statusCode, payloadString);
         });
    });
});

// Start the server
httpServer.listen(3000, function () {
    console.log('Listening on port: ' + 3000);
});

// Define the handlers
var handlers = {};

// Hello handler
handlers.hello = function (data, callback) {
    callback(200, {message : "Hello there"})
}

// Not found handler
handlers.notFound = function (data, callback) {
    callback(404);
}

// Define a request router
var router = {
    'hello' : handlers.hello
};