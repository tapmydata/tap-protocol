// migrations/2_deploy.js
var Web3 = require('web3');
const TapToken = artifacts.require("TapToken");

module.exports = async function (deployer) {
  await deployer.deploy(TapToken, Web3.utils.toWei('200000000', 'ether'));
};