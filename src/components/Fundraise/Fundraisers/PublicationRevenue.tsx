import { gql, useQuery } from '@apollo/client'
import Logger from '@lib/logger'
import { FC } from 'react'

interface Props {
  fund: any
  callback?: Function
}

const PUBLICATION_REVENUE_QUERY = gql`
  query PublicationRevenue($request: PublicationRevenueQueryRequest!) {
    publicationRevenue(request: $request) {
      revenue {
        total {
          value
        }
      }
    }
  }
`
const RevenueDetails: FC<Props> = ({ fund, callback }) => {
  useQuery(PUBLICATION_REVENUE_QUERY, {
    variables: {
      request: {
        publicationId:
          fund?.__typename === 'Mirror'
            ? fund?.mirrorOf?.id
            : fund?.pubId ?? fund?.id
      }
    },
    onCompleted(data) {
      Logger.log(
        '[Query]',
        `Fetched fundraise revenue details Fundraise:${fund?.pubId ?? fund?.id}`
      )
      if (!callback) return
      callback(data?.publicationRevenue?.revenue?.total?.value)
    }
  })
  return <div />
}

export default RevenueDetails
