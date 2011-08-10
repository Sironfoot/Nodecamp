
/**
 * Module dependencies.
 */

var express = require('express');
var net = require('net');
var crypto = require("crypto");
var WebSocketServer = require('websocket').server;

var app = module.exports = express.createServer();

function showProps(obj)
{
  for(var prop in obj)
  {
    if(obj.hasOwnProperty(prop))
    {
      console.log(prop);
    }
  }
}

function showAllProps(obj)
{
  for(var prop in obj)
  {
    console.log(prop);
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

// Routes

//showAllProps(app);

app.get('/', function(req, res){ 

  //console.log('Connect props...')
  //console.log(showProps(req));

  

  res.render('index', {
    title: 'Nodecamp chatroom'
  });
});

app.on('upgrade', function(req, res) {
  console.log('Upgrading...');

  console.log(req.headers);
});



app.listen(3000);


var connections = [];

wsServer.on('request', function(request) {

  var connection = request.accept('chat', request.origin);

  connections.push(connection);


  console.log((new Date()) + ' Connection accepted (' + connection.remoteAddress +').');

  connection.on('message', function(message) {
    if (message.type == 'utf8') {

      var command = JSON.parse(message.utf8Data);

      if(command.type == 'setName') {
        connection.clientId = command.id;
        connection.name = command.value;

        connections.forEach(function(element, index, array) {
          if(element !== connection) {
            connection.sendUTF(JSON.stringify({
              id: command.id,
              type: 'setName',
              value: command.value
            }));
          }
        });
      }
      else if (command.type == 'message') {
        
      }

      //console.log('Received message: ' + message.utf8Data);
      //connection.sendUTF('You said: "' + message.utf8Data + '"');
    }
    else if (message.type == 'binary') {
      console.log('Received Binary Message of ' + message.binaryData.length + ' bytes.');
    }
  });

  connection.on('close', function(connection) {
    console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
  });
});


console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
