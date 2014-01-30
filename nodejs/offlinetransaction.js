#!/usr/bin/env node

/* Builds and signed an offline transaction that can be air gapped then
 * transmitted by the p2p network without ever exposing your private keys.
 *
 * Accepts a destination address and a DOGE amount. A raw transaction is
 * built using enough unspent transactions to make up the desired amount.
 * Change is sent back to the wallet using a change address.
 */

var config = require('config')
  , async = require('async')
  , _ = require('lodash');

var dogecoin = require('node-dogecoin')({
      host: config.rpchost,
      port: config.rpcport,
      user: config.rpcuser,
      pass: config.rpcpassword
    });

if (process.argv.length != 4) {
  console.error('Usage:', 'offlinetransaction.js', 'destination_address', 'amount');
  process.exit(1);
}

var destination_address = process.argv[2]
  , amount = Number(process.argv[3]);

console.log('Sending', amount, 'DOGE to', destination_address);

async.waterfall([
  function(next) {
    /* Get a list of unspent transactions. Note that for this
     * approach to work a recent copy of the block chain has to be
     * copied on to the airgapped machine (perhaps via USB key). */
    dogecoin.listUnspent(next);
  },
  function(unspent, next) {
    /* Find enough transactions to make up desired payment amount. */
    var sum = 0
      , txs = [];
    for (var i = 0; i < unspent.length && sum < amount; i++) {
      sum += unspent[i].amount;
      txs.push(unspent[i]);
    }
    if (sum < amount) {
      next(new Error('Insufficient funds in wallet.'));
    } else {
      next(null, sum, txs);
    }
  },
  function(sum, txs, next) {
    /* Get a change address, assume that the wallet has
     * an account with label change. */
    dogecoin.getAccountaddress('change', function(err, change_address) {
      if (err) {
        next(err);
      } else {
        next(null, sum, txs, change_address);
      }
    });
  },
  function(sum, txs, change_address, next) {
    var change = sum - amount;

    /* Inputs are all the transactions required to cumulate
     * to at least the desired payment amount. */
    var inputs = _.map(txs, function(tx) {
      return {
        txid: tx.txid,
        vout: Number(tx.vout)
      };
    });

    /* Outputs are to the destination address and anything
     * remaining is sent back the a wallet address associated
     * with the "change" account. */
    var outputs = {};
    outputs[destination_address] = amount;
    if (change > 0) {
      outputs[change_address] = change;
    }

    console.log('Creating raw transaction...');
    dogecoin.createRawTransaction(inputs, outputs, next);
  },
  function(unsigned_hex, next) {
    console.log('Signing raw transaction...');
    dogecoin.signRawTransaction(unsigned_hex, next);
  },
  function(signed, next) {
    if (signed.complete) {
      console.log('\nYour offline transaction is:');
      console.log(signed.hex + '\n');
      console.log('Move this across your air gap and send it to the p2p network using the sendRawTransaction dogecoind command.\n');

      dogecoin.decodeRawTransaction(signed.hex, next);
    } else {
      next(new Error('Incomplete transaction.'));
    }
  },
  function(details, next) {
    console.log('Full transaction details:');
    console.log(JSON.stringify(details, null, 4));
    next();
  }
], function(err) {
  if (err) {
    console.error(err.message);
  }
});
