/* A "Hello World" example of using node-dogecoin to access
 * dogecoind via JSON-RPC. Retreives the current wallet balance.
 *
 * Either run dogecoind directly or run dogecoin-qt with the -server
 * command line option. Make sure you have a ~/.dogecoin/dogecoin.conf
 * with rpcuser and rpcpassword config values filled out. Note that
 * newer versions of dogecoin (1.5 and above) don't allow identical
 * your rpc username and password to be identical.
 *
 */

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
