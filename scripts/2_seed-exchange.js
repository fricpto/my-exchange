const config = require('../src/config.json')
const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}
const wait = (seconds) => {
const milliseconds = seconds * 1000
return new Promise(resolve => setTimeout(resolve, milliseconds))
}
async function main() {
// Fetch accounts from wallet - these are unlocked
const accounts= await ethers.getSigners()
// Fetch network
const { chainId } = await ethers.provider.getNetwork()
console.log("Using chainId:", chainId)
const mUSD=await ethers.getContractAt('Token',config[chainId].mUSD.address)
console.log(`mUSD Token fetched: ${mUSD.address}\n`)

const mTHETA=await ethers.getContractAt('Token',config[chainId].mTHETA.address)
console.log(`mTHETA Token fetched: ${mTHETA.address}\n`)

const mBNB=await ethers.getContractAt('Token',config[chainId].mBNB.address)
console.log(`mBNB Token fetched: ${mBNB.address}\n`)
// Fetch the deployed exchange
const exchange = await ethers.getContractAt('Exchange',config[chainId].exchange.address)
console.log(`Exchange fetched: ${exchange.address}\n`)
// Give tokens to account[1]
const sender = accounts[0]
const receiver = accounts[1]
let amount = tokens(10000)

// user1 transfers 10,000 mTHETA...
let transaction, result
transaction = await mTHETA.connect(sender).transfer(receiver.address, amount)
console.log(`Transferred ${amount} tokens from ${sender.address} to ${receiver.address}\n`)

// Set up exchange users
const user1 = accounts[0]
const user2 = accounts[1]
amount = tokens(10000)

// user1 approves 10,000 mUSD...
transaction = await mUSD.connect(user1).approve(exchange.address, amount)
await transaction.wait()
console.log(`Approved ${amount} tokens from ${user1.address}`)

// user1 deposits 10,000 mUSD...
transaction = await exchange.connect(user1).depositToken(mUSD.address, amount)
await transaction.wait()
console.log(`Deposited ${amount} Ether from ${user1.address}\n`)

// User 2 Approves mTHETA
transaction = await mTHETA.connect(user2).approve(exchange.address, amount)
await transaction.wait()
console.log(`Approved ${amount} tokens from ${user2.address}`)

// User 2 Deposits mTHETA
transaction = await exchange.connect(user2).depositToken(mTHETA.address, amount)
await transaction.wait()
console.log(`Deposited ${amount} tokens from ${user2.address}\n`)

/////////////////////////////////////////////////////////////
// Seed a Cancelled Order
//

// User 1 makes order to get tokens
let orderId
transaction = await exchange.connect(user1).makeOrder(mTHETA.address, tokens(100), mUSD.address, tokens(5))
result = await transaction.wait()
console.log(`Made order from ${user1.address}`)

// User 1 cancels order
orderId = result.events[0].args.id
transaction = await exchange.connect(user1).cancelOrder(orderId)
result = await transaction.wait()
console.log(`Cancelled order from ${user1.address}\n`)


// Wait 1 second
await wait(1)

/////////////////////////////////////////////////////////////
// Seed Filled Orders
//

// User 1 makes order
transaction = await exchange.connect(user1).makeOrder(mTHETA.address, tokens(100), mUSD.address, tokens(10))
result = await transaction.wait()
console.log(`Made order from ${user1.address}`)

// User 2 fills order
orderId = result.events[0].args.id
transaction = await exchange.connect(user2).fillOrder(orderId)
result = await transaction.wait()
console.log(`Filled order from ${user1.address}\n`)

// Wait 1 second
await wait(1)

// User 1 makes another order
transaction = await exchange.makeOrder(mTHETA.address, tokens(50), mUSD.address, tokens(15))
result = await transaction.wait()
console.log(`Made order from ${user1.address}`)

// User 2 fills another order
orderId = result.events[0].args.id
transaction = await exchange.connect(user2).fillOrder(orderId)
result = await transaction.wait()
console.log(`Filled order from ${user1.address}\n`)

// Wait 1 second
await wait(1)

// User 1 makes final order
transaction = await exchange.connect(user1).makeOrder(mTHETA.address, tokens(200), mUSD.address, tokens(20))
result = await transaction.wait()
console.log(`Made order from ${user1.address}`)

// User 2 fills final order
orderId = result.events[0].args.id
transaction = await exchange.connect(user2).fillOrder(orderId)
result = await transaction.wait()
console.log(`Filled order from ${user1.address}\n`)

// Wait 1 second
await wait(1)

/////////////////////////////////////////////////////////////
// Seed Open Orders
//

// User 1 makes 10 orders
for(let i = 1; i <= 10; i++) {
transaction = await exchange.connect(user1).makeOrder(mTHETA.address, tokens(10 * i), mUSD.address, tokens(10))
result = await transaction.wait()

console.log(`Made order from ${user1.address}`)

// Wait 1 second
await wait(1)
}

// User 2 makes 10 orders
for (let i = 1; i <= 10; i++) {
transaction = await exchange.connect(user2).makeOrder(mUSD.address, tokens(10), mTHETA.address, tokens(10 * i))
result = await transaction.wait()

console.log(`Made order from ${user2.address}`)

// Wait 1 second
await wait(1)
}
// Distribute tokens

// Deposit tokens to exchange

// Make orders

// Cancel orders

// Fill orders
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
