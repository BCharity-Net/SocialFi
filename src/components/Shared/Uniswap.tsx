import {
  BCharityCollectModule,
  BCharityFollowModule
} from '@generated/bcharitytypes'
import getUniswapURL from '@lib/getUniswapURL'
import React, { FC } from 'react'

interface Props {
  module: BCharityCollectModule | BCharityFollowModule
}

const Uniswap: FC<Props> = ({ module }) => {
  return (
    <div className="space-y-1">
      <div className="text-sm">
        You don't have enough <b>{module?.amount?.asset?.symbol}</b>
      </div>
      <a
        href={getUniswapURL(
          parseFloat(module?.amount?.value),
          module?.amount?.asset?.address
        )}
        className="flex items-center space-x-1.5 text-xs font-bold text-pink-500"
        target="_blank"
        rel="noreferrer noopener"
      >
        <img
          src="https://assets.bcharity.xyz/images/brands/uniswap.png"
          className="w-5 h-5"
          height={20}
          width={20}
          alt="Uniswap"
        />
        <div>Swap in Uniswap</div>
      </a>
    </div>
  )
}

export default Uniswap
