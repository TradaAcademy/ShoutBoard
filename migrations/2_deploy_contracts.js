var UserList = artifacts.require("./UserList.sol");
var ShoutRoom = artifacts.require("./ShoutRoom.sol");

module.exports = async (deployer, network) => {
  if (network === "mainnet") return;

  deployer.then(async () => {
    await deployer.deploy(UserList);
    await deployer.deploy(ShoutRoom, UserList.address);
  });
};

