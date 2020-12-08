// migrations/2_deploy.js
require('dotenv').config()

var Web3 = require('web3');
const TapToken = artifacts.require("TapToken");
const one_hundred_million = Web3.utils.toWei('100000000', 'ether');

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(TapToken, 'Tapmydata', 'TAP', one_hundred_million);
  tapInstance = await TapToken.deployed();
  if(process.env.FROM) {
    await tapInstance.mint(process.env.FROM, one_hundred_million);
  }
};
