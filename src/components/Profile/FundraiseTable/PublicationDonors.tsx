/* eslint-disable react/jsx-no-useless-fragment */
import { gql, useQuery } from '@apollo/client'
import { CommentFields } from '@gql/CommentFields'
import { MinimalProfileFields } from '@gql/MinimalProfileFields'
import Logger from '@lib/logger'
import { FC } from 'react'
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

const COLLECTORS_QUERY = gql`
  query Collectors($request: WhoCollectedPublicationRequest!) {
    whoCollectedPublication(request: $request) {
      items {
        address
        defaultProfile {
          ...MinimalProfileFields
          isFollowedByMe
        }
      }
      pageInfo {
        next
        totalCount
      }
    }
  }
  ${MinimalProfileFields}
`

interface Props {
  pubId: string
  callback?: Function
}

interface CollectProps {
  id: string
  callback?: Function
}

export const CollectDonors: FC<CollectProps> = ({ id, callback }) => {
  useQuery(COLLECTORS_QUERY, {
    variables: { request: { publicationId: id, limit: 10 } },
    skip: !id,
    onCompleted(data) {
      if (callback) callback(data)
      Logger.log('[Query]', `Fetched first 10 collectors Publication:${id}`)
    }
  })
  return <div />
}

const PublicationDonors: FC<Props> = ({ pubId, callback }) => {
  const { currentUser } = useAppPersistStore()

  const { data, loading } = useQuery(COMMENT_FEED_QUERY, {
    variables: {
      request: { commentsOf: pubId },
      reactionRequest: currentUser ? { profileId: currentUser?.id } : null,
      profileId: currentUser?.id ?? null
    },
    fetchPolicy: 'no-cache'
  })

  return (
    <>
      {!loading && (
        <div>
          {data?.publications.items.map((i: any, index: number) => {
            return (
              <CollectDonors
                key={index}
                id={i.id}
                callback={(data: any) => {
                  data?.whoCollectedPublication?.items?.forEach((pub: any) => {
                    if (callback) callback(pub.defaultProfile.handle)
                  })
                }}
              />
            )
          })}
        </div>
      )}
    </>
  )
}

export default PublicationDonors
