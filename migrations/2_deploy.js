// migrations/2_deploy.js
require('dotenv').config()

var web3 = require('web3');
const StakingRewardsFactory = artifacts.require("StakingRewardsFactory");

module.exports = async function (deployer, network, accounts) {

  await deployer.deploy(StakingRewardsFactory, '0x7f1f2d3dfa99678675ece1c243d3f7bc3746db5d', 1619827200);

  //https://github.com/OpenZeppelin/openzeppelin-upgrades/blob/master/packages/plugin-truffle/README.md

  //Web3.utils.toWei('100000000', 'ether')

  stakingRewardsFactoryInstance = await StakingRewardsFactory.deployed();

  address1 = await stakingRewardsFactoryInstance.deploy('0x54049236fc1db3e274128176efedf7c69b4c6335', web3.utils.toWei('600000', 'ether'));

  address2 = await stakingRewardsFactoryInstance.deploy('0x3d52401f08dc655b7bbf468bf9f6bdee40c77a2b', web3.utils.toWei('600000', 'ether'));

};
