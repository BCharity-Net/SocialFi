import { DAI_ABI } from '@abis/DAI_ABI'
import { GOOD_ABI } from '@abis/GOOD_ABI'
import { useState } from 'react'
import {
  DAI_TOKEN,
  GIVE_DAI_LP,
  GOOD_TOKEN,
  VHR_TO_DAI_PRICE
} from 'src/constants'
import { useContractRead } from 'wagmi'

const vhr_to_good = () => {
  const [balanceOf, setBalanceOf] = useState(-99)
  const [balanceOfQuote, setBalanceOfQuote] = useState(-99)
  const [decimals, setDecimals] = useState(-99)

  useContractRead({
    addressOrName: GOOD_TOKEN,
    contractInterface: GOOD_ABI,
    functionName: 'balanceOf',
    watch: true,
    args: [GIVE_DAI_LP],

    onSuccess(data) {
      //console.log('Success', data)
      setBalanceOf(parseFloat(data.toString()))
      //console.log(totalSupply);
    }
  })

  useContractRead({
    addressOrName: DAI_TOKEN,
    contractInterface: DAI_ABI,
    functionName: 'balanceOf',
    watch: true,
    args: [GIVE_DAI_LP],

    onSuccess(data) {
      //console.log('Success', data)
      setBalanceOfQuote(parseFloat(data.toString()))
      //console.log(totalSupply);
    }
  })

  useContractRead({
    addressOrName: GOOD_TOKEN,
    contractInterface: GOOD_ABI,
    functionName: 'decimals',
    watch: true,
    onSuccess(data) {
      //console.log('Success', data)
      setDecimals(parseFloat(data.toString()))
      //console.log(totalSupply);
    }
  })

  const quoteTokenAmountTotal = balanceOfQuote / 10 ** decimals
  const tokenAmountTotal = balanceOf / 10 ** decimals
  const goodToDAIPrice = +(quoteTokenAmountTotal / tokenAmountTotal).toFixed(8)

  const vhrToGoodPrice = +(VHR_TO_DAI_PRICE / goodToDAIPrice).toFixed(1)
  //   console.log(vhrToGoodPrice)

  return <span> {vhrToGoodPrice} </span>
}

export default vhr_to_good
