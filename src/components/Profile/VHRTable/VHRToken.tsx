import { gql, useQuery } from '@apollo/client'
import { CommentFields } from '@gql/CommentFields'
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

interface Props {
  pubId: string
  callback?: Function
}

const VHRToken: FC<Props> = ({ pubId, callback }) => {
  const { currentUser } = useAppPersistStore()
  useQuery(COMMENT_FEED_QUERY, {
    variables: {
      request: { commentsOf: pubId },
      reactionRequest: currentUser ? { profileId: currentUser?.id } : null,
      profileId: currentUser?.id ?? null
    },
    fetchPolicy: 'no-cache',
    onCompleted(data) {
      if (!callback) return
      callback(data)
    }
  })
  return <div />
}

export default VHRToken
