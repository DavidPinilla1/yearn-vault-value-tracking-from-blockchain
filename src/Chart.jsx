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
    },[])
    const loadWeb3= () =>{
      if (window.ethereum) {
          window.web3 = new Web3(window.ethereum);
          window.ethereum.enable();
      }
    }

const Chart =()=> {
}
export default VaultChart