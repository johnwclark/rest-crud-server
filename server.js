/*
 * This is a simple REST CRUD test program
 * written using node.js
 *
 * There is no persistence, so restarting will reset to the original data.
 * This was intentional, since the purpose was to provide a test server
 * that I could use the CRUD (create/read/update/delete) methods on.
 *
 */

'use strict';

var net = require('net');
function getNetworkIP(callback) {
  var socket = net.createConnection(80, 'www.google.com');
  socket.on('connect', function() {
    callback(undefined, socket.address().address);
    socket.end();
  });
  socket.on('error', function(e) {
    callback(e, 'error');
  });
}

// this is just some starting data
var portNum = 8303;
getNetworkIP(function (error, ip) {
    //console.log(ip);
	console.log( 'running on ' + ip + ':' + portNum );

    if (error) {
        console.log('error:', error);
    }
});


var journey = require('journey');
var http = require('http');

var mrouter = new (journey.Router)();

var testData = {
    'name': 'Neo',
    'agents': ['Smith', 'Brown', 'Jones' ],
    'spoon': false
};

mrouter.map(function () {
        // send and sendBody are different
        // root level URL
        this.root.bind(function (req, res) {
            res.send('welcome to REST CRUD test, use /data');
            });

        //GET request on /data
        this.get('/data').bind(function (req, res) {
            console.log( 'GET' );
            res.sendBody(JSON.stringify(testData));
            });

        //GET request on a specific data field - /data/field
        this.get(/^\/data\/([A-Za-z0-9_]+)$/).bind(function (req, res, field) {
            console.log( 'GET ' + field );
            res.sendBody(JSON.stringify(testData[field]));
            });

        //POST request on a specific data field - /data/field
        this.post(/^\/data\/([A-Za-z0-9_]+)$/).bind(function (req, res, field) {
            console.log( 'POST ' + field );
            testData[field] = 'new value';
            res.sendBody(JSON.stringify(testData[field]));
            });

        //PUT request on a specific data field - /data/field
        this.put(/^\/data\/([A-Za-z0-9_]+)$/).bind(function (req, res, field) {
            console.log( 'PUT ' + field );
            testData[field] = 'new value';
            res.sendBody(JSON.stringify(testData[field]));
            });

        //DELETE request on a specific data field - /data/field
        this.del(/^\/data\/([A-Za-z0-9_]+)$/).bind(function (req, res, field) {
                console.log( 'DELETE ' + field );
                testData[field] = undefined; // not sure about this
                res.sendBody('');
                });

        //POST request on a specific data field - /data/field/value
        this.post(/^\/data\/([A-Za-z0-9_]+)\/([A-Za-z0-9_]+)$/).bind(
                function (req, res, field, value) {
                console.log( 'POST ' + field + '=' + value );
                testData[field] = value;
                res.sendBody(JSON.stringify(testData[field]));
                });

        //PUT request on a specific data field - /data/field/value
        this.put(/\/data\/([A-Za-z0-9_]+)\/([A-Za-z0-9_]+)$/).bind(
                function (req, res, field, value) {
                console.log( 'PUT ' + field + '=' + value );
                testData[field] = value;
                res.sendBody(JSON.stringify(testData[field]));
                });

}); //end mapping


// create the server
// to test interactively I used http-console
http.createServer(function (request, response) {
		var body = '';
		request.addListener('data', function (chunk) { body += chunk;});
		request.addListener('end', function () {

			mrouter.handle(request, body, function (result) {
				response.writeHead(result.status, result.headers);
				response.end(result.body);
				});
			});
		}).listen(portNum);
