// migrations/2_deploy.js
require('dotenv').config()

var web3 = require('web3');
const StakingRewardsFactory = artifacts.require("StakingRewardsFactory");

module.exports = async function (deployer, network, accounts) {

  await deployer.deploy(StakingRewardsFactory, '0x10635bf5c17f5e4c0ed9012aef7c12f96a57a4dd', 1647961200);

  //https://github.com/OpenZeppelin/openzeppelin-upgrades/blob/master/packages/plugin-truffle/README.md

  //Web3.utils.toWei('100000000', 'ether')

  stakingRewardsFactoryInstance = await StakingRewardsFactory.deployed();

  address1 = await stakingRewardsFactoryInstance.deploy('0x7c1e12b3c78cdcbc7d3c0c1d299e7a2216d10105', web3.utils.toWei('1800000', 'ether'));

  //address2 = await stakingRewardsFactoryInstance.deploy('0x3d52401f08dc655b7bbf468bf9f6bdee40c77a2b', web3.utils.toWei('600000', 'ether'));

};
