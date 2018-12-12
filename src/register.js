import 'truffle-contract';
import userListJSON from '../build/contracts/UserList.json';
import './style.css';

var app = {
    instances: {},
}

function init() {

    // Init contracts

    var provider = (typeof web3 !== 'undefined') ? web3.currentProvider
        : new Web3.providers.HttpProvider("HTTP://127.0.0.1:7545");

    var userContract = TruffleContract(userListJSON);
    userContract.setProvider(provider);
    userContract.deployed().then(function(instance) {
        // save for later use
        app.instances.userList = instance;
    });

}

function wireEvents() {
    document.getElementById("registerForm").addEventListener("submit", function(event){
        event.preventDefault();
        
        var text = document.getElementById("userName").value.trim();
        if (!text.length) {
            alert("Please input user name!");
            return;
        }

        var account = web3.eth.accounts[0];
        if (!account) {
            alert("Please sign-in MetaMask.");
            return;
        }

        app.instances.userList.isAddrRegistered(account).then(function(registered){
            if (!registered) {
                app.instances.userList.register(web3.fromAscii(text), false, {
                    from: account,
                    gas: 100000, // gas limit
                    gasPrice: '15000000000' // 15 gwei
                }).then(function(){
                    window.location.href = "/";
                }).catch(function(err){
                    alert(err);
                })
            } else {
                alert("You already registed before. Update user name is not supported!");
                window.location.href = "/";
            }
        });

    }, false)
}

(function start() {
    if (web3.version.network === "1") {
        alert("You are on MAINNET, please switch to a testnet then refresh page!");
        return;
    }
    init();
    wireEvents();
})();