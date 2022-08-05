/* eslint-disable react/jsx-no-useless-fragment */
import { gql, useQuery } from '@apollo/client'
import {
  CommentValue,
  PUBLICATION_REVENUE_QUERY
} from '@components/Post/Fundraise'
import { CommentFields } from '@gql/CommentFields'
import Logger from '@lib/logger'
import { FC, useEffect, useState } from 'react'
import { useAppPersistStore } from 'src/store/app'

const COMMENT_FEED_QUERY = gql`
  query CommentFeed(
    $request: PublicationsQueryRequest!
    $reactionRequest: ReactionFieldResolverRequest
    $profileId: ProfileId
  ) {
    publications(request: $request) {
      items {
        ... on Comment {
          ...CommentFields
        }
      }
      pageInfo {
        totalCount
        next
      }
    }
  }
  ${CommentFields}
`

interface Props {
  pubId: string
  callback?: Function
}

const PublicationRevenue: FC<Props> = ({ pubId, callback }) => {
  const { currentUser } = useAppPersistStore()
  const [revenue, setRevenue] = useState<number>(0)

  let commentValue = 0

  const { data: revenueData, loading: revenueLoading } = useQuery(
    PUBLICATION_REVENUE_QUERY,
    {
      variables: {
        request: {
          publicationId: pubId
        }
      },
      onCompleted() {
        Logger.log(
          '[Query]',
          `Fetched fundraise revenue details Fundraise:${pubId}`
        )
      }
    }
  )

  const { data, loading } = useQuery(COMMENT_FEED_QUERY, {
    variables: {
      request: { commentsOf: pubId },
      reactionRequest: currentUser ? { profileId: currentUser?.id } : null,
      profileId: currentUser?.id ?? null
    },
    fetchPolicy: 'no-cache'
  })

  useEffect(() => {
    setRevenue(
      parseFloat(revenueData?.publicationRevenue?.revenue?.total?.value ?? 0)
    )
  }, [revenueData])

  return (
    <>
      {!revenueLoading && !loading && (
        <div>
          {data?.publications.items.map((i: any, index: number) => {
            const length = data?.publications.items.length
            return (
              <CommentValue
                key={index}
                id={i.id}
                callback={(data: any) => {
                  if (data?.publicationRevenue) {
                    const value = data?.publicationRevenue?.revenue.total.value
                    commentValue += Number(value)
                  }
                  setRevenue(revenue + commentValue)
                  if (callback && index === length - 1)
                    callback(revenue + commentValue)
                }}
              />
            )
          })}
        </div>
      )}
    </>
  )
}

export default PublicationRevenue
