
require('dotenv').config();
const express = require('express');
const app = express();
const passport = require('passport');
const expressWs = require('express-ws')(app);
const port = process.env.PORT || 5000;
let clients = 0


app.use(passport.initialize());
require("./config/passport");

app.get('/', function(req, res, next){
  console.log("Accessing Index");
  res.end();
});

app.get(
  '/auth/google',
	passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get(
	'/auth/google/callback',
	passport.authenticate('google', { failureRedirect: process.env.CLIENT, session: false }),
	function(req, res) {
		const token = req.user.token;
    console.log(req.user);
		res.redirect(`${process.env.CLIENT}?token=` + token);
	}
);

app.ws('/', function(ws, req) {
  ws.on('message', function(msg) {
    console.log(msg);
    ws.send(`You just said: ${msg}`)
  });
  ++clients
  ws.send('Hello! Message From Server!!')
  console.log('clients:', clients);

  ws.on('close', () => {
    --clients
    console.log(`user disconnected, Clients: ${clients}`);
});
});

app.listen(port, ()=> console.log(`Listening on port ${port}`));
