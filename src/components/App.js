import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import config from '../config.json';
import {
  loadProvider,
  loadNetwork,
  loadAccount,
  loadTokens,
  loadExchange,
  subscribeToEvents,
  loadAllOrders
} from '../store/interactions';
import Navbar from './Navbar';
import Markets from './Markets';
import Balance from './Balance';
import Order from './Order';
import OrderBook from './OrderBook';
import PriceChart from './PriceChart';
import Trades from './Trades';
import Transactions from './Transactions'
import Alert from './Alert';
function App() {
  const dispatch = useDispatch()

  const loadBlockchainData = async () => {

    //Connect Ethers to blockchain
    const provider = loadProvider(dispatch)
    const chainId = await loadNetwork(provider, dispatch)
        //Reload page when network changes
        window.ethereum.on('chainChanged', () => {
          window.location.reload()
        })
    //load account & balance
    window.ethereum.on('accountsChanged',()=>{
      loadAccount(provider,dispatch)
    }) 
    //Load Token Smart Contract
    const mUSD=config[chainId].mUSD
    const mTHETA=config[chainId].mTHETA
    await loadTokens(provider, [mUSD.address,mTHETA.address], dispatch)
    //load exchange
    const exchangeConfig=config[chainId].exchange
    const exchange=await loadExchange(provider,exchangeConfig.address,dispatch)
    //subscribe To Events
    subscribeToEvents(exchange,dispatch)
    //Fetch all orders: open, filled, cancelled
    loadAllOrders(provider,exchange,dispatch)
  }

  useEffect(() => {
    loadBlockchainData()
  })

  return (
    <div>

      <Navbar/>

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          <Markets />

          <Balance/>

          <Order/>

        </section>
        <section className='exchange__section--right grid'>

          <PriceChart/>

          <Transactions/>

          <Trades/>

          <OrderBook/>

        </section>
      </main>

      <Alert/>

    </div>
  );
}

export default App;
