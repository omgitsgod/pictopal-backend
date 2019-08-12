const {models} = require('../src/models')
let {clients, liveList} = require('../constants')

sockets = (ws, req) => {
  ws.on('connection', () => {
    console.log("YOU ARE CONNECTED");
  })
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
