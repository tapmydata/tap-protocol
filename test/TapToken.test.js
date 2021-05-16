// Load dependencies
const { expect } = require('chai');

// Import utilities from Test Helpers
const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');

// Load compiled artifacts
const Tap = artifacts.require('TapToken');

const Web3 = require('web3');

// Start test block
contract('Tap', function ([ owner, other ]) {

  const cap = new BN('100000000');
  const initialSupply = new BN('50000000');

  beforeEach(async function () {
    this.tap = await Tap.new('Tapmydata', 'TAP', cap);
    await this.tap.mint(owner, initialSupply);
  });

  it('has correct owner', async function () {
    expect((await this.tap.getOwner()).toString()).to.equal(owner);
  });

  it('can have ownership transferred', async function () {
    await this.tap.transferOwnership(other)
    expect((await this.tap.getOwner()).toString()).to.equal(other);
  });

  it('can not have ownership transferred if not called by owner', async function () {
    await expectRevert(
      this.tap.transferOwnership(other, {from: other}),
      "Ownable: caller is not the owner"
    );
  });

  it('can renounce ownership', async function () {
    await this.tap.renounceOwnership();
    expect((await this.tap.getOwner()).toString()).to.equal('0x0000000000000000000000000000000000000000');
  });

  it('has correct initial supply', async function () {
    expect((await this.tap.totalSupply()).toString()).to.equal(initialSupply.toString());
  });

  it('can mint more tokens', async function () {
    await this.tap.mint(owner, initialSupply);
    expect((await this.tap.totalSupply()).toString()).to.equal(cap.toString());
  });

  it('can not mint beyond cap', async function () {
    await expectRevert(
      this.tap.mint(owner, cap),
      "BEP20Capped: cap exceeded"
    );
  });

  it('can burn tokens', async function () {
    const toBurn = new BN('20000000');
    const newSupply = new BN('30000000');
    await this.tap.burn(toBurn);
    expect((await this.tap.totalSupply()).toString()).to.equal(newSupply.toString());
  });

  it('has correct name', async function () {
    expect(await this.tap.name()).to.equal('Tapmydata');
  });

  it('has correct symbol', async function () {
    expect(await this.tap.symbol()).to.equal('TAP');
  });

  it('can transfer tokens', async function() {
    await this.tap.transfer(other, 1000);
    expect((await this.tap.balanceOf(other)).toString()).to.equal("1000");
  });

  it('can block transfer to recipient', async function() {
    const web3Receipt = await this.tap.blockAccount(other);

    await expectEvent(
      web3Receipt,
      "Blocked",
      [ other ]
    );

    await expectRevert(
      this.tap.transfer(other, 1000),
      "BEP20Blockable: token transfer rejected. Receiver is blocked."
    );
    expect((await this.tap.balanceOf(other)).toString()).to.equal("0");
  });

  it('can block transfer from sender', async function() {
    await this.tap.transfer(other, 1000);
    newBalance = await this.tap.balanceOf(owner);
    await this.tap.blockAccount(other);
    await expectRevert(
      this.tap.transfer(owner, 1000, {from: other}),
      "BEP20Blockable: token transfer rejected. Sender is blocked."
    );
    expect((await this.tap.balanceOf(owner)).toString()).to.equal(newBalance.toString());
  });

  it('can unblock account', async function() {
    await this.tap.blockAccount(other);
    const web3Receipt = await this.tap.unBlockAccount(other);
    await expectEvent(
      web3Receipt,
      "UnBlocked",
      [ other ]
    );

    await this.tap.transfer(other, 1000);
    expect((await this.tap.balanceOf(other)).toString()).to.equal("1000");
  });
  
  it('can only be blocked by blocker role account', async function() {
    await expectRevert(
      this.tap.blockAccount(owner, {from: other}),
      "BEP20Blockable: must have blocker role to block."
    );
  });

  it('can assign blocker role', async function() {
    const role = Web3.utils.keccak256("BLOCKER_ROLE");
    const web3Receipt = await this.tap.grantRole(role, other);
    await expectEvent(
      web3Receipt,
      "RoleGranted",
      [ role, other, owner ]
    );
    const account_to_block = '0xcb0510D1c4eA88CcD1F2395D075Af9e831C2F15d';
    await this.tap.blockAccount(account_to_block, {from: other});
    expect(await this.tap.isBlocked(account_to_block)).to.equal(true);
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
      "BEP20Pausable: token transfer while paused"
    );

    expect((await this.tap.balanceOf(other)).toString()).to.equal("1000");
  });

  it('can only be paused by pauser role', async function () {
    await expectRevert(
      this.tap.pause({from: other}),
      "BEP20PresetMinterPauser: must have pauser role to pause"
    );
  });

  it('can be un-paused', async function () {
    await this.tap.pause();

    await expectRevert(
      this.tap.transfer(other, 1000),
      "BEP20Pausable: token transfer while paused"
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

  it('can only be un-paused by pauser role', async function () {
    await expectRevert(
      this.tap.unpause({from: other}),
      "BEP20PresetMinterPauser: must have pauser role to unpause"
    );
  });

});
