const FunnyAuction = artifacts.require("FunnyAuction.sol");

module.exports = function (deployer) {
  deployer.deploy(FunnyAuction);
};
