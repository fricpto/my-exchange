import { createSelector } from "reselect";
import { get,groupBy,reject,maxBy,minBy } from "lodash";
import { ethers } from 'ethers';
import moment from "moment";
const GREEN = '#25CE8F'
const RED = '#F45353'
const tokens=state=>get(state,'tokens.contracts')
const allOrders=state=>get(state,'exchange.allOrders.data',[])
const cancelledOrders=state=>get(state,'exchange.cancelledOrders.data',[])
const filledOrders=state=>get(state,'exchange.filledOrders.data',[])
const account=state=>get(state,'provider.account')
const events=state=>get(state,'exchange.events')
const openOrders=state=>{
    const all=allOrders(state)
    const filled=filledOrders(state)
    const cancelled=cancelledOrders(state)
    const openOrders=reject(all,(order)=>{
      const orderFilled=filled.some((o)=>o.id.toString()===order.id.toString())
      const orderCancelled=cancelled.some((o)=>o.id.toString()===order.id.toString())
      return(orderFilled||orderCancelled)
    })
  return openOrders
}
// ------------------------------------------------------------------------------
// MY EVENTS
export const myEventsSelector=createSelector(account,events,(account,events)=>{
  events=events.filter((e)=>e.args.user===account)
  console.log(events)
  return events
})
// ------------------------------------------------------------------------------
// MY OPEN ORDERS
export const myOpenOrdersSelector=createSelector(account,tokens,openOrders,(account,tokens,orders)=>{
  if(!tokens[0]||!tokens[1]){return}
  // Filter orders created by current account
  orders=orders.filter((o)=>o.user===account)
  // Filter orders by selected tokens
  orders=orders.filter((o)=>o.tokenGet===tokens[0].address || o.tokenGet===tokens[1].address)
  orders=orders.filter((o)=>o.tokenGive===tokens[0].address || o.tokenGive===tokens[1].address)
  // Decorate orders - add display attributes
  orders=decorateMyOpenOrders(orders,tokens)
  // Sort orders by date descending
  orders=orders.sort((a,b)=>b.timestamp-a.timestamp)

  return orders
})
const decorateMyOpenOrders=(orders,tokens)=>{
  return(
    orders.map((order)=>{
      order=decorateOrder(order,tokens)
      order=decorateMyOpenOrder(order,tokens)
      return(order)
    })
  )
}
const decorateMyOpenOrder=(order,tokens)=>{
  let orderType=order.tokenGive===tokens[1].address ? 'buy':'sell'
  return({
    ...order,
    orderType,
    orderTypeClass:(orderType==='buy' ? GREEN:RED)
  })
}
const decorateOrder=(order,tokens)=>{
  let token0Amount, token1Amount
  // Note: mUSD should be considered token0, mTHETA is considered token1
  // Example: Giving mTHETA in exchange for mUSD
  if(order.tokenGive===tokens[1].address){
    token0Amount=order.amountGive // The amount of mUSD we are giving
    token1Amount=order.amountGet // The amount of mTHETA we want...
  }else{
    token0Amount=order.amountGet // The amount of mUSD we want
    token1Amount=order.amountGive // The amount of mTHETA we are giving...
  }
  // Calculate token price to 5 decimal places
  const precision=100000
  let tokenPrice=(token1Amount/token0Amount)
  tokenPrice=Math.round(tokenPrice*precision)/precision
  return({
    ...order,
    token1Amount:ethers.utils.formatUnits(token1Amount,"ether"),
    token0Amount:ethers.utils.formatUnits(token0Amount,"ether"),
    tokenPrice,
    formattedtimestamp:moment.unix(order.timestamp).format('h:mm:ssa d MMM D'),
    formattedTimestamp:moment.unix(order.timestamp).format('MMMM Do YYYY, h:mm:ss a')

  })
}
// ------------------------------------------------------------------------------
// ALL FILLED ORDERS
export const filledOrdersSelector=createSelector(filledOrders,tokens,(orders,tokens)=>{
  if(!tokens[0]||!tokens[1]){return}
    // Filter orders by selected tokens
    orders=orders.filter((o)=>o.tokenGet===tokens[0].address || o.tokenGet===tokens[1].address)
    orders=orders.filter((o)=>o.tokenGive===tokens[0].address || o.tokenGive===tokens[1].address)
    // Sort orders by time ascending for price comparison
    orders=orders.sort((a,b)=>a.timestamp-b.timestamp)
    // Decorate the orders
    orders=decorateFilledOrders(orders,tokens)
    // Sort orders by date descending for display
    orders=orders.sort((a,b)=>b.timestamp-a.timestamp)

    return orders
})
const decorateFilledOrders=(orders,tokens)=>{
    // Track previous order to compare history
    let previousOrder=orders[0]
  return(
    orders.map((order)=>{
      // decorate each individual order
      order=decorateOrder(order,tokens)
      order=decorateFilledOrder(order,previousOrder)
      previousOrder=order // Update the previous order once it's decorated
      return order
    })
  )
}

const decorateFilledOrder=(order,previousOrder)=>{
  return({
    ...order,
    tokenPriceClass:tokenPriceClass(order.tokenPrice,order.id,previousOrder)
  })
}
const tokenPriceClass=(tokenPrice,orderId,previousOrder)=>{
   // Show green price if only one order exists
   if(previousOrder.id===orderId){
    return GREEN
   }
   // Show green price if order price higher than previous order
   // Show red price if order price lower than previous order
  if(previousOrder.tokenPrice<=tokenPrice){
    return GREEN // success
  }else{
    return RED // danger
  }
}
// ------------------------------------------------------------------------------
// MY FILLED ORDERS
export const myFilledOrdersSelector=createSelector(account,tokens,filledOrders,(account,tokens,orders)=>{
  if(!tokens[0]||!tokens[1]) {return}
  // Find our orders
  orders=orders.filter((o)=>o.user===account || o.creator===account)
  // Filter orders by selected tokens
  orders=orders.filter((o)=>o.tokenGet===tokens[0].address || o.tokenGet===tokens[1].address)
  orders=orders.filter((o)=>o.tokenGive===tokens[0].address || o.tokenGive===tokens[1].address)
  // Sort by date descending
  orders=orders.sort((a,b)=>b.timestamp-a.timestamp)
  // Decorate orders - add display attributes
  orders=decorateMyFilledOrders(orders,account,tokens)

  return orders
})
const decorateMyFilledOrders=(orders,account,tokens)=>{
  return(
    orders.map((order)=>{
      order=decorateOrder(order,tokens)
      order=decorateMyFilledOrder(order,account,tokens)
      return(order)
    })
  )
}
const decorateMyFilledOrder=(order,account,tokens)=>{
  const myOrder=order.creator===account
  let orderType
  if(myOrder){
    orderType=order.tokenGive===tokens[1].address ? 'buy':'sell'
  }else{
    orderType=order.tokenGive===tokens[1].address ? 'sell':'buy'
  }
  return({
    ...order,
    orderType,
    orderClass:(orderType==='buy' ? GREEN:RED),
    orderSign:(orderType==='buy' ? '+':'-')
  })
}
// ------------------------------------------------------------------------------
// ORDER BOOK
export const orderBookSelector=createSelector(openOrders,tokens,(orders,tokens)=>{
  if(!tokens[0]||!tokens[1]) {return}
  // Filter orders by selected tokens
  orders=orders.filter((o)=>o.tokenGet===tokens[0].address || o.tokenGet===tokens[1].address)
  orders=orders.filter((o)=>o.tokenGive===tokens[0].address || o.tokenGive===tokens[1].address)
  // Decorate orders
  orders=decorateOrderBookOrders(orders,tokens)
  // Group orders by "orderType"
  orders=groupBy(orders,'orderType')
  // Fetch buy orders
  const buyOrders=get(orders,'buy',[])
  // Sort buy orders by token price
  orders={
    ...orders,
    buyOrders:buyOrders.sort((a, b)=>b.tokenPrice-a.tokenPrice)
  }
  // Fetch sell orders
  const sellOrders=get(orders,'sell',[])
  // Sort sell orders by token price
  orders={
    ...orders,
    sellOrders:sellOrders.sort((a, b)=>b.tokenPrice-a.tokenPrice)
  }  
  return orders
  }
)
const decorateOrderBookOrder=(order,tokens)=>{
  const orderType=order.tokenGive===tokens[1].address?'buy':'sell'
  return({
    ...order,
    orderType,
    orderTypeClass:(orderType==='buy'?GREEN:RED),
    orderFillAction:(orderType==='buy'?'sell':'buy')
  })
}
const decorateOrderBookOrders=(orders,tokens)=>{
  return(
    orders.map((order)=>{
      order=decorateOrder(order,tokens)
      order=decorateOrderBookOrder(order,tokens)
      return(order)
    })
  )
}
// ------------------------------------------------------------------------------
// PRICE CHART
export const priceChartSelector=createSelector(filledOrders,tokens,(orders,tokens)=>{
  if(!tokens[0]||!tokens[1]){return}
    // Filter orders by selected tokens
    orders=orders.filter((o)=>o.tokenGet===tokens[0].address || o.tokenGet===tokens[1].address)
    orders=orders.filter((o)=>o.tokenGive===tokens[0].address || o.tokenGive===tokens[1].address)
    // Sort orders by date ascending to compare history
    orders=orders.sort((a,b)=>b.timestamp-a.timestamp)
    // Decorate orders - add display attributes
    orders=orders.map((o)=>decorateOrder(o,tokens))
    // Get last 2 order for final price & price change
    let secondLastOrder,lastOrder
    [secondLastOrder,lastOrder]=orders.slice(orders.length-2,orders.length)
    // get last order price
    const lastPrice=get(lastOrder,'tokenPrice',0)
    // get second last order price
    const secondLastPrice=get(secondLastOrder,'tokenPrice',0)
    
    return({
      lastPrice,
      lastPriceChange:(lastPrice>=secondLastPrice ? '+':'-'),
      series:[{
        data:buildGraphData(orders)
      }]
    })
})
const buildGraphData=(orders)=>{
  // Group the orders by hour and the day for the graph
  orders=groupBy(orders,(o)=>moment.unix(o.timestamp).startOf('hour').startOf('day').format())
  const hours=Object.keys(orders)
  const graphData=hours.map((hour)=>{
    // Fetch all orders from current hour
    const group=orders[hour]
    // Calculate price values: open, high, low, close
    const open=group[0] // first price
    const high=maxBy(group,'tokenPrice') // high price
    const low=minBy(group,'tokenPrice') // low price
    const close=group[group.length-1] // la st order
    return({
      x:new Date(hour),
      y:[open.tokenPrice, high.tokenPrice, low.tokenPrice, close.tokenPrice]
    })
  })
  return graphData
}