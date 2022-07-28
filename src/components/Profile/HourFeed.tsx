/* eslint-disable react/jsx-key */
import { gql } from '@apollo/client'
import { Profile } from '@generated/types'
import { CommentFields } from '@gql/CommentFields'
import { MirrorFields } from '@gql/MirrorFields'
import { PostFields } from '@gql/PostFields'
import React, { FC, useMemo, useState } from 'react'

import VHRTable from './VHRTable'
import { ProfileCell, StatusCell, TotalHoursCell } from './VHRTable/Cells'
import {
  DateSearch,
  FuzzySearch,
  fuzzyTextFilterFn,
  getStatusFn,
  greaterThanEqualToFn,
  lessThanEqualToFn,
  NoFilter,
  SelectColumnFilter
} from './VHRTable/Filters'

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

const HourFeed: FC<Props> = ({ profile }) => {
  const [addressData, setAddressData] = useState<string[]>([])

  const columns = useMemo(
    () => [
      {
        Header: 'VHR Submissions',
        columns: [
          {
            Header: 'Organization',
            accessor: 'orgName',
            Cell: ProfileCell,
            Filter: FuzzySearch,
            filter: fuzzyTextFilterFn
          },
          {
            Header: 'Program',
            accessor: 'program',
            Filter: FuzzySearch,
            filter: fuzzyTextFilterFn
          },
          {
            Header: 'City/Region',
            accessor: 'city',
            Filter: FuzzySearch,
            filter: fuzzyTextFilterFn
          },
          {
            Header: 'Category',
            accessor: 'category',
            Filter: FuzzySearch,
            filter: fuzzyTextFilterFn
          },
          {
            Header: 'Start Date',
            accessor: 'startDate',
            Filter: DateSearch,
            filter: greaterThanEqualToFn
          },
          {
            Header: 'End Date',
            accessor: 'endDate',
            Filter: DateSearch,
            filter: lessThanEqualToFn
          },
          {
            Header: 'Total Hours',
            accessor: 'totalHours',
            Cell: TotalHoursCell,
            Filter: NoFilter
          },
          {
            Header: 'Status',
            accessor: 'verified',
            Cell: (props: {
              value: { index: number; value: string; postID: string }
            }) => StatusCell(props, addressData),
            Filter: SelectColumnFilter,
            filter: getStatusFn
          }
        ]
      }
    ],
    [addressData]
  )

  const tableLimit = 10

  return (
    <VHRTable
      profile={profile}
      handleQueryComplete={(data: any) => {
        return data?.publications?.items.filter((i: any) => {
          return i.metadata.attributes[0].value === 'hours'
        })
      }}
      getColumns={(add: string[]) => {
        setAddressData(add)
        return columns
      }}
      query={PROFILE_FEED_QUERY}
      request={{
        publicationTypes: 'POST',
        profileId: profile?.id,
        limit: tableLimit
      }}
      tableLimit={tableLimit}
      from={false}
    />
  )
}

export default HourFeed
