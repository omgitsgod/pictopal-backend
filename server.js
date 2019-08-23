
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
const routes = require('./routes')
const sockets = require('./sockets')
const {connectDb, models} = require('./src/models')
const redisClient = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
const redisStore = require('connect-redis')(session);
const expressWs = require('express-ws')(app);
const port = process.env.PORT || 5000;

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
app.use(cors({
  origin: 'https://pictopal.netlify.com',
  credentials: true
}));
function isLoggedIn(req, res, next) {
  if (req.session && req.session.passport) {
    next();
  } else {
    res.redirect("/");
  }
}

console.log(models);

connectDb()
  .then(() =>  console.log('connection succesful'))
  .catch((err) => console.error(err));

app.use('/', routes);

app.ws('/', sockets);

console.log('ws', app.ws);

app.listen(port, ()=> console.log(`Listening on port ${port}`));
