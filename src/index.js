import async from 'async';
import moment from 'moment';
import shoutRoomJSON from '../build/contracts/ShoutRoom.json';
import userListJSON from '../build/contracts/UserList.json';
import Web3 from 'web3';
window._ = Web3.utils._;
import $h from './helper'
window.$h = $h;
import RegisterPage from './register';
import './style.css';

const NODE_URL = "HTTP://127.0.0.1:7545"; // change to Infura if you want

window.app = {
    account: "",
    instances: {},
    templates: {},
    showPage: name => $h.page(app.pages[name]),
    pages: {
        register: RegisterPage,
        index: "index"
    },
    data: {
        shouts: {},
    },
    cache: {
        blockTime: {},
        usernames: {}
    }
}

async function selectMetamask() {
    if (typeof web3 === 'undefined') {
        document.getElementById("metamask").textContent = "Metamask not installed";
        return;
    }

    // Ensure injected web3 is v1.0
    window.web3 = new Web3(web3.currentProvider);

    const accounts = await web3.eth.getAccounts();
    let addr;
    if (!accounts.length) {
        addr = "Please log in Metamask";
    } else {
        addr = accounts[0];
        app.account = addr;
        initContracts();
    }

    document.getElementById("metamask").textContent = addr;
}

function selectPrikey() {
    const key = prompt("Please input private key:");
    const provider = new Web3.providers.WebsocketProvider("ws://127.0.0.1:7545");
    window.web3 = new Web3(provider);

    // set account from private key
    const account = web3.eth.accounts.wallet.add('0x' + key);
    app.account = account.address;
    web3.eth.defaultAccount = app.account;

    document.getElementById("prikey").textContent = account.address;

    initContracts();
}

function initContracts() {
    $h.contracts(app.instances, [shoutRoomJSON, userListJSON], app.account, loadOldShouts);
}

function processShout(item, callback) {
    async.parallel({
        when: function (next) {
            getTimestamp(item, next);
        },
        user: function (next) {
            getUser(item, next);
        }
    }, function (err, data) {
        if (err) {
            return callback(err, null);
        }
        var theItem = {
            when: data.when,
            ago: data.when.fromNow(),
            who: item.returnValues.who,
            username: web3.utils.toUtf8(data.user.nick) || $h.formatAddr(item.returnValues.who),
            avatar: $h.avatar(data.user.avatarHash, item.returnValues.who),
            what: item.returnValues.what
        };
        callback(null, theItem);
    })
}

function getTimestamp(item, callback) {
    var cache = app.cache.blockTime[item.blockNumber];
    if (cache) {
        return callback(null, cache);
    }
    web3.eth.getBlock(item.blockNumber, function (err, block) {
        var timestamp = moment.unix(block.timestamp);
        app.cache.blockTime[item.blockNumber] = timestamp;
        callback(err, timestamp);
    });
}

function getUser(item, callback) {
    var cache = app.cache.usernames[item.returnValues.who];
    if (cache) {
        return callback(null, cache);
    }
    app.instances.UserList.methods.getUserByAddr(item.returnValues.who).call(callback);
}

async function loadOldShouts() {
    const instance = app.instances.ShoutRoom;
    const shouts = await instance.getPastEvents("Shout", { fromBlock: 0 });
    const funcs = {};
    _.each(shouts, item => {
        funcs[item.transactionHash] = function (next) {
            processShout(item, next);
        }
    });
    async.parallelLimit(funcs, 20, function (err, result) {

        if (err) {
            alert(err);
            console.log(err);
            return;
        }

        app.data.shouts = result;

        // need to sort to ensure display in order
        let sortedArray = [];
        _.each(result, item => sortedArray.push(item));
        sortedArray = _.sortBy(sortedArray, ["when"]);
        _.each(sortedArray, showShout);

        // watch for new shout

        instance.events.Shout().on("data", item => {
            if (app.data.shouts[item.transactionHash]) return;
            processShout(item, (err, theItem) => {
                if (err) {
                    alert(err);
                    return;
                }
                showShout(theItem);
            })
        })

    })
}

function showShout(item) {
    const node = $h.tag($h.merge(app.templates.shout_item, item));
    const board = document.querySelector(".board");
    board.insertBefore(node, board.firstChild);
}

function wireEvents() {
    document.getElementById("shoutForm").addEventListener("submit", async event => {
        event.preventDefault();

        var text = document.getElementById("shoutText").value.trim();
        if (!text.length) {
            alert("Please input content before shouting!");
            return;
        }

        var account = app.account;
        if (!account) {
            alert("Please sign-in MetaMask.");
            return;
        }
        const registered = await app.instances.UserList.methods.isAddrRegistered(account).call();
        if (!registered) {
            app.showPage("register");
            return;
        } else {
            app.instances.ShoutRoom.methods.shout(text).send({
                from: account,
                gas: 100000, // gas limit
                gasPrice: '15000000000' // 15 gwei
            }).on("transactionHash", function (hash) {
                console.log(hash);
            }).on("receipt", function (data) {
                console.log(data);
            }).on("error", function (err) {
                alert(err);
            })
        }

    }, false)
}

function loadTemplates() {
    app.templates = $h.loadTemplates();
}

(function start() {
    loadTemplates();
    wireEvents();
    selectMetamask();
    //selectPrikey();
})();