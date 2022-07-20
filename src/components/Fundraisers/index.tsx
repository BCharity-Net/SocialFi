import { gql, useQuery } from '@apollo/client'
import { GridItemFour, GridItemSix, GridLayout } from '@components/GridLayout'
import SinglePost from '@components/Post/SinglePost'
import { Card } from '@components/UI/Card'
import { Spinner } from '@components/UI/Spinner'
import SEO from '@components/utils/SEO'
import { BCharityPost } from '@generated/bcharitytypes'
import { PaginatedResultInfo } from '@generated/types'
import { CommentFields } from '@gql/CommentFields'
import { MirrorFields } from '@gql/MirrorFields'
import { PostFields } from '@gql/PostFields'
import Logger from '@lib/logger'
import React, { FC, useState } from 'react'
import { useInView } from 'react-cool-inview'
import { useTranslation } from 'react-i18next'
import { APP_NAME } from 'src/constants'
import { useAppPersistStore } from 'src/store/app'

const EXPLORE_FEED_QUERY = gql`
  query ExploreFeed(
    $request: ExplorePublicationRequest!
    $reactionRequest: ReactionFieldResolverRequest
    $profileId: ProfileId
  ) {
    explorePublications(request: $request) {
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

interface Props {
  // fund: BCharityPost
}

const Fundraisers: FC<Props> = ({}) => {
  const feedType = 'LATEST'
  const { t } = useTranslation('common')
  const [pageInfo, setPageInfo] = useState<PaginatedResultInfo>()
  const [publications, setPublications] = useState<BCharityPost[]>([])
  const { currentUser } = useAppPersistStore()
  const { data, loading, error, fetchMore } = useQuery(EXPLORE_FEED_QUERY, {
    variables: {
      request: {
        sortCriteria: feedType,
        limit: 10,
        noRandomize: feedType === 'LATEST'
      },
      reactionRequest: currentUser ? { profileId: currentUser?.id } : null,
      profileId: currentUser?.id ?? null
    },
    onCompleted(data) {
      const fundraise = data?.explorePublications?.items.filter((i: any) => {
        return i.metadata.attributes[0].value == 'fundraise'
      })
      setPageInfo(data?.explorePublications?.pageInfo)
      setPublications(fundraise)
      Logger.log(
        '[Query]',
        `Fetched first 10 explore publications FeedType:${feedType}`
      )
    }
  })
  const { observe } = useInView({
    onEnter: async () => {
      const { data } = await fetchMore({
        variables: {
          request: {
            sortCriteria: feedType,
            cursor: pageInfo?.next,
            limit: 10,
            noRandomize: feedType === 'LATEST'
          },
          reactionRequest: currentUser ? { profileId: currentUser?.id } : null,
          profileId: currentUser?.id ?? null
        }
      })
      const fundraise = data?.publications?.items.filter((i: any) => {
        return i.metadata.attributes[0].value == 'fundraise'
      })
      console.log('filter ', fundraise)
      setPageInfo(data?.explorePublications?.pageInfo)
      setPublications([...publications, ...data?.explorePublications?.items]) //fundraise
      Logger.log(
        '[Query]',
        `Fetched next 10 explore publications FeedType:${feedType} Next:${pageInfo?.next}`
      )
    }
  })
  // {publications?.map((post: BCharityPost, index: number) => (
  //   <SinglePost key={`${post?.id}_${index}`} post={post} />
  // ))}
  return (
    <GridLayout>
      <SEO title={`Fundraisers • ${APP_NAME}`} />
      {publications?.map((post: BCharityPost, index: number) => (
        <GridItemSix key={`${post?.id}_${index}`}>
          <Card>
            <SinglePost post={post} />
          </Card>
        </GridItemSix>
      ))}
      <GridItemFour>
        {pageInfo?.next && publications.length !== pageInfo?.totalCount && (
          <span ref={observe} className="flex justify-center p-5">
            <Spinner size="sm" />
          </span>
        )}
      </GridItemFour>
    </GridLayout>
  )
}
export default Fundraisers
