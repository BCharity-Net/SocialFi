import { DAI_ABI } from '@abis/DAI_ABI'
import { GOOD_ABI } from '@abis/GOOD_ABI'
import { WMATIC_ABI } from '@abis/WMATIC_ABI'
import {
  DAI_TOKEN,
  GIVE_DAI_LP,
  GOOD_TOKEN,
  VHR_TO_DAI_PRICE,
  WMATIC_GOOD_LP,
  WMATIC_TOKEN
} from 'src/constants'
import { useContractRead } from 'wagmi'

export const VhrToGoodRate = () => {
  const bal = useContractRead({
    addressOrName: GOOD_TOKEN,
    contractInterface: GOOD_ABI,
    functionName: 'balanceOf',
    watch: true,
    args: [GIVE_DAI_LP]
  })

  const balQ = useContractRead({
    addressOrName: DAI_TOKEN,
    contractInterface: DAI_ABI,
    functionName: 'balanceOf',
    watch: true,
    args: [GIVE_DAI_LP]
  })

  const decs = useContractRead({
    addressOrName: GOOD_TOKEN,
    contractInterface: GOOD_ABI,
    functionName: 'decimals',
    watch: true
  })

  var decimals: any = decs?.data
  var balanceOfQuote = parseInt(balQ.data?._hex as string, 16)
  var balanceOf = parseInt(bal.data?._hex as string, 16)

  const quoteTokenAmountTotal = balanceOfQuote / 10 ** decimals
  const tokenAmountTotal = balanceOf / 10 ** decimals
  const goodToDAIPrice = +(quoteTokenAmountTotal / tokenAmountTotal).toFixed(8)
  const vhrToGoodPrice = +(VHR_TO_DAI_PRICE / goodToDAIPrice).toFixed(8)

  return vhrToGoodPrice
}

export const WmaticToGoodRate = () => {
  const bal = useContractRead({
    addressOrName: GOOD_TOKEN,
    contractInterface: GOOD_ABI,
    functionName: 'balanceOf',
    watch: true,
    args: [WMATIC_GOOD_LP]
  })

  const balQ = useContractRead({
    addressOrName: WMATIC_TOKEN,
    contractInterface: WMATIC_ABI,
    functionName: 'balanceOf',
    watch: true,
    args: [WMATIC_GOOD_LP]
  })

  const decs = useContractRead({
    addressOrName: GOOD_TOKEN,
    contractInterface: GOOD_ABI,
    functionName: 'decimals',
    watch: true
  })

  var decimals: any = decs?.data
  var balanceOfQuote = parseInt(balQ.data?._hex as string, 16)
  var balanceOf = parseInt(bal.data?._hex as string, 16)

  const quoteTokenAmountTotal = balanceOfQuote / 10 ** decimals
  const tokenAmountTotal = balanceOf / 10 ** decimals
  const wmaticToGoodPrice = +(quoteTokenAmountTotal / tokenAmountTotal).toFixed(
    8
  )
  //   const wmaticToGoodPrice = +(VHR_TO_DAI_PRICE / wmaticToDAIPrice).toFixed(8)

  return wmaticToGoodPrice
}
