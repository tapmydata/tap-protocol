// migrations/2_deploy.js
require('dotenv').config()

var web3 = require('web3');
const StakingRewardsFactory = artifacts.require("StakingRewardsFactory");

module.exports = async function (deployer, network, accounts) {

  await deployer.deploy(StakingRewardsFactory, '0x942684bDbd2d4897e766F383795cB94D00a0bCeC', 1618969745);

  //https://github.com/OpenZeppelin/openzeppelin-upgrades/blob/master/packages/plugin-truffle/README.md

  //Web3.utils.toWei('100000000', 'ether')

  stakingRewardsFactoryInstance = await StakingRewardsFactory.deployed();

  address1 = await stakingRewardsFactoryInstance.deploy('0x171496421fb12d061c996c038fb5e615374d38a4', web3.utils.toWei('600000', 'ether'));

  address2 = await stakingRewardsFactoryInstance.deploy('0x8fdf59901082f61df9fecf4cff6d93df8c338aa7', web3.utils.toWei('600000', 'ether'));

};
