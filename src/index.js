import _ from 'lodash';
import async from 'async';
import moment from 'moment';
import 'truffle-contract';
import shoutRoomJSON from '../build/contracts/ShoutRoom.json';
import userListJSON from '../build/contracts/UserList.json';
import './style.css';

var app = {
    instances: {},
    templates: {},
    data: {
        shouts: {},
    },
    cache: {
        blockTime: {},
        avatar: {}
    }
}

function init() {

    // Init contracts

    var provider = (typeof web3 !== 'undefined') ? web3.currentProvider
        : new Web3.providers.HttpProvider("HTTP://127.0.0.1:7545");

    var shoutContract = TruffleContract(shoutRoomJSON);
    shoutContract.setProvider(provider);
    shoutContract.deployed().then(function(instance) {
        // save for later use
        app.instances.shoutBoard = instance;

        // load recent chat messages
        loadOldShouts(instance);
    });

    var userContract = TruffleContract(userListJSON);
    userContract.setProvider(provider);
    userContract.deployed().then(function(instance) {
        // save for later use
        app.instances.userList = instance;
    });

    // Load templates
    app.templates.shout_item = document.getElementById("shoutTemplate").textContent;

}

function applyTemplate(template, data) {
    _.each(data, function (value, key) {
        template = template.split("${" + key + "}").join(value);
    })
    return template;
}

function createTag(html) {
    var div = document.createElement('div');
    div.innerHTML = html.trim();
    return div.firstChild;
}

function formatAddr(addr) {
    return addr.substr(0, 5) + "…" + addr.substr(-3);
}

function processShout(item, callback) {
    var theItem = {
        when: app.cache.blockTime[item.blockNumber],
        who: item.args.who,
        whoShort: formatAddr(item.args.who),
        what: item.args.what
    };
    if (theItem.when) {
        return callback(null, theItem);
    }
    web3.eth.getBlock(item.blockNumber, function (err, block) {
        theItem.when = moment.unix(block.timestamp);
        theItem.ago = theItem.when.fromNow();
        app.cache.blockTime[item.blockNumber] = theItem.when;
        callback(err, theItem);
    });
}

function loadOldShouts(instance) {
    instance.Shout({}, {fromBlock: 0 }).get(function (err, shouts) {
        var funcs = {};
        _.each(shouts, function (item) {
            funcs[item.transactionHash] = function (next) {
                processShout(item, next);
            }
        });
        async.parallelLimit(funcs, 20, function (err, result) {
            app.data.shouts = result;

            // need to sort to ensure display in order
            var sortedArray = [];
            _.each(result, function(item) {
                sortedArray.push(item);
            });
            sortedArray = _.sortBy(sortedArray, ["when"]);
            _.each(sortedArray, showShout);

            // watch for new shout
            instance.Shout().watch(function(err, item) {
                if (app.data.shouts[item.transactionHash]) return;
                processShout(item, function(err, theItem) {
                    showShout(theItem);
                })
            })
        })
    })
}

function showShout(item) {
    var node = createTag(applyTemplate(app.templates.shout_item, item));
    var board = document.querySelector(".board");
    board.insertBefore(node, board.firstChild);
}

function wireEvents() {
    document.getElementById("shoutForm").addEventListener("submit", function(event){
        event.preventDefault();
        
        var text = document.getElementById("shoutText").value.trim();
        if (!text.length) {
            alert("Please input content before shouting!");
            return;
        }

        var account = web3.eth.accounts[0];
        if (!account) {
            alert("Please sign-in MetaMask.");
            return;
        }
        app.instances.userList.isAddrRegistered(account).then(function(registered){
            if (!registered) {
                window.location.href = "/register.html";
                return;
            } else {
                app.instances.shoutBoard.shout(text, {
                    from: account,
                    gas: 100000, // gas limit
                    gasPrice: '15000000000' // 15 gwei
                }).catch(function(err){
                    alert(err);
                })
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