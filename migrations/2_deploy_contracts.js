var UserList = artifacts.require("./UserList.sol");
var ShoutRoom = artifacts.require("./ShoutRoom.sol");

module.exports = function(deployer) {
  //deployer.deploy(UserList).then(() => {
    deployer.deploy(ShoutRoom);
  //})
};
