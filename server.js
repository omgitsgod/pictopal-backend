
require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const expressWs = require('express-ws')(app);
const port = process.env.PORT || 5000;
let clients = 0
let loggedIn = []
let logged = []

app.use(passport.initialize());
require("./config/passport");
app.use(session({ secret: process.env.SECRET, cookie: { maxAge: 60000 }}))

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
    req.session.user = req.user;
    console.log('session: ', req.session);
    logged.push(user)
    loggedIn.includes(user) ? null : loggedIn.push(user)
    console.log('Getting User:', loggedIn.map(x=> x.name));
		res.redirect(`${process.env.CLIENT}?token=` + token);
	}
);

app.get(
  'authenticate/:token' ,cors(), function(req, res) {

	}
);

app.get(
  '/logout/:token', cors(), function(req, res) {
    console.log('logging out: ', loggedIn.filter(x => x.token === req.params.token)[0].name);
    loggedIn = loggedIn.filter(x => x.token !== req.params.token)
    console.log('currently online: ', loggedIn.map(x=> x.name));
	}
);

app.get(
  '/getUser/:token', cors(), function(req, res) {
    const skim = ({email, name, profile}) => ({email, name, profile})
    const user = logged.filter(x => x.token === req.params.token)[0]
    console.log('logging in: ', user.name);
    console.log('currently online: ', loggedIn.map(x=> x.name));
    res.json(user)
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
