import Web3 from 'web3'
import { AbiItem } from 'web3-utils'

import {
  IS_MAINNET,
  POLYGON_MAINNET,
  POLYGON_MUMBAI,
  VHR_TOKEN
} from './constants'
const web3 = new Web3(
  IS_MAINNET ? POLYGON_MAINNET.rpcUrls.default : POLYGON_MUMBAI.rpcUrls.default
)

const abi = [
  // balanceOf
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function'
  },
  // decimals
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function'
  }
]
const tokenAddress = VHR_TOKEN

const VhrToken = new web3.eth.Contract(abi as AbiItem[], tokenAddress)

export const getBalanceOf = async (address: string) => {
  let balance = await VhrToken.methods.balanceOf(address).call()
  return balance
}

export default VhrToken
