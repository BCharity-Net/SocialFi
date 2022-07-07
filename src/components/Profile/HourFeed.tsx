/* eslint-disable react/jsx-key */
import { gql, useQuery } from '@apollo/client'
import SinglePost from '@components/Post/SinglePost'
import PostsShimmer from '@components/Shared/Shimmer/PostsShimmer'
import { Card } from '@components/UI/Card'
import { EmptyState } from '@components/UI/EmptyState'
import { ErrorMessage } from '@components/UI/ErrorMessage'
import { Spinner } from '@components/UI/Spinner'
import { BCharityPost } from '@generated/bcharitytypes'
import { PaginatedResultInfo, Profile } from '@generated/types'
import { CommentFields } from '@gql/CommentFields'
import { MirrorFields } from '@gql/MirrorFields'
import { PostFields } from '@gql/PostFields'
import { CollectionIcon } from '@heroicons/react/outline'
import Logger from '@lib/logger'
// import { type } from 'cypress/types/jquery'
import React, { FC, useState } from 'react'
import { useInView } from 'react-cool-inview'
import { Column } from 'react-table'
import { useAppPersistStore } from 'src/store/app'

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

interface Data {
  items: {
    orgID: string
    volunteer: string
    date: string
    totalMinutes: number
  }
}

interface Props {
  profile: Profile
}

const columns: Column<any>[] = [
  {
    Header: 'Organization',
    accessor: 'organization'
  },
  {
    Header: 'Volunteer',
    accessor: 'volunteer'
  },
  {
    Header: 'Date',
    accessor: 'date'
  },
  {
    Header: 'Total Minutes',
    accessor: 'totalMinutes'
  }
]

const HourFeed: FC<Props> = ({ profile }) => {
  const { currentUser } = useAppPersistStore()
  const [publications, setPublications] = useState<BCharityPost[]>([])
  const [pageInfo, setPageInfo] = useState<PaginatedResultInfo>()
  const { data, loading, error, fetchMore } = useQuery(PROFILE_FEED_QUERY, {
    variables: {
      request: { publicationTypes: 'POST', profileId: profile?.id, limit: 10 },
      reactionRequest: currentUser ? { profileId: currentUser?.id } : null,
      profileId: currentUser?.id ?? null
    },
    skip: !profile?.id,
    fetchPolicy: 'no-cache',
    onCompleted(data) {
      const result = data?.publications?.items.filter((i: any) => {
        return i.metadata.attributes[0].value == 'hours'
      })
      setPageInfo(data?.publications?.pageInfo)
      setPublications(result)
      Logger.log(
        'Query =>',
        `Fetched first 10 hour submissions Profile:${profile?.id}`
      )
    }
  })

  const { observe } = useInView({
    onEnter: async () => {
      const { data } = await fetchMore({
        variables: {
          request: {
            publicationTypes: 'POST',
            profileId: profile?.id,
            cursor: pageInfo?.next,
            limit: 10
          },
          reactionRequest: currentUser ? { profileId: currentUser?.id } : null,
          profileId: currentUser?.id ?? null
        }
      })
      setPageInfo(data?.publications?.pageInfo)
      setPublications([...publications, ...data?.publications?.items])
      Logger.log(
        'Query =>',
        `Fetched next 10 profile publications Profile:${profile?.id} Next:${pageInfo?.next}`
      )
    }
  })
  // const table = useTable({ columns, data })

  return (
    <>
      {loading && <PostsShimmer />}
      {data?.publications?.items?.length === 0 && (
        <EmptyState
          message={
            <div>
              <span className="mr-1 font-bold">@{profile?.handle}</span>
              <span>seems like not {'POST'.toLowerCase()}ed yet!</span>
            </div>
          }
          icon={<CollectionIcon className="w-8 h-8 text-brand" />}
        />
      )}
      <ErrorMessage title="Failed to load hours" error={error} />
      {!error && !loading && data?.publications?.items?.length !== 0 && (
        <>
          <Card
            className="divide-y-[1px] dark:divide-gray-700/80"
            testId="profile-feed"
          >
            {publications?.map((post: BCharityPost, index: number) => (
              <>
                {post?.metadata?.attributes[0]?.value}
                <SinglePost key={`${post?.id}_${index}`} post={post} />
              </>
            ))}
          </Card>
          {pageInfo?.next && publications.length !== pageInfo?.totalCount && (
            <span ref={observe} className="flex justify-center p-5">
              <Spinner size="sm" />
            </span>
          )}
        </>
      )}
      {/* <Card>
        <table
          className="w-full text-md text-center mb-2 mt-2"
          {...table.getTableProps()}
        >
          <thead>
            {table.headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th className="p-4" {...column.getHeaderProps()}>
                    {column.render('Header')}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...table.getTableBodyProps()}>
            {table.rows.map((row) => {
              table.prepareRow(row)
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell) => {
                    return (
                      <td className="p-4" {...cell.getCellProps()}>
                        {cell.render('Cell')}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card> */}
    </>
  )
}

export default HourFeed
