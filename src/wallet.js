import bip39 from 'bip39';
import keythereum from './keythereum';
import wallet from 'ethereumjs-wallet';
import hdkey from 'ethereumjs-wallet/hdkey';
import Web3 from 'web3';

if (web3) {
    window.web3 = new Web3(web3.currentProvider);
} else {
    window.web3 = new Web3(new Web3.providers.WebsocketProvider("ws://127.0.0.1:7545"));
}
const $ = (selector, callback) => {
    document.querySelector(selector).addEventListener("click", (e) => {
        e.preventDefault();
        callback(e);
    }, false);
}

$("#createWeb3", e => {
    alert("createWeb3");
});

$("#createKeythereum", e => {
    alert("createKeythereum");
});

$("#createEJS", e => {
    alert("createEJS");
});

$("#importKeyWeb3", e => {
    alert("importKeyWeb3");
});

$("#importKeyEJS", e => {
    alert("importKeyEJS");
});

$("#importSeed", e => {
    alert("importSeed");
});

$("#saveWeb3", e => {
    alert("saveWeb3");
});

$("#saveKeythereum", e => {
    alert("saveKeythereum");
});

$("#saveEJS", e => {
    alert("saveEJS");
});

$("#loadWeb3", e => {
    alert("loadWeb3");
});

$("#loadKeythereum", e => {
    alert("loadKeythereum");
});

$("#loadEJS", e => {
    alert("loadEJS");
});