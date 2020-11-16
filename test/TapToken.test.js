// Load dependencies
const { expect } = require('chai');

// Import utilities from Test Helpers
const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');

// Load compiled artifacts
const Tap = artifacts.require('TapToken');

// Start test block
contract('Tap', function ([ owner, other ]) {

  const initialSupply = new BN('100000000');

  beforeEach(async function () {
    this.tap = await Tap.new(initialSupply);
  });

  it('has correct initial supply', async function () {
    // Store a value
    expect((await this.tap.totalSupply()).toString()).to.equal(initialSupply.toString());
  });

  it('has transferred intial supply to owner', async function () {
    // Store a value
    expect((await this.tap.balanceOf(owner)).toString()).to.equal(initialSupply.toString());
  });

  it('has correct namne', async function () {
    // Store a value
    expect(await this.tap.name()).to.equal('Tapmydata');
  });

  it('has correct symbol', async function () {
    // Store a value
    expect(await this.tap.symbol()).to.equal('TAP');
  });

  it('can be paused', async function () {
    await this.tap.transfer(other, 1000);
    expect((await this.tap.balanceOf(other)).toString()).to.equal("1000");
    
    // Pause the contract
    const web3Receipt = await this.tap.pause();
    await expectEvent(
      web3Receipt,
      "Paused",
      [ owner ]
    );

    await expectRevert(
      this.tap.transfer(other, 1000),
      "ERC20Pausable: token transfer while paused"
    );

    expect((await this.tap.balanceOf(other)).toString()).to.equal("1000");
  });

  it('can only be paused by owner', async function () {
    await expectRevert(
      this.tap.pause({from: other}),
      "Ownable: caller is not the owner"
    );
  });

  it('can be un-paused', async function () {
    await this.tap.pause();

    await expectRevert(
      this.tap.transfer(other, 1000),
      "ERC20Pausable: token transfer while paused"
    );

    const web3Receipt = await this.tap.unpause();
    await expectEvent(
      web3Receipt,
      "Unpaused",
      [ owner ]
    );

    await this.tap.transfer(other, 1000);
    expect((await this.tap.balanceOf(other)).toString()).to.equal("1000");
  });

  it('can only be un-paused by owner', async function () {
    await expectRevert(
      this.tap.unpause({from: other}),
      "Ownable: caller is not the owner"
    );
  });

});