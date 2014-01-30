
/* Copy config.json.template to config.json and fill in your
 * rpc username and password. */
var config = require('config');

var dogecoin = require('node-dogecoin')({
      host: config.rpchost,
      port: config.rpcport,
      user: config.rpcuser,
      pass: config.rpcpassword
    });

dogecoin.getBalance(function(err, balance) {
  if (err) {
    return console.error('Failed to fetch balance', err.message);
  }
  console.log('DOGE balance is', balance);
});
