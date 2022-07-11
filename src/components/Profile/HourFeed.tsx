/* eslint-disable react/jsx-key */
import { gql, useQuery } from '@apollo/client'
import PostsShimmer from '@components/Shared/Shimmer/PostsShimmer'
import { Card } from '@components/UI/Card'
import { EmptyState } from '@components/UI/EmptyState'
import { ErrorMessage } from '@components/UI/ErrorMessage'
import { Profile } from '@generated/types'
import { CommentFields } from '@gql/CommentFields'
import { MirrorFields } from '@gql/MirrorFields'
import { PostFields } from '@gql/PostFields'
import { CollectionIcon } from '@heroicons/react/outline'
// import Logger from '@lib/logger'
import React, { FC, useState } from 'react'
import { Column, useTable } from 'react-table'
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

interface Props {
  profile: Profile
}

interface Data {
  orgID: string
  description: string
  startDate: string
  endDate: string
  totalMinutes: number
  verified: boolean
}

const columns: Column<any>[] = [
  {
    Header: 'Organization',
    accessor: 'orgID'
  },
  {
    Header: 'Description',
    accessor: 'description'
  },
  {
    Header: 'Start Date',
    accessor: 'startDate'
  },
  {
    Header: 'End Date',
    accessor: 'endDate'
  },
  {
    Header: 'Total Minutes',
    accessor: 'totalMinutes'
  }
  // {
  //   Header: 'Status',
  //   accessor: 'verified'
  // }
]

const HourFeed: FC<Props> = ({ profile }) => {
  const { currentUser } = useAppPersistStore()
  const [tableData, setTableData] = useState<Data[]>([])
  const { data, loading, error } = useQuery(PROFILE_FEED_QUERY, {
    variables: {
      request: { publicationTypes: 'POST', profileId: profile?.id, limit: 10 },
      reactionRequest: currentUser ? { profileId: currentUser?.id } : null,
      profileId: currentUser?.id ?? null
    },
    skip: !profile?.id,
    fetchPolicy: 'no-cache',
    onCompleted(data) {
      const hours = data?.publications?.items.filter((i: any) => {
        return i.metadata.attributes[0].value == 'hours'
      })
      // var verified = 'False'
      const result: Data[] = hours.map((i: any) => {
        // if (i.metadata.attributes[3].value == 60) {
        //   verified = 'True'
        // }
        console.log('This is the metadata')
        console.log(i)
        return {
          orgID: i.metadata.name,
          description: i.metadata.description,
          startDate: i.metadata.attributes[2].value,
          endDate: i.metadata.attributes[3].value,
          totalMinutes: i.metadata.attributes[4].value
          // verified: verified
        }
      })
      setTableData(result)
    }
  })

  const table = useTable({ columns, data: tableData })
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
        <Card>
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
        </Card>
      )}
    </>
  )
}

export default HourFeed
