import IpfsHttpClient from 'ipfs-http-client';
import fileReaderPullStream from 'pull-file-reader';
let pageInited = false;

/*
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
*/

function init() {
    if (pageInited) return;
    pageInited = true;
    document.getElementById("avatarImg").src = "http://i.pravatar.cc/150?u=" + (app.account || "");
    if (!app.instances.ipfs) {
        app.instances.ipfs = IpfsHttpClient('ipfs.infura.io', '5001', {protocol: 'https'});
    }
    wireEvents();
}

function registerUser(username, avatarHash) {
    app.instances.UserList.methods.register(username, avatarHash)
    .send({
        gas: 1000000, // gas limit
        gasPrice: '15000000000' // 15 gwei
    }).then(function(){
        app.showPage("index");
    }).catch(function(err){
        alert(err);
    })
}

function submit(file, username) {
    if (!file) {
        registerUser(username, "");
        return;
    }
    var fileStream = fileReaderPullStream(file)
    app.instances.ipfs.add(fileStream, { 
        pin: false,
        progress: (prog) => console.log(`IPFS upload progress: ${prog}`) 
    }).then((response) => {
        registerUser(username, response[0].hash);
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

        var nickBytes = web3.utils.fromAscii(text);

        app.instances.UserList.methods.couldRegister(app.account, nickBytes).call().then(function(ok){
            if (ok[0] && ok[1]) {
                submit(document.getElementById("avatarFile").files[0], nickBytes)
            } else if(!ok[0]) {
                alert("You already registed before. Update user name is not supported!");
                app.showPage("index");
            } else if(!ok[1]) {
                alert("Username already taken. Choose another one.");
            }
        });

    }, false)
}

export default {
    name: "register",
    onInit: init
}