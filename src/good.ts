import Web3 from 'web3'

import { IS_MAINNET, POLYGON_MAINNET, POLYGON_MUMBAI } from './constants'
const web3 = new Web3(
  IS_MAINNET ? POLYGON_MAINNET.rpcUrls.default : POLYGON_MUMBAI.rpcUrls.default
)

export const getGoodSent = (hash: string, callback?: Function) => {
  web3.eth.getTransaction(hash).then((result) => {
    const value = web3.utils.hexToNumberString('0x' + result.input.slice(74))
    if (callback) callback(Number(value) * 1e-18)
  })
}
