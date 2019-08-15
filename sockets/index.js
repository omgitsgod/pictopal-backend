const {models} = require('../src/models')
let {clients, liveList} = require('../constants')
let user;

sockets = (ws, req) => {
  if (req.session && req.session.passport) {
    models.User.findById(req.session.passport.user, (err, u) => {
      if (err) {
        console.log(err);
      } else {
        user = u
        console.log('YOU ARE ON THE SOCKET AS:', user.name);
        liveList.push(user)
      }
    })
  }
  ++clients
  ws.send('Hello! Message From Server!!')
  req.session.clientNum = clients
  ws.on('message', function(msg) {
    console.log(msg);
    console.log(req.session);
    ws.send(`You just said: ${msg}`)
  });
  console.log('clients:', clients);

  ws.on('close', () => {
    --clients
    console.log(`user disconnected, Clients: ${clients}`);
    liveList = liveList.filter(x => x.token !== req.session.user.token)
    console.log('livelist', liveList);
    req.session.clientNum = null
});
}
module.exports = sockets
