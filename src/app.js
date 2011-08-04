
/**
 * Module dependencies.
 */

var express = require('express');
var net = require('net');

var app = module.exports = express.createServer();


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
    
    sockets.forEach(pushDataToSockets, data);
  });

  socket.on('end', function() {
    console.log('on end');
  });

  socket.on('close', function() {
    console.log('on close');
  });

  socket.on('error', function() {
    console.log('on error');
  });

  //socket.pipe(socket);

});





socketServer.listen(8080, 'localhost');



console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
