import { gql, useQuery } from '@apollo/client'
import Markup from '@components/Shared/Markup'
import { Card } from '@components/UI/Card'
import { BCharityPost } from '@generated/bcharitytypes'
import imagekitURL from '@lib/imagekitURL'
import Logger from '@lib/logger'
import React, { FC, ReactNode, useEffect, useState } from 'react'
import { STATIC_ASSETS } from 'src/constants'

export const PUBLICATION_REVENUE_QUERY = gql`
  query PublicationRevenue($request: PublicationRevenueQueryRequest!) {
    publicationRevenue(request: $request) {
      earnings {
        value
      }
    }
  }
`

const Badge: FC<BadgeProps> = ({ title, value }) => (
  <div className="flex bg-gray-200 rounded-full border border-gray-300 dark:bg-gray-800 dark:border-gray-700 text-[12px] w-fit">
    <div className="px-3 bg-gray-300 rounded-full dark:bg-gray-700 py-[0.3px]">
      {title}
    </div>
    <div className="pr-3 pl-2 font-bold py-[0.3px]">{value}</div>
  </div>
)

interface BadgeProps {
  title: ReactNode
  value: ReactNode
}

interface Props {
  fund: BCharityPost
}

const Fundraise: FC<Props> = ({ fund }) => {
  const [revenue, setRevenue] = useState<number>(0)

  const { data: revenueData, loading: revenueLoading } = useQuery(
    PUBLICATION_REVENUE_QUERY,
    {
      variables: {
        request: {
          publicationId:
            fund?.__typename === 'Mirror'
              ? fund?.mirrorOf?.id
              : fund?.pubId ?? fund?.id
        }
      },
      onCompleted() {
        Logger.log(
          'Query =>',
          `Fetched fundraise revenue details Fundraise:${
            fund?.pubId ?? fund?.id
          }`
        )
      }
    }
  )

  useEffect(() => {
    setRevenue(
      parseFloat(revenueData?.publicationRevenue?.earnings?.value ?? 0)
    )
  }, [revenueData])

  const goalAmount = fund?.metadata?.attributes[1]?.value
  const percentageReached = revenue
    ? (revenue / parseInt(goalAmount as string)) * 100
    : 0
  const cover = fund?.metadata?.cover?.original?.url

  return (
    <Card forceRounded testId="fundraise">
      <div
        className="h-40 rounded-t-xl border-b sm:h-52 dark:border-b-gray-700/80"
        style={{
          backgroundImage: `url(${
            cover
              ? imagekitURL(cover, 'attachment')
              : `${STATIC_ASSETS}/patterns/2.svg`
          })`,
          backgroundColor: '#8b5cf6',
          backgroundSize: cover ? 'cover' : '30%',
          backgroundPosition: 'center center',
          backgroundRepeat: cover ? 'no-repeat' : 'repeat'
        }}
      />
      <div className="p-5">
        <div className="mr-0 space-y-1 sm:mr-16"></div>

        <div className="text-xl font-bold"> Volunteer Hour Verification </div>

        <br></br>

        <div className="text-sm leading-7 whitespace-pre-wrap break-words">
          <Markup>Food distribution (COBS bread) to those in need.</Markup>
        </div>

        <br></br>

        <div className="text-sm leading-7 whitespace-pre-wrap break-words">
          <Badge
            title={
              <div className="flex items-center space-x-1">
                <div>Organization ID</div>
              </div>
            }
            value={'0x33a2-0x07'}
          />
        </div>

        <br></br>

        <div className="text-sm leading-7 whitespace-pre-wrap break-words">
          <Badge
            title={
              <div className="flex items-center space-x-1">
                <div>Total Minutes</div>
              </div>
            }
            value={'128'}
          />
        </div>
        <br></br>
      </div>
    </Card>
  )
}

export default Fundraise
