var keythereum = require("keythereum");
var params = { keyBytes: 32, ivBytes: 16 };

// synchronous
var dk = keythereum.create(params);
var address = keythereum.privateKeyToAddress(dk.privateKey);
console.log(address);

var keyObject = keythereum.dump("hello", dk.privateKey, dk.salt, dk.iv);
keythereum.exportToFile(keyObject);

var keyObject2 = keythereum.importFromFile(address,".")
var privateKey = keythereum.recover("hello", keyObject2);
console.log(keythereum.privateKeyToAddress(privateKey))