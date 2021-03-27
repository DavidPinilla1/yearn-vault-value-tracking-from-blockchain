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
import { Select } from 'antd';
const { Option } = Select;

const VaultChart =()=> {
    const [state, setState] = useState({balances:[], period:'hours'})
    useEffect(()=>{
      loadWeb3()
      loadVault()
    }, [])
    const loadWeb3= () =>{
      if (window.ethereum) {
          window.web3 = new Web3(window.ethereum);
          window.ethereum.enable();
      }
    }
    
    const loadVault= async() =>{
        const { period } = state.period
        try {
            const {methods:{getPricePerFullShare,balanceOf}} = await new window.web3.eth.Contract(vaultAIB, '0xcC7E70A958917cCe67B4B87a8C30E6297451aE98')
            const {selectedAddress} =window.ethereum
            const {fromWei} = window.web3.utils
            const dater = new EthDater( window.web3);
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
    const scale = {
        gusdCRV: { min: 24200, alias: 'GUSD', type: 'linear-strict' },
        diff: { min: 0, alias: 'USD', type: 'linear-strict' }
    }
    return (
        <div style={{ padding: "20px" } }>
            <Select
                style={{ width: 200 }}
                placeholder="Select period"
                optionFilterProp="children"
                value={state.period}
                onChange={v=>loadVault(v)}
            >
                <Option value="hours">Hours</Option>
                <Option value="days">Days</Option>
                <Option value="weeks">Weeks</Option>
            </Select>
            {state.balances &&
            <Chart
                appendPadding={[10, 0, 0, 10]}
                autoFit
                height={500}
                data={state.balances}
                scale={scale}>
                <Interval position="date*diff"  color="#a8ffd6" />
                <LineAdvance position="date*gusdCRV" point shape="smooth" />
                <Tooltip showCrosshairs visible />
            </Chart>
            }
        </div>
    );
	
}
export default VaultChart