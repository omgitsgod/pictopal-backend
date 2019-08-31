const {models} = require('../src/models');
let {clients, liveList} = require('../constants');
let user;

sockets = (ws, req) => {
  if (req.session && req.session.passport) {
    models.User.findById(req.session.passport.user, (err, u) => {
      if (err) {
        console.log(err);
      } else {
        user = u;
        console.log('YOU ARE ON THE SOCKET AS:', user.name);
        liveList.push(user);
      }
    })
  }
  if (clients === 0) {
    req.session.ws = 'host';
  } else {
    req.session.ws = 'client';
  }
  ++clients;
  console.log('clients:', clients);

  ws.on('message', (msg) => {
    console.log(req.session);
    if (req.session.ws === 'host') {
      ws.send(msg);
      console.log("incoming: ", msg);
      console.log("msg type: ", typeof msg)
    } else {
      console.log("else else else");
    }
  });

  ws.on('close', () => {
    --clients;
    console.log(`user disconnected, Clients: ${clients}`);
    liveList = liveList.filter(x => x.token !== req.session.user.token);
    console.log('livelist', liveList);
    req.session.ws = null
  });
};
module.exports = sockets;
