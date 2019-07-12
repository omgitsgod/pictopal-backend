
require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const passport = require('passport');
const expressWs = require('express-ws')(app);
const port = process.env.PORT || 5000;
let clients = 0
let logged = []

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
    const user = req.user;
		const token = user.token;
    logged.push(user)
    console.log(logged);
		res.redirect(`${process.env.CLIENT}?token=` + token);
	}
);

app.get(
  '/getUser/:token', cors(), function(req, res) {
    const skim = ({email, name}) => ({email, name})
    const user = logged.filter(x => x.token === req.params.token)[0]
    console.log(user);
    res.json({hello: 'hello'})
	}
);

app.get(
  '/logout', function(req, res) {

    console.log(logged);
		res.redirect(process.env.CLIENT);
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
