const { expectRevert, time } = require('@openzeppelin/test-helpers');
const { web3 } = require('@openzeppelin/test-helpers/src/setup');
const FunnyAuction = artifacts.require('FunnyAuction');

function fromWei(value) {
  return web3.utils.fromWei(value.toString());
}

function toWei(value) {
  return web3.utils.toWei(value.toString());
}

contract('FunnyAuction', ([alice, bob, carol, dev, minter, p1, p2, p3]) => {
  before(async () => {
    this.sc = await FunnyAuction.new({ from: alice });
    console.log([alice, bob, carol, dev, minter]);
  });

  it('should set correct state variables', async () => {

    await this.sc.config(web3.utils.toWei('100'), '10', '20', '30', { from: alice });
    await this.sc.transferOwnership(bob, {from: alice});
    const owner = await this.sc.owner();
    const highestValue = await this.sc.highestValue();
    const percent = await this.sc.percent();
    const coldDownBlock = await this.sc.coldDownBlock();
    const confirmBlock = await this.sc.confirmBlock();
    // console.log(owner.toString(), highestValue.toString(), 
    //   percent.toString(), coldDownBlock.toString(), confirmBlock.toString());

    assert.equal(owner.toString(), bob);
    assert.equal(highestValue.toString(), '100000000000000000000');
    assert.equal(percent.toString(), '10');
    assert.equal(coldDownBlock.toString(), '20');
    assert.equal(confirmBlock.toString(), '30');
  });

  it('should allow deposit', async () => {
    await web3.eth.sendTransaction({from: alice, to: this.sc.address, value: web3.utils.toWei('2000')});
    const b = await web3.eth.getBalance(this.sc.address);
    const liquidityPool = await this.sc.liquidityPool();
    const ALT = await this.sc.balanceOf(alice);

    // console.log(b, liquidityPool);
    assert.equal(ALT.toString(), '2000000000000000000000');
    assert.equal(b.toString(), '2000000000000000000000');
    assert.equal(liquidityPool.toString(), '2000000000000000000000');
  });

  it('should allow withdraw', async () => {
    await this.sc.withdraw({from: alice});
    const b = await web3.eth.getBalance(this.sc.address);
    const liquidityPool = await this.sc.liquidityPool();
    // console.log(b, liquidityPool);
    assert.equal(b.toString(), '0');
    assert.equal(liquidityPool.toString(), '0');
  });

  it('should success game round 1', async () => { 
    await web3.eth.sendTransaction({from: alice, to: this.sc.address, value: web3.utils.toWei('2000')});

    let b = await web3.eth.getBalance(this.sc.address);
    console.log('sc balance', fromWei(b.toString()))
    let goods = await this.sc.calcGoodsValue();
    console.log('goods', web3.utils.fromWei(goods.toString()));
    for (let i=0; i<60; i++) {
      await time.advanceBlock();
    }
    let status = await this.sc.getStatus();
    console.log('status', status.toString());
    const goodValue = await this.sc.currentGoodValue();
    const calcValue = await this.sc.calcGoodsValue();
    const liquidityPool = await this.sc.liquidityPool();
    console.log('goodValue', fromWei(goodValue.toString()), web3.utils.fromWei(calcValue.toString()), fromWei(liquidityPool.toString()));
    await this.sc.offer(web3.utils.toWei('1'), {from: p1, value:web3.utils.toWei('1')});
    await this.sc.offer(web3.utils.toWei('2'), {from: p2, value:web3.utils.toWei('2')});
    await this.sc.offer(web3.utils.toWei('3'), {from: p3, value:web3.utils.toWei('3')});
    await this.sc.offer(web3.utils.toWei('4'), {from: p1, value:web3.utils.toWei('3')});
    await this.sc.offer(web3.utils.toWei('5'), {from: p2, value:web3.utils.toWei('3')});
    await this.sc.offer(web3.utils.toWei('6'), {from: p3, value:web3.utils.toWei('3')});
    let topPlayer = await this.sc.topPlayer();
    let secondPlayer = await this.sc.secondPlayer();
    let currentBidPrice = await this.sc.currentBidPrice();
    console.log(topPlayer, secondPlayer, fromWei(currentBidPrice))
    status = await this.sc.getStatus();
    console.log('status', status.toString());

    await this.sc.offer(web3.utils.toWei('7'), {from: p1, value:web3.utils.toWei('3')});
    await this.sc.offer(web3.utils.toWei('8'), {from: p2, value:web3.utils.toWei('3')});
    await this.sc.offer(web3.utils.toWei('9'), {from: p3, value:web3.utils.toWei('3')});
    await this.sc.offer(web3.utils.toWei('10'), {from: p1, value:web3.utils.toWei('3')});
    await this.sc.offer(web3.utils.toWei('11'), {from: p2, value:web3.utils.toWei('3')});
    topPlayer = await this.sc.topPlayer();
    secondPlayer = await this.sc.secondPlayer();
    currentBidPrice = await this.sc.currentBidPrice();
    console.log(topPlayer, secondPlayer, fromWei(currentBidPrice))
    status = await this.sc.getStatus();
    console.log('status', status.toString());
    for (let i=0; i<60; i++) {
      await time.advanceBlock();
      status = await this.sc.getStatus();
      console.log('status', status.toString());
    }
  });

  it('should success game round 2', async () => { 
    // await web3.eth.sendTransaction({from: alice, to: this.sc.address, value: web3.utils.toWei('2000')});

    let b = await web3.eth.getBalance(this.sc.address);
    console.log('sc balance', fromWei(b.toString()))
    let goods = await this.sc.calcGoodsValue();
    console.log('goods', web3.utils.fromWei(goods.toString()));
    for (let i=0; i<60; i++) {
      await time.advanceBlock();
    }
    let status = await this.sc.getStatus();
    console.log('status', status.toString());
    const goodValue = await this.sc.currentGoodValue();
    const calcValue = await this.sc.calcGoodsValue();
    const liquidityPool = await this.sc.liquidityPool();
    console.log('goodValue', fromWei(goodValue.toString()), web3.utils.fromWei(calcValue.toString()), fromWei(liquidityPool.toString()));
    await this.sc.offer(web3.utils.toWei('1'), {from: p1, value:web3.utils.toWei('1')});
    await this.sc.offer(web3.utils.toWei('2'), {from: p2, value:web3.utils.toWei('2')});
    await this.sc.offer(web3.utils.toWei('3'), {from: p3, value:web3.utils.toWei('3')});
    await this.sc.offer(web3.utils.toWei('4'), {from: p1, value:web3.utils.toWei('3')});
    await this.sc.offer(web3.utils.toWei('5'), {from: p2, value:web3.utils.toWei('3')});
    await this.sc.offer(web3.utils.toWei('6'), {from: p3, value:web3.utils.toWei('3')});
    let topPlayer = await this.sc.topPlayer();
    let secondPlayer = await this.sc.secondPlayer();
    let currentBidPrice = await this.sc.currentBidPrice();
    console.log(topPlayer, secondPlayer, fromWei(currentBidPrice))
    status = await this.sc.getStatus();
    console.log('status', status.toString());

    await this.sc.offer(web3.utils.toWei('7'), {from: p1, value:web3.utils.toWei('3')});
    await this.sc.offer(web3.utils.toWei('8'), {from: p2, value:web3.utils.toWei('3')});
    await this.sc.offer(web3.utils.toWei('9'), {from: p3, value:web3.utils.toWei('3')});
    await this.sc.offer(web3.utils.toWei('10'), {from: p1, value:web3.utils.toWei('3')});
    await this.sc.offer(web3.utils.toWei('11'), {from: p2, value:web3.utils.toWei('3')});
    topPlayer = await this.sc.topPlayer();
    secondPlayer = await this.sc.secondPlayer();
    currentBidPrice = await this.sc.currentBidPrice();
    console.log(topPlayer, secondPlayer, fromWei(currentBidPrice))
    status = await this.sc.getStatus();
    console.log('status', status.toString());
    for (let i=0; i<60; i++) {
      await time.advanceBlock();
      status = await this.sc.getStatus();
      console.log('status', status.toString());
    }
  });
  
  it('should success game round 3', async () => { 
    // await web3.eth.sendTransaction({from: alice, to: this.sc.address, value: web3.utils.toWei('2000')});

    let b = await web3.eth.getBalance(this.sc.address);
    console.log('sc balance', fromWei(b.toString()))
    let goods = await this.sc.calcGoodsValue();
    console.log('goods', web3.utils.fromWei(goods.toString()));
    for (let i=0; i<60; i++) {
      await time.advanceBlock();
    }
    let status = await this.sc.getStatus();
    console.log('status', status.toString());
    const goodValue = await this.sc.currentGoodValue();
    const calcValue = await this.sc.calcGoodsValue();
    const liquidityPool = await this.sc.liquidityPool();
    console.log('goodValue', fromWei(goodValue.toString()), web3.utils.fromWei(calcValue.toString()), fromWei(liquidityPool.toString()));
    await this.sc.offer(web3.utils.toWei('1'), {from: p1, value:web3.utils.toWei('1')});
    await this.sc.offer(web3.utils.toWei('2'), {from: p2, value:web3.utils.toWei('2')});
    await this.sc.offer(web3.utils.toWei('3'), {from: p3, value:web3.utils.toWei('3')});
    await this.sc.offer(web3.utils.toWei('4'), {from: p1, value:web3.utils.toWei('3')});
    await this.sc.offer(web3.utils.toWei('5'), {from: p2, value:web3.utils.toWei('3')});
    await this.sc.offer(web3.utils.toWei('6'), {from: p3, value:web3.utils.toWei('3')});
    let topPlayer = await this.sc.topPlayer();
    let secondPlayer = await this.sc.secondPlayer();
    let currentBidPrice = await this.sc.currentBidPrice();
    console.log(topPlayer, secondPlayer, fromWei(currentBidPrice))
    status = await this.sc.getStatus();
    console.log('status', status.toString());

    await this.sc.offer(web3.utils.toWei('7'), {from: p1, value:web3.utils.toWei('3')});
    await this.sc.offer(web3.utils.toWei('8'), {from: p2, value:web3.utils.toWei('3')});
    await this.sc.offer(web3.utils.toWei('9'), {from: p3, value:web3.utils.toWei('3')});
    await this.sc.offer(web3.utils.toWei('10'), {from: p1, value:web3.utils.toWei('3')});
    await this.sc.offer(web3.utils.toWei('11'), {from: p2, value:web3.utils.toWei('3')});
    topPlayer = await this.sc.topPlayer();
    secondPlayer = await this.sc.secondPlayer();
    currentBidPrice = await this.sc.currentBidPrice();
    console.log(topPlayer, secondPlayer, fromWei(currentBidPrice))
    status = await this.sc.getStatus();
    console.log('status', status.toString());
    for (let i=0; i<60; i++) {
      await time.advanceBlock();
      status = await this.sc.getStatus();
      console.log('status', status.toString());
    }
  });

  it('should success game round 4', async () => { 
    // await web3.eth.sendTransaction({from: alice, to: this.sc.address, value: web3.utils.toWei('2000')});

    let b = await web3.eth.getBalance(this.sc.address);
    console.log('sc balance', fromWei(b.toString()))
    let goods = await this.sc.calcGoodsValue();
    console.log('goods', web3.utils.fromWei(goods.toString()));
    for (let i=0; i<60; i++) {
      await time.advanceBlock();
    }
    let status = await this.sc.getStatus();
    console.log('status', status.toString());
    const goodValue = await this.sc.currentGoodValue();
    const calcValue = await this.sc.calcGoodsValue();
    const liquidityPool = await this.sc.liquidityPool();
    console.log('goodValue', fromWei(goodValue.toString()), web3.utils.fromWei(calcValue.toString()), fromWei(liquidityPool.toString()));
    await this.sc.offer(web3.utils.toWei('1'), {from: p1, value:web3.utils.toWei('1')});
    await this.sc.offer(web3.utils.toWei('2'), {from: p2, value:web3.utils.toWei('2')});
    await this.sc.offer(web3.utils.toWei('3'), {from: p3, value:web3.utils.toWei('3')});
    await this.sc.offer(web3.utils.toWei('4'), {from: p1, value:web3.utils.toWei('3')});
    await this.sc.offer(web3.utils.toWei('5'), {from: p2, value:web3.utils.toWei('3')});
    await this.sc.offer(web3.utils.toWei('6'), {from: p3, value:web3.utils.toWei('3')});
    let topPlayer = await this.sc.topPlayer();
    let secondPlayer = await this.sc.secondPlayer();
    let currentBidPrice = await this.sc.currentBidPrice();
    console.log(topPlayer, secondPlayer, fromWei(currentBidPrice))
    status = await this.sc.getStatus();
    console.log('status', status.toString());

    await this.sc.offer(web3.utils.toWei('7'), {from: p1, value:web3.utils.toWei('3')});
    await this.sc.offer(web3.utils.toWei('8'), {from: p2, value:web3.utils.toWei('3')});
    await this.sc.offer(web3.utils.toWei('9'), {from: p3, value:web3.utils.toWei('3')});
    await this.sc.offer(web3.utils.toWei('10'), {from: p1, value:web3.utils.toWei('3')});
    await this.sc.offer(web3.utils.toWei('11'), {from: p2, value:web3.utils.toWei('3')});
    topPlayer = await this.sc.topPlayer();
    secondPlayer = await this.sc.secondPlayer();
    currentBidPrice = await this.sc.currentBidPrice();
    console.log(topPlayer, secondPlayer, fromWei(currentBidPrice))
    status = await this.sc.getStatus();
    console.log('status', status.toString());
    for (let i=0; i<60; i++) {
      await time.advanceBlock();
      status = await this.sc.getStatus();
      console.log('status', status.toString());
    }
  });
});
