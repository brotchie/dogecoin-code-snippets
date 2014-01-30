# Dogecoin Code Snippets

A repository of example code for interacting with dogecoin services. 

Please send pull requests with code contributions!

![To the moon!](img/dogemoon.png)

## node.js examples
Accessing the dogecoind JSON-RPC interface with [node-dogecoin](https://github.com/countable/node-dogecoin).

 - Fetch your wallet's balance with [getbalance.js](nodejs/getbalance.js);
 - Build a raw transaction with a private key that's not in your wallet with [buildrawtransaction.js](nodejs/buildrawtransaction.js);
 - Create a transaction when your offline that is spent once it is sent on the p2p network with [offlinetransaction.js](nodejs/offlinetransaction.js).
 - 

## postgres examples
Leanr how to store dogecoin public addresses and transactions in a postgres database with [schema.sql](postgres/schema.sql).
