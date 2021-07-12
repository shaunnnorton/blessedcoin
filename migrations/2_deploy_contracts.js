const BlessedCoinContract = artifacts.require("BlessedCoinContract");

module.exports = function (deployer) {
    deployer.deploy(BlessedCoinContract);
}