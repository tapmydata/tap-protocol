// migrations/2_deploy.js
require('dotenv').config()

var Web3 = require('web3');
const TapToken = artifacts.require("TapToken");

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(TapToken, 'Tapmydata', 'TAP', Web3.utils.toWei('100000000', 'ether'));
  tapInstance = await TapToken.deployed();
<<<<<<< Updated upstream
  if(process.env.FROM) {
    await tapInstance.mint(process.env.FROM, Web3.utils.toWei('100000000', 'ether'));
=======
  if(process.env.MINT_TO) {
    await tapInstance.mint(process.env.MINT_TO, one_hundred_million);
>>>>>>> Stashed changes
  }
};
