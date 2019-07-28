
require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const url = require('url');
const redisURL = url.parse(process.env.REDIS_URL);
const redisAuth = redisURL.auth.split(':');
const redis = require('redis');
const redisClient = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
const redisStore = require('connect-redis')(session);
const expressWs = require('express-ws')(app);
const port = process.env.PORT || 5000;
let clients = 0
let loggedIn = []
let logged = []

console.log(redisAuth);
console.log('redisurl',redisURL);
console.log('redis port', redisURL.port);
console.log('redis host', redisURL.host);

redisClient.auth(redisAuth[1], ()=>console.log('Redis Authorized'))
redisClient.on('error', (err) => {
  console.log('Redis error: ', err);
});
redisClient.on('connect', ()=>{
    console.log('Connected to Redis');
});
app.use(session({
  secret: process.env.SECRET,
  name: 'PictoPal',
  resave:false,
  saveUninitialized: true,
  cookie: {secure: false, maxAge: 600000 },
  store: new redisStore({url:process.env.REDIS_URL}),
  clear: (err)=> console.log(err)
}))
app.set('trust proxy')
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport');
require('./src/models')
app.use(cors({
  origin: 'https://pictopal.netlify.com',
  credentials: true
}));
function isLoggedIn(req, res, next) {
  if (req.session.user !== undefined) {
    next();
  } else {
    res.redirect("/");
  }
}

console.log(connectDb);

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
	passport.authenticate('google', { failureRedirect: process.env.CLIENT, session: true }),
	function(req, res) {
    const user = req.user;
		const token = user.token;
    req.session.user = req.user;
    console.log('id: ', req.session.id);
    console.log('session: ', req.session);
    logged.push(user)
    loggedIn.includes(user) ? null : loggedIn.push(user)
    console.log('Getting User:', loggedIn.map(x=> x.name));
		res.redirect(`${process.env.CLIENT}`);
	}
);

app.get(
  '/test', function(req, res) {
    console.log(req.session);
    console.log('session id:', req.session.id)
    const sessionKey = `sess:${req.session.id}`
    redisClient.get(sessionKey, (err, data) => {
    console.log('session data in redis:', data)
  })
  res.status(200).send('OK');
	}
);

app.get(
  '/authenticate/:token', function(req, res) {

	}
);

app.get(
  '/logout/', function(req, res) {
    console.log('logging out: ', loggedIn.filter(x => x.token === req.session.user.token)[0].name);
    loggedIn = loggedIn.filter(x => x.token !== req.session.user.token)
    console.log('currently online: ', loggedIn.map(x=> x.name));
    req.session.destroy((err) => console.log(err))
    res.sendStatus(200)
	}
);

app.get(
  '/getUser', function(req, res) {
    if (req.session.user) {
    console.log('req.session test', req.session);
    console.log('id: ', req.session.id);
    const skim = ({email, name, photo}) => ({email, name, photo})
    if (logged.filter(x => x.token === req.session.user.token)[0]) {
    const user = logged.filter(x => x.token === req.session.user.token)[0]
    console.log('logging in: ', user.name);
    console.log('currently online: ', loggedIn.map(x=> x.name));
    res.status(200).json(user)
  } else {req.session.destroy((err) =>console.log(err))}
  }
	}
);
app.get(
  '/close', function(req, res) {
    req.session.store.clear((err) => console.log(err))
	}
);

app.get(
  '/onlineList', function(req, res) {
    const list = loggedIn.map(x => x.name)
    res.status(200).json(list)
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
