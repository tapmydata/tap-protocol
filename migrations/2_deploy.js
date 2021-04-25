// migrations/2_deploy.js
require('dotenv').config()

var web3 = require('web3');
const StakingRewardsFactory = artifacts.require("StakingRewardsFactory");

module.exports = async function (deployer, network, accounts) {

  await deployer.deploy(StakingRewardsFactory, '0xac3211a5025414af2866ff09c23fc18bc97e79b1', 1619307000);

  //https://github.com/OpenZeppelin/openzeppelin-upgrades/blob/master/packages/plugin-truffle/README.md

  //Web3.utils.toWei('100000000', 'ether')

  stakingRewardsFactoryInstance = await StakingRewardsFactory.deployed();

  //address1 = await stakingRewardsFactoryInstance.deploy('0x171496421fb12d061c996c038fb5e615374d38a4', web3.utils.toWei('6000000', 'ether'));
};
