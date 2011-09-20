
/**
 * Module dependencies.
 */

var express = require('express');
var net = require('net');
var crypto = require("crypto");
var WebSocketServer = require('websocket').server;

var app = module.exports = express.createServer();

function showProps(obj, ownPropsOnly) {
  for(var prop in obj) {
    if(ownPropsOnly && obj.hasOwnProperty(prop)) {
      console.log(prop);
    }
  }
}

Array.prototype.remove = function(e) {
  for (var i = 0; i < this.length; i++)
    if (e == this[i]) return this.splice(i, 1);
}

var wsServer = new WebSocketServer({
  httpServer: app,
  autoAcceptConnections: false
});


// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'your secret here' }));
  app.use(express.compiler({ src: __dirname + '/public', enable: ['less'] }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

var clients = [];

// Routes

app.get('/', function(req, res){  

  var clientId = req.cookies['clientid'];

  res.render('index', {
    title: 'Nodecamp chatroom',
    clients: clients,
    currentClientId: clientId
  });
});


app.listen(3000);

wsServer.on('request', function(request) {

  var connection = request.accept('chat', request.origin);

  var client = {};
  client.connection = connection;
  clients.push(client);

  

  connection.on('message', function(message) {
    if (message.type == 'utf8') {

      var command = JSON.parse(message.utf8Data);

      if(command.type == 'init') {
        client.id = command.id;
        client.name = command.value;
        
        console.log('+ ' + client.id + ' connected.');

        clients.forEach(function(element, index, array) {
          if(element !== client) {
            element.connection.sendUTF(JSON.stringify({
              id: element.id,
              type: 'addClient',
              value: element.name
            }));
          }
        });
        
        
      }
      else if(command.type == 'setName') {
        client.name = command.value;

        clients.forEach(function(element, index, array) {
          if(element !== client) {
        	element.connection.sendUTF(JSON.stringify({
              id: client.id,
              type: 'setName',
              value: command.value
            }));
          }
        });
      }
      else if (command.type == 'message') {
        
        clients.forEach(function(element, index, array) {
        	if (element !== client) {
        		element.connection.sendUTF(JSON.stringify({
        			id: client.id,
        			type: 'message',
        			value: command.value
        		}));
        	}
        });
      }


      //console.log('Received message: ' + message.utf8Data);
      //connection.sendUTF('You said: "' + message.utf8Data + '"');
    }
    else if (message.type == 'binary') {
      console.log('Received Binary Message of ' + message.binaryData.length + ' bytes.');
    }
  });

  connection.on('close', function(connection) {
    console.log('- ' + client.id + ' disconnected.');

    clients.remove(client);

    clients.forEach(function(element, index, array) {
      element.connection.sendUTF(JSON.stringify({
        id: client.id,
        type: 'removeClient',
        value: client.name
      }));
    });
  });
});


console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
