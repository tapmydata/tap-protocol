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
});