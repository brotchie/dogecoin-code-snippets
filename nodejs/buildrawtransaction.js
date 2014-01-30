/* Builds and signs a raw transaction given a transaction output
 * and its associated private key. Note that these keys are valid
 * on dogecoin testnet and won't be accepted by dogecoind running
 * on the main doge blockchain (real doge addresses start with D).
 */

/* Copy config.json.template to config.json and fill in your
 * rpc username and password. */
var config = require('config'),
    async = require('async');

var dogecoin = require('node-dogecoin')({
      host: config.rpchost,
      port: config.rpcport,
      user: config.rpcuser,
      pass: config.rpcpassword
    });

/* The transaction. In order to spend a transaction you must know the
 * transaction id, a private key, and the output of the transaction
 * associated with that private key.
 */
var tx = {
  txid: 'ffa2c2058f0bc010fa391100ed7fdef0393acffcd9dd16082677a6c2479d208b',
  vout: 0,
  amount: 482080,
  public_address: 'nh78WoMnS9F7GF266YHEq8Y9K66CV3z2C8',
  private_key:'chG1LhVjM5vnfmFdo95Ge5G132zsFt2PSLGj1e5gtWdsG3bDfJQe'
};

/* We create a transaction spending the above transaction to this
 * destination public address. */
var destination_address = 'nr2Yu21WoUGMb4pLhagcqNYHeUsJwwQBhu';

async.waterfall([
    function(next) {
      /* Inputs is an array of objects specifing the
       * spendable transaction outputs to be included
       * in the new transaction. */
      var inputs = [{txid: tx.txid, vout: tx.vout}];

      /* Outputs is an object where each key is a public
       * address and each value is the amount to
       * send to that address. */
      var outputs = {};
      /* Leave one DOGE unspent as transaction fee. */
      outputs[destination_address] = tx.amount - 1;

      dogecoin.createRawTransaction(inputs, outputs, next);
    },
    function(unsigned_hex, next) {
      console.log('Raw unsigned transaction', unsigned_hex);

      /* We have a unsigned hex representation of the transaction.
       * To spend it we have sign it with all the private keys of the
       * inputs. Because this private key isn't in our wallet, we must
       * supply the private key as the third parameter. */
      dogecoin.signRawTransaction(unsigned_hex, [], [tx.private_key], next);
    },
    function(response, next) {
      if (!response.complete) {
        next(new Error('Incomplete transaction'));
      } else {
        console.log('Raw signed transaction', response.hex);
        next(null, response.hex);
      }
    },
    function(signed_hex, next) {
      /* Decode the signed transaction so we can print out
       * its JSON representation. */
      dogecoin.decodeRawTransaction(signed_hex, next);
    }
], function(err, decoded) {
  if (err) {
    console.error(err.message);
  } else {
    console.log(JSON.stringify(decoded, null, 4));
  }
});
