const express = require('express');
const app = express();
const expressWs = require('express-ws')(app);
const port = process.env.PORT || 5000;

app.use(function (req, res, next) {
  console.log('middleware');
  req.testing = 'testing';
  return next();
});

app.get('/', function(req, res, next){
  console.log('get route', req.testing);
  res.end();
});

app.ws('/', function(ws, req) {
  ws.on('message', function(msg) {
    console.log(msg);
    ws.send(`You just said: ${msg}`)
  });
  ws.send('Hello! Message From Server!!')
  console.log('clients:', req.testing);
  ws.on('close', () => {
    console.log('disconnected');
});
});

app.listen(port, ()=> console.log("helllooooo"));
