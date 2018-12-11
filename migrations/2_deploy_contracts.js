var UserList = artifacts.require("./UserList.sol");
var ShoutRoom = artifacts.require("./ShoutRoom.sol");

module.exports = async (deployer, network) => {
  if (network === "mainnet") return;
  deployer.deploy(UserList).then(function() {
    return deployer.deploy(ShoutRoom, UserList.address).catch(function(err) {
      console.log("ShoutRoom ERR: ", err)
    });
  });
};

