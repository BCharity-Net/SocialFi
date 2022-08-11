import { gql, useQuery } from '@apollo/client'
import { GridItemFour, GridLayout } from '@components/GridLayout'
import Like from '@components/Post/Actions/Like'
import Share from '@components/Post/Actions/Share'
import Markup from '@components/Shared/Markup'
import { Button } from '@components/UI/Button'
import { Card } from '@components/UI/Card'
import { Spinner } from '@components/UI/Spinner'
import { Tooltip } from '@components/UI/Tooltip'
import SEO from '@components/utils/SEO'
import { BCharityPost } from '@generated/bcharitytypes'
import { PaginatedResultInfo } from '@generated/types'
import { CommentFields } from '@gql/CommentFields'
import { MirrorFields } from '@gql/MirrorFields'
import { PostFields } from '@gql/PostFields'
import getTokenImage from '@lib/getTokenImage'
import imagekitURL from '@lib/imagekitURL'
import Logger from '@lib/logger'
import React, { FC, useState } from 'react'
import { useInView } from 'react-cool-inview'
import { useTranslation } from 'react-i18next'
import { APP_NAME, STATIC_ASSETS } from 'src/constants'
import { useAppPersistStore } from 'src/store/app'

import RevenueDetails from './PublicationRevenue'

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
  // post: BCharityPost
}

const Fundraisers: FC<Props> = ({}) => {
  const { t } = useTranslation('common')
  const feedType = 'LATEST'
  const [pageInfo, setPageInfo] = useState<PaginatedResultInfo>()
  const [publications, setPublications] = useState<BCharityPost[]>([])
  const [revenueData, setRevenueData] = useState<number[]>([])
  const { currentUser } = useAppPersistStore()

  const { data, loading, error, fetchMore } = useQuery(EXPLORE_FEED_QUERY, {
    variables: {
      request: {
        sortCriteria: feedType,
        limit: 50,
        noRandomize: feedType === 'LATEST'
      },
      reactionRequest: currentUser ? { profileId: currentUser?.id } : null,
      profileId: currentUser?.id ?? null
    },
    onCompleted(data) {
      const fundraise = data?.explorePublications?.items.filter((i: any) => {
        return i?.metadata?.attributes[0]?.value == 'fundraise'
      })
      fundraise.map((i: any) => {
        // if (!fundraise) {
        revenueData.push(0)
        // }
      })

      setPageInfo(data?.explorePublications?.pageInfo)
      setPublications(fundraise)

      setRevenueData([...revenueData])
      Logger.log(
        '[Query]',
        `Fetched first 50 explore publications FeedType:${feedType}`
      )
    }
  })
  console.log(revenueData)

  const { observe } = useInView({
    onEnter: async () => {
      const { data } = await fetchMore({
        variables: {
          request: {
            sortCriteria: feedType,
            cursor: pageInfo?.next,
            limit: 50,
            noRandomize: feedType === 'LATEST'
          },
          reactionRequest: currentUser ? { profileId: currentUser?.id } : null,
          profileId: currentUser?.id ?? null
        }
      })
      const fundraise = data?.explorePublications?.items.filter((i: any) => {
        return i?.metadata?.attributes[0]?.value == 'fundraise'
      })
      // console.log('publication', publications.length)
      const nextValues = data?.explorePublications?.items
      let count = 0
      // console.log('next 15', nextValues)
      nextValues.forEach((i: any) => {
        if (i?.metadata?.attributes[0]?.value == 'fundraise') {
          count++
        }
      })

      console.log('page info', pageInfo?.next)
      console.log(
        'explore publications',
        data?.explorePublications?.pageInfo?.next
      )
      setPageInfo(data?.explorePublications?.pageInfo)
      setPublications([...publications, ...fundraise])
      console.log('count', count)
      Logger.log(
        '[Query]',
        `Fetched next 50 explore publications FeedType:${feedType} Next:${pageInfo?.next}`
      )
    }
  })

  var cover

  return (
    <GridLayout>
      <SEO title={`Fundraisers • ${APP_NAME}`} />
      {publications?.map(
        (post: BCharityPost, index: number) => (
          (cover = post?.metadata?.cover?.original?.url),
          (
            <GridItemFour key={`${post?.id}_${index}`}>
              <Card>
                {/* <SinglePost post={post} /> */}

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
                  <div className="block justify-between items-center sm:flex">
                    <div className="mr-0 space-y-1 sm:mr-16">
                      <div className="text-xl font-bold">
                        {post?.metadata?.name}
                      </div>
                      <div className="text-sm leading-7 whitespace-pre-wrap break-words">
                        <Markup>
                          {post?.metadata?.description
                            ?.replace(/\n\s*\n/g, '\n\n')
                            .trim()}
                        </Markup>
                      </div>
                      <div
                        className="block sm:flex items-center !my-3 space-y-2 sm:space-y-0 sm:space-x-3"
                        data-test="fundraise-meta"
                      ></div>
                    </div>
                  </div>
                  <GridLayout className="!p-0 mt-5">
                    <GridItemFour className="!mb-4 space-y-1 sm:mb-0">
                      {loading ? (
                        <div className="w-16 h-5 !mt-2 rounded-md shimmer" />
                      ) : (
                        <span className="flex items-center space-x-1.5">
                          <Tooltip content={'WMATIC'}>
                            <img
                              className="w-7 h-7"
                              height={28}
                              width={28}
                              src={getTokenImage('WMATIC')}
                              alt={'WMATIC'}
                            />
                          </Tooltip>
                          <span className="space-x-1">
                            <RevenueDetails
                              fund={post}
                              callback={(revenue: any) => {
                                revenueData[index] = revenue
                                if (!revenueData[index]) {
                                  revenueData[index] = 0
                                }
                                setRevenueData([...revenueData])
                              }}
                            />
                            <span className="text-2xl font-bold">
                              {revenueData[index]}
                            </span>
                            <span className="text-xs">{'Raised'}</span>
                          </span>
                        </span>
                      )}
                      <Like post={post} />
                      <Share post={post} />

                      <a
                        href={`/posts/${post?.id}`}
                        key={post?.id}
                        style={{ textDecoration: 'none' }}
                      >
                        <Button>Donate</Button>
                      </a>
                    </GridItemFour>
                  </GridLayout>
                </div>
              </Card>
            </GridItemFour>
          )
        )
      )}
      {pageInfo?.next && publications.length !== pageInfo?.totalCount && (
        <span ref={observe} className="flex justify-center p-5">
          <Spinner size="sm" />
        </span>
      )}
    </GridLayout>
  )
}

export default Fundraisers
