
/**
 * Module dependencies.
 */

var express = require('express');
var net = require('net');

var app = module.exports = express.createServer();



Array.prototype.remove = function(e) {
  for (var i = 0; i < this.length; i++)
    if (e == this[i]) return this.splice(i, 1);
}


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

app.get('/', function(req, res){
  res.render('index', {
    title: 'Express'
  });
});

app.listen(3000);

function pushDataToSockets(element, index, array)
{
  element.write(index + ': ' + this);
}

var sockets = [];

var socketServer = net.createServer(function(socket) {

  sockets.push(socket);

  console.log(sockets.length + ' socket(s)');
  
  socket.on('data', function(data) {
    
    //sockets.forEach(pushDataToSockets, data);

    var dataString = data.toString('binary');

    var lines = dataString.split('\r\n');

    var headers = {};

    lines.forEach(function(element, index, array) {
      if(element.length > 0 && element.indexOf('GET') !== 0)
      {
        var keyValue = element.split(': ');
        var key = keyValue[0];
        var value = keyValue[1];

        headers[key] = value;
      }
    });

    console.log(headers);

    console.log('The key is: ' + headers['Sec-WebSocket-Key']);
  });

  socket.on('end', function() {
    console.log('on end');
  });

  socket.on('close', function() {

    sockets.remove(socket);

    console.log('on close');
  });

  socket.on('error', function() {
    console.log('on error');
  });

  socket.write('hello world');

  //socket.pipe(socket);

});





socketServer.listen(8080, 'localhost');



console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
