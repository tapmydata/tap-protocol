const { web3 } = require('@openzeppelin/test-helpers/src/setup');
var Web3 = require('web3');
const TapToken = artifacts.require("TapToken");

module.exports = async (callback) => {

    //tapInstance = await TapToken.deployed();

    const tapabi = require("./tap-abi.json")
    var tapContract = new web3.eth.Contract(tapabi,'0x7f1f2d3dfa99678675ece1c243d3f7bc3746db5d');


    //from December 17, Block  (11473461)
    //until December 21, Block  (11501068)

    //await web3.eth.getBalance("0x4B9f09f88C31F66265Ab2d2368E10Abc488e6CA4")
    //.then(console.log);
    try {
        await tapContract.methods.balanceOf('0x4B9f09f88C31F66265Ab2d2368E10Abc488e6CA4')
        .call({})
        .then(function(result){
            console.log(result)
        });
    } catch(e) {
        console.log(e);
    }

    callback();

    /*try {
        await tapInstance.getPastEvents('Transfer', { fromBlock: 11473461, toBlock: 11501068 })
        .then(function(events){
            console.log(events) // same results as the optional callback above
        });
    } catch(e) {
        console.log(e);
    }
    
    callback();*/
}