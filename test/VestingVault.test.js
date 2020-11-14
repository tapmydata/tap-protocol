// Load dependencies
const { expect, assert } = require('chai');

const helper = require('./utils/utils.js');

// Import utilities from Test Helpers
const { BN, expectEvent, expectRevert, time } = require('@openzeppelin/test-helpers');

// Load compiled artifacts
const Tap = artifacts.require('TapToken');
const VestingVault = artifacts.require('VestingVault');

// Start test block
contract('VestingVault', function ([ owner, other ]) {

  const initialSupply = new BN('1000');
  const unixTime = Math.floor(Date.now() / 1000);

  beforeEach(async function () {
    snapShot = await helper.takeSnapshot();
    snapshotId = snapShot['result'];

    this.tap = await Tap.new(initialSupply);
    this.vault = await VestingVault.new(this.tap.address)
    await this.tap.approve(this.vault.address, 1000);
  });

  afterEach(async() => {
    await helper.revertToSnapShot(snapshotId);
  });

  it('should only allow owner to grant', async function () {
    await expectRevert(
      this.vault.addTokenGrant(other, 10, 10, 10, {from: other}),
      "Ownable: caller is not the owner"
    );
  });

  it('should only allow owner to revoke', async function () {
    await this.vault.addTokenGrant(other, 10, 10, 10);
    await expectRevert(
      this.vault.revokeTokenGrant(other, {from: other}),
      "Ownable: caller is not the owner"
    );
  });

  it('should emit an event on grant', async function () {
    const web3Receipt = await this.vault.addTokenGrant(other, 10, 10, 10);
    await expectEvent(
      web3Receipt,
      "GrantAdded",
      { recipient: other }
    );
  });

  it('should emit an event on revoke', async function () {
    await this.vault.addTokenGrant(other, 10, 10, 10);
    const web3Receipt = await this.vault.revokeTokenGrant(other);
    await expectEvent(
      web3Receipt,
      "GrantRevoked",
      { 
        recipient: other,
        amountVested: "0",
        amountNotVested: "10"
      }
    );
  });

  it('should emit an event on claim', async function () {
    await this.vault.addTokenGrant(other, 10, 10, 0);
    const web3Receipt = await this.vault.claimVestedTokens({from: other});
    await expectEvent(
      web3Receipt,
      "GrantTokensClaimed",
      { 
        recipient: other,
        amountClaimed: "1"
      }
    );
  });

  it('should reject cliff greater than 10 years', async function () {
    await expectRevert(
        this.vault.addTokenGrant(other, 10, 1000, 3651),
        "Cliff greater than 10 years"
    );
  });

  it('should reject duration greater than 25 years', async function () {
    await expectRevert(
        this.vault.addTokenGrant(other, 10, 9126, 365),
        "Duration greater than 25 years"
    );
  });

  it('should have an amount vesting per day greater than zero', async function () {
    await expectRevert(
        this.vault.addTokenGrant(other, 10, 1000, 1000),
        "amountVestedPerDay > 0"
    );
  });

  it('should reject transfer outside of allowance', async function () {
    await expectRevert(
      this.vault.addTokenGrant(other, 1001, 10, 0),
      "ERC20: transfer amount exceeds balance"
    );
  });

  it('can get grant start time', async function() {
    await this.vault.addTokenGrant(other, 1000, 10, 0);
    expect((await this.vault.getGrantStartTime(other)).toString()).to.equal((await time.latest()).toString());
  });

  it('can get grant amount', async function() {
    await this.vault.addTokenGrant(other, 1000, 10, 1);
    expect((await this.vault.getGrantAmount(other)).toString()).to.equal("1000");
  });

  it('can not add a grant if one already exists', async function() {
    await this.vault.addTokenGrant(other, 300, 10, 1);
    await expectRevert(
        this.vault.addTokenGrant(other, 200, 10, 1),
        "Grant already exists, must revoke first"
    );
    expect((await this.vault.getGrantAmount(other)).toString()).to.equal("300");
  });

  it('can not claim unvested tokens', async function() {
    await this.vault.addTokenGrant(other, 1000, 10, 1);
    await expectRevert(
        this.vault.claimVestedTokens({from: other}),
        "Vested is 0"
    );
  });

  it('can claim vested tokens', async function() {
    await this.vault.addTokenGrant(other, 1000, 10, 0);
    expect((await this.tap.balanceOf(other)).toString()).to.equal("0");
    await time.increase(time.duration.days(2));
    await this.vault.claimVestedTokens({from: other})
    expect((await this.tap.balanceOf(other)).toString()).to.equal("300");
  });

  it('grants all tokens if over testing duration', async function() {
    await this.vault.addTokenGrant(other, 1000, 10, 0);
    expect((await this.tap.balanceOf(other)).toString()).to.equal("0");
    await time.increase(time.duration.days(20));
    await this.vault.claimVestedTokens({from: other})
    expect((await this.tap.balanceOf(other)).toString()).to.equal("1000");
  });

  it('vests immediately if no cliff', async function() {
    await this.vault.addTokenGrant(other, 1000, 1, 0);
    await this.vault.claimVestedTokens({from: other})
    expect((await this.tap.balanceOf(other)).toString()).to.equal("1000");

    await time.increase(time.duration.days(1));
    await expectRevert(
      this.vault.claimVestedTokens({from: other}),
      "Grant fully claimed"
    );
  });

  it('does not release tokens before cliff is up', async function() {
    await this.vault.addTokenGrant(other, 1000, 5, 3);

    await time.increase(time.duration.days(1));
    await expectRevert(
      this.vault.claimVestedTokens({from: other}),
      "Vested is 0"
    );

    await time.increase(time.duration.days(1));
    await expectRevert(
      this.vault.claimVestedTokens({from: other}),
      "Vested is 0"
    );

    await time.increase(time.duration.days(1));
    await this.vault.claimVestedTokens({from: other})
    expect((await this.tap.balanceOf(other)).toString()).to.equal("200");

    await time.increase(time.duration.days(1));
    await this.vault.claimVestedTokens({from: other})
    expect((await this.tap.balanceOf(other)).toString()).to.equal("400");

    await time.increase(time.duration.days(1));
    await this.vault.claimVestedTokens({from: other})
    expect((await this.tap.balanceOf(other)).toString()).to.equal("600");

    await time.increase(time.duration.days(1));
    await this.vault.claimVestedTokens({from: other})
    expect((await this.tap.balanceOf(other)).toString()).to.equal("800");

    await time.increase(time.duration.days(1));
    await this.vault.claimVestedTokens({from: other})
    expect((await this.tap.balanceOf(other)).toString()).to.equal("1000");

    await time.increase(time.duration.days(1));
    await expectRevert(
      this.vault.claimVestedTokens({from: other}),
      "Grant fully claimed"
    );
  });

  it('releases balance at end if uneven vest', async function() {
    await this.vault.addTokenGrant(other, 1000, 3, 0);

    await this.vault.claimVestedTokens({from: other})
    expect((await this.tap.balanceOf(other)).toString()).to.equal("333");

    await time.increase(time.duration.days(1));
    await this.vault.claimVestedTokens({from: other})
    expect((await this.tap.balanceOf(other)).toString()).to.equal("666");

    await time.increase(time.duration.days(1));
    await this.vault.claimVestedTokens({from: other})
    expect((await this.tap.balanceOf(other)).toString()).to.equal("1000");

    await time.increase(time.duration.days(1));
    await expectRevert(
      this.vault.claimVestedTokens({from: other}),
      "Grant fully claimed"
    );
  });

  it('releases balance at end if uneven vest with cliff', async function() {
    await this.vault.addTokenGrant(other, 1000, 3, 7);

    await time.increase(time.duration.days(7));

    await this.vault.claimVestedTokens({from: other})
    expect((await this.tap.balanceOf(other)).toString()).to.equal("333");

    await time.increase(time.duration.days(1));
    await this.vault.claimVestedTokens({from: other})
    expect((await this.tap.balanceOf(other)).toString()).to.equal("666");

    await time.increase(time.duration.days(1));
    await this.vault.claimVestedTokens({from: other})
    expect((await this.tap.balanceOf(other)).toString()).to.equal("1000");

    await time.increase(time.duration.days(1));
    await expectRevert(
      this.vault.claimVestedTokens({from: other}),
      "Grant fully claimed"
    );
  });

  it('owner can revoke token grant', async function() {
    await this.vault.addTokenGrant(other, 1000, 3, 7);
    expect((await this.tap.balanceOf(this.vault.address)).toString()).to.equal("1000");

    await time.increase(time.duration.days(8));
    await this.vault.revokeTokenGrant(other);

    expect((await this.tap.balanceOf(owner)).toString()).to.equal("334");
    expect((await this.tap.balanceOf(other)).toString()).to.equal("666");
    expect((await this.tap.balanceOf(this.vault.address)).toString()).to.equal("0");
  });
});
