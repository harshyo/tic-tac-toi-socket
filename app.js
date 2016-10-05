var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();


var server = http.createServer(app);
var io = require('socket.io').listen(server);
server.listen(3000, function(a){
    console.log(a);
});


app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});
var clientIds = [];
var addClientWithNames = [];
io.on('connection', function (client) {
  clientIds.push(client.id);
  console.log('ID: '+client.id);
  console.log('total user :'+clientIds.length);
  client.join('allTogether');
    client.on('startGame', function(data){
      io.to('allTogether').emit('newGamer', {"name": data.name});
      addClientWithNames.push({'name' : data.name, 'id':client.id});
      io.to('allTogether').emit('list',{'list': addClientWithNames});
    /*clientIds.forEach(function(clientId){
      console.log('text  to : '+clientId)
      if(client.id != clientId){

      }
    })*/

  });

  client.on('myTurnOver',function(data){
    console.log("---myTurnOver---");
    console.log(data);
    io.to('allTogether').emit('nowYourTurn',data);
  });

  client.on('disconnect', function(){
      clientIds.splice(clientIds.indexOf(client.id),1);
      console.log(new Date()+"client disconnnect id : "+client.id +'    ...now total : '+clientIds.length);
    var i = 0;
      addClientWithNames.forEach(function(data){

            if(data.id == client.id){
              addClientWithNames.splice(i,1);
            }
        i++;
      });

    io.to('allTogether').emit('list',{'list': addClientWithNames});

  });
  /*socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });*/
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
