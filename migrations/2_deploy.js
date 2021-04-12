// migrations/2_deploy.js
require('dotenv').config()

var web3 = require('web3');
const StakingRewardsFactory = artifacts.require("StakingRewardsFactory");

module.exports = async function (deployer, network, accounts) {

  await deployer.deploy(StakingRewardsFactory, '0x9bb5f39f98c4c422903aeb8941d3eedfa398a47a', 1618108200);

  //https://github.com/OpenZeppelin/openzeppelin-upgrades/blob/master/packages/plugin-truffle/README.md

  //Web3.utils.toWei('100000000', 'ether')

  stakingRewardsFactoryInstance = await StakingRewardsFactory.deployed();

  address = await stakingRewardsFactoryInstance.deploy('0x008d19D30d622fbB141A447aaA8a1857e71d95E5', web3.utils.toWei('1000', 'ether'));

  console.log(address);
};
