import { Alchemy, Network } from 'alchemy-sdk'
import Web3 from 'web3'

import { ALCHEMY_KEY, IS_MAINNET, VHR_TOKEN } from './constants'

const config = {
  apiKey: ALCHEMY_KEY,
  network: IS_MAINNET ? Network.MATIC_MAINNET : Network.MATIC_MUMBAI
}
const alchemy = new Alchemy(config)

export const getTotalVHRSent = async (txnHash) => {
  const data = await alchemy.core.getAssetTransfers({
    fromBlock: '0x0',
    fromAddress: txnHash,
    category: ['external', 'erc20', 'erc721', 'erc1155']
  })

  let result = 0
  for (const events of data.transfers) {
    if (events.rawContract.address === VHR_TOKEN.toLowerCase()) {
      const value = events.rawContract.value
      result += Web3.utils.hexToNumber(value)
    }
  }
  return result
}
