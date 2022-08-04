import { gql, useQuery } from '@apollo/client'
import { CommentFields } from '@gql/CommentFields'
import { MirrorFields } from '@gql/MirrorFields'
import { PostFields } from '@gql/PostFields'
import { FC } from 'react'
import { useAppPersistStore } from 'src/store/app'

import { Data } from './Individual'

const PROFILE_QUERY = gql`
  query Profile($request: SingleProfileQueryRequest!) {
    profile(request: $request) {
      id
    }
  }
`

const PROFILE_FEED_QUERY = gql`
  query ProfileFeed(
    $request: PublicationsQueryRequest!
    $reactionRequest: ReactionFieldResolverRequest
    $profileId: ProfileId
  ) {
    publications(request: $request) {
      items {
        ... on Post {
          ...PostFields
        }
        ... on Comment {
          ...CommentFields
        }
        ... on Mirror {
          ...MirrorFields
        }
      }
      pageInfo {
        totalCount
        next
      }
    }
  }
  ${PostFields}
  ${CommentFields}
  ${MirrorFields}
`

interface ProfileProps {
  id: string
  nft: Data
  callback?: Function
}

interface Props {
  nft: Data
  callback?: Function
}

const Profile: FC<ProfileProps> = ({ id, nft, callback }) => {
  const { currentUser } = useAppPersistStore()

  useQuery(PROFILE_FEED_QUERY, {
    variables: {
      request: {
        publicationTypes: 'POST',
        profileId: id
      },
      reactionRequest: currentUser ? { profileId: currentUser?.id } : null,
      profileId: currentUser?.id ?? null
    },
    fetchPolicy: 'no-cache',
    onCompleted(data) {
      if (!callback) return
      data?.publications?.items?.forEach((item: any) => {
        if (item?.metadata?.attributes[3]?.value === nft.uuid) {
          callback(item)
          return
        }
      })
    }
  })

  return <div />
}

const NFT: FC<Props> = ({ nft, callback }) => {
  const { data, loading } = useQuery(PROFILE_QUERY, {
    variables: {
      request: { handle: nft.orgName }
    }
  })

  return (
    <div>
      {!loading && (
        <Profile id={data.profile.id} nft={nft} callback={callback} />
      )}
    </div>
  )
}

export default NFT
