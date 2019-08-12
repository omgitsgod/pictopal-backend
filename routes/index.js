const routes = require('express').Router()
const passport = require('passport');
const {connectDb, models} = require('../src/models')
require('../config/passport');
let {logged, loggedIn, liveList} = require('../constants')


routes.get('/', function(req, res, next){
  console.log("Accessing Index");
  res.end();
});

routes.get(
  '/auth/google',
	passport.authenticate('google', { scope: ['profile', 'email'] })
);

routes.get(
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

routes.get(
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

routes.get(
  '/authenticate/:token', function(req, res) {

	}
);

routes.get(
  '/logout/', function(req, res) {
    console.log('logging out: ', loggedIn.filter(x => x.token === req.session.user.token)[0].name);
    loggedIn = loggedIn.filter(x => x.token !== req.session.user.token)
    console.log('currently online: ', loggedIn.map(x=> x.name));
    req.session.destroy((err) => console.log(err))
    res.sendStatus(200)
	}
);

routes.get(
  '/getUser', function(req, res) {
    if (req.session.passport) {
      console.log('req.session test', req.session);
      console.log('id: ', req.session.id);
    //  const skim = ({email, name, photo}) => ({email, name, photo})
    models.User.findById(req.session.passport.user, (err, user) => {
      if (err) {
        console.log(err);
      } else {
        if (logged.filter(x => x.token === req.session.user.token)[0]) {
           //const user = logged.filter(x => x.token === req.session.user.token)[0]

           console.log('logging in: ', user.name);
           console.log('currently online: ', loggedIn.map(x=> x.name));
           res.status(200).json(user)
         } else {req.session.destroy((err) =>console.log(err))}
      }
    })
    }
	}
);
routes.get(
  '/close', function(req, res) {
    req.session.store.clear((err) => console.log(err))
	}
);

routes.get(
  '/onlineList', function(req, res) {
    const list = loggedIn.map(x => x.name)
    res.status(200).json(list)
  }
);
routes.get(
  '/liveList', function(req, res) {
    const list = liveList.map(x => x.name)
    res.status(200).json(list)
  }
);

routes.loggedIn = loggedIn;
routes.logged = logged;

module.exports = routes;
