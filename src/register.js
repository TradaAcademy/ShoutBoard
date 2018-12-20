import 'truffle-contract';
import userListJSON from '../build/contracts/UserList.json';
import IpfsHttpClient from 'ipfs-http-client';
import fileReaderPullStream from 'pull-file-reader';
import './style.css';

var app = {
    account: "",
    instances: {},
}

function changeInterface() {
    var img = document.getElementById("avatarImg");
    var lbl = document.getElementById("addressLabel");
    var btn = document.getElementById("registerBtn");
    if (!app.account) {
        img.src = "https://img.icons8.com/ios/50/000000/image.png";
        img.setAttribute("dummy", "dummy");
        lbl.textContent = "Please login MetaMask.";
        btn.setAttribute("disabled", "disabled");
        return;
    }

    lbl.textContent = app.account;
    btn.removeAttribute("disabled");
    if (img.hasAttribute("dummy")) {
        img.src="http://i.pravatar.cc/150?u=" + app.account;
    }
}

function init() {

    // Load account
    app.account = web3.eth.accounts[0] || "";
    // watch for metamask account change
    setInterval(function() {
        if (web3.eth.accounts[0] !== app.account) {
            app.account = web3.eth.accounts[0];
            changeInterface();
        }
    }, 100);

    // load account, img, etc.
    changeInterface();

    // Init contracts
    var provider = (typeof web3 !== 'undefined') ? web3.currentProvider
        : new Web3.providers.HttpProvider("HTTP://127.0.0.1:7545");

    var userContract = TruffleContract(userListJSON);
    userContract.setProvider(provider);
    userContract.deployed().then(function(instance) {
        // save for later use
        app.instances.userList = instance;
    });

    app.instances.ipfs = IpfsHttpClient('ipfs.infura.io', '5001', {protocol: 'https'});
}

function registerUser(account, username, avatarHash) {
    app.instances.userList.register(web3.fromAscii(username), avatarHash, {
        from: account,
        gas: 1000000, // gas limit
        gasPrice: '15000000000' // 15 gwei
    }).then(function(){
        window.location.href = "/";
    }).catch(function(err){
        alert(err);
    })
}

function submit(file, account, username) {
    var fileStream = fileReaderPullStream(file)
    app.instances.ipfs.add(fileStream, { progress: (prog) => console.log(`received: ${prog}`) })
      .then((response) => {
        console.log(response)
        registerUser(account, username, response[0].hash);
      }).catch((err) => {
        alert(err);
        console.error(err);
      })
  }

function wireEvents() {
    document.getElementById("avatarFile").addEventListener("change", function() {
        var imgTag = document.getElementById("avatarImg");
        imgTag.src = window.URL.createObjectURL(this.files[0]);
        imgTag.onload = function() {
            window.URL.revokeObjectURL(this.src);
            imgTag.removeAttribute("dummy");
        }

    }, false);

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
                submit(document.getElementById("avatarFile").files[0], account, text)
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