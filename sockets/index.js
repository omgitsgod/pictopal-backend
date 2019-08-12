const {models} = require('../src/models')
let {clients, liveList} = require('../constants')

sockets = (ws, req) => {
  if (req.session && req.session.passport) {
    let user
    models.User.findById(req.session.passport.user, (err, u) => {
      if (err) {
        console.log(err);
      } else {
        user = u
      }
    }
    console.log("you are on the socket as", user);
  }
  ws.on('message', function(msg) {
    console.log(msg);
    console.log(req.session);
    ws.send(`You just said: ${msg}`)
  });
  ++clients
  ws.send('Hello! Message From Server!!')
  console.log('clients:', clients);

  ws.on('close', () => {
    --clients
    console.log(`user disconnected, Clients: ${clients}`);
});
}
module.exports = sockets
