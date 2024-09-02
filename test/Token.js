const{ ethers }= require('hardhat');
const { expect } = require("chai");
const tokens = (n) => {
   return ethers.utils.parseUnits(n.toString(),'ether')
}
describe("Token",()=>{
    let token,accounts,deployer,receiver,exchange
    beforeEach(async ()=>{
        //Fetch Token from the blockchain
        const Token= await ethers.getContractFactory('Token');
        //deploying
          token = await Token.deploy("Mock USD","mUSD",'1000000');
          accounts= await ethers.getSigners();
          deployer= accounts[0];//owner
          receiver=accounts[1];
          exchange=accounts[2];//spender
   })
   describe('Deployement',()=>{
      const totalSupply=tokens('1000000');
      const name='Mock USD';
      const symbol='mUSD';
      const decimal=18;
      //test goes here
      it("has a correct name",async ()=>{
       
         //Read Token
         //const name=await token.name();
         //Check that name is correct
         expect(await token.name()).to.equal(name);
     })
     it("has a correct symbol",async ()=>{
  
         //Read Token
         //const symbol=await token.symbol();
         //Check that name is correct
         expect(await token.symbol()).to.equal(symbol);
     })
     it("has a correct decimal",async ()=>{
  
         //Read Token
         //const decimal=await token.decimal();
         //Check that name is correct
         expect(await token.decimal()).to.equal(decimal);
     })
     it("has a correct total supply",async ()=>{
      
         //Read Token
         //const totalSupply=await token.totalSupply();
         // const value= tokens('1000000')
         //Check that name is correct
         expect(await token.totalSupply()).to.equal(totalSupply);
     })
     it("it assigns total supply to deployer",async ()=>{
      expect(await token.balanceOf(deployer.address)).to.equal(totalSupply);
    })
   })
   describe('Sending Tokens',()=>{
    let amount,transaction,result
    describe('Success',()=>{
        beforeEach(async ()=>{
            amount=tokens(100);
             transaction =await token.connect(deployer).transfer(receiver.address,amount)
             result=await transaction.wait();
        })
        it('transfers token balances',async()=>{
        
            //Log balance before transfer
            //console.log("deployer balance before transfer",await token.balanceOf(deployer.address))
            //console.log("receiver balance before transfer",await token.balanceOf(receiver.address))
            //transfer tokens
          
           //Ensure that tokens are transfered(balace changed)
           expect(await token.balanceOf(deployer.address)).to.equal(tokens(999900));
           expect(await token.balanceOf(receiver.address)).to.equal(amount);
           //Log balance after transfer
           //console.log("deployer balance before transfer",await token.balanceOf(deployer.address))
           //console.log("receiver balance after transfer",await token.balanceOf(receiver.address))
        })
        it('emits a transfer event', async () => {
            const event = result.events[0]
            //console.log(event)
            expect(event.event).to.equal('Transfer')
            const args=event.args
            expect(args.from).to.equal(deployer.address)
            expect(args.to).to.equal(receiver.address)
            expect(args.value).to.equal(amount)
        })
    })

   })
    describe('Failure', () => {
    it('rejects insufficient balances', async () => {
        //Transfer toknes more than deployer has
      const invalidAmount = tokens(100000000)
      await expect(token.connect(deployer).transfer(receiver.address, invalidAmount)).to.be.reverted
    })

    it('rejects invalid recipent', async () => {
      const amount = tokens(100)
      await expect(token.connect(deployer).transfer('0x0000000000000000000000000000000000000000', amount)).to.be.reverted
    })

  })
  describe('Approving Tokens',()=>{
    let amount,transaction,result

    beforeEach(async ()=>{
      amount=tokens(100)
      transaction=await token.connect(deployer).approve(exchange.address,amount)
      result= await transaction.wait()
    })
    describe('Success', () => {
      it('allocates an allowance for delegated token spending', async () => {
        expect(await token.allowance(deployer.address, exchange.address)).to.equal(amount)
      })
      it('emits an Approval event', async () => {
        const event = result.events[0]
        expect(event.event).to.equal('Approval')
        const args = event.args
        expect(args.owner).to.equal(deployer.address)
        expect(args.spender).to.equal(exchange.address)
        expect(args.value).to.equal(amount)
      })
    })
    describe('Failure', () => {
      it('rejects invalid spenders', async () => {
        await expect(token.connect(deployer).approve('0x0000000000000000000000000000000000000000', amount)).to.be.reverted
      })
    })
  })
  describe('Delegated Tokens Transfers',()=>{
    let amount,transaction,result
    beforeEach(async ()=>{
      amount=tokens(100)
      transaction=await token.connect(deployer).approve(exchange.address,amount)
      result= await transaction.wait()
    })
    describe('Success',()=>{
      beforeEach(async ()=>{
        transaction=await token.connect(exchange).transferFrom(deployer.address,receiver.address,amount)
        result= await transaction.wait()
      })
      it('transfers token balances', async () => {
        expect(await token.balanceOf(deployer.address)).to.be.equal(ethers.utils.parseUnits('999900', 'ether'))
        expect(await token.balanceOf(receiver.address)).to.be.equal(amount)
      })
      it('resets allowance',async()=>{
        expect(await token.allowance(deployer.address,exchange.address)).to.be.equal(0)
      })
      it('emits a transfer event', async () => {
        const event = result.events[0]
        //console.log(event)
        expect(event.event).to.equal('Transfer')
        const args=event.args
        expect(args.from).to.equal(deployer.address)
        expect(args.to).to.equal(receiver.address)
        expect(args.value).to.equal(amount)
    })
    })
    describe("Failure", () => {
      it('Rejects insufficient amounts', async () => {
        const invalidAmount = tokens(100000000)
        await expect(token.connect(exchange).transferFrom(deployer.address, receiver.address, invalidAmount)).to.be.reverted
      })
    })
  })
})