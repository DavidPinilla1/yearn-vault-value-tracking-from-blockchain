import React from "react";
import { useEffect, useState } from 'react';
import {
	Chart,
	LineAdvance,
	Tooltip,Interval,
} from "bizcharts";
import Web3 from 'web3'
import vaultAIB from './vault.json'
import EthDater  from 'ethereum-block-by-date';
import dayjs from 'dayjs'

const VaultChart =()=> {
    const [state, setState] = useState({balances:[], period:'hours'})
    useEffect(()=>{
      loadWeb3()
      loadVault(state.period)
    },[])
    const loadWeb3= () =>{
      if (window.ethereum) {
          window.web3 = new Web3(window.ethereum);
          window.ethereum.enable();
      }
    }
    
    const loadVault= async(period) =>{
        if(!period)return;
        try {
            const {methods:{getPricePerFullShare,balanceOf}} = await new window.web3.eth.Contract(vaultAIB, '0xcC7E70A958917cCe67B4B87a8C30E6297451aE98')
            const {selectedAddress} =window.ethereum
            console.log(selectedAddress)
            const {fromWei} = window.web3.utils
            const dater = new EthDater( window.web3);
            console.log(period)
            let blocks = await dater.getEvery( period, '2021-03-20T12:00:00Z',  Date.now());
            const balances = await Promise.all(blocks.map(async (b,i,arr)=>{
                const price = fromWei(await getPricePerFullShare().call({},b.block))
                const balance = fromWei(await balanceOf(selectedAddress).call({},b.block))
                const gusdCRV=+price*+balance*1.015
                return {...b, gusdCRV,price,balance, date:dayjs(b.date).format('DD-MMM  HHa')} 
            }))
            setState({
                period,
                balances: balances.map((b,i,arr)=>({...b,diff:b.gusdCRV - arr[i-1]?.gusdCRV || 0}))
                .filter(b=>b.diff)
            })
        } catch (error) {
            console.warn(error)
        }
    }
        <div style={{ padding: "20px" } }>
            {state.balances &&
            <Chart
                appendPadding={[10, 0, 0, 10]}
                autoFit
                height={500}
                data={state.balances}
                scale={
                    { gusdCRV: { min: 24200, alias: 'GUSD', type: 'linear-strict' ,}},
                    { diff: { min: 0, alias: 'USD', type: 'linear-strict', }}
                }>
                <Interval position="date*diff"  color="#a8ffd6" />
                <LineAdvance position="date*gusdCRV" point shape="smooth" />
                <Tooltip showCrosshairs visible />
            </Chart>
            }
        </div>
    );
	
}
export default VaultChart