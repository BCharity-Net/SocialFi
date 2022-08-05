/* eslint-disable react/jsx-key */
import { gql } from '@apollo/client'
import { Profile } from '@generated/types'
import { CommentFields } from '@gql/CommentFields'
import { MirrorFields } from '@gql/MirrorFields'
import { PostFields } from '@gql/PostFields'
import React, { FC, useMemo } from 'react'

import OpportunitiesTable from './OpportunitiesTable'
import { PostCell } from './OpportunitiesTable/Cells'
import {
  DateSearch,
  FuzzySearch,
  fuzzyTextFilterFn,
  greaterThanEqualToFn,
  lessThanEqualToFn,
  NoFilter
} from './OpportunitiesTable/Filters'

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

const OpportunitiesOrgFeed: FC<Props> = ({ profile }) => {
  const columns = useMemo(
    () => [
      {
        Header: 'Volunteer Opportunities',
        columns: [
          {
            Header: 'Program',
            accessor: 'program',
            Filter: FuzzySearch,
            filter: fuzzyTextFilterFn
          },
          {
            Header: 'Position',
            accessor: 'position',
            Filter: FuzzySearch,
            filter: fuzzyTextFilterFn
          },
          {
            Header: 'Number of Volunteers',
            accessor: 'volunteers',
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
            Filter: FuzzySearch,
            filter: fuzzyTextFilterFn
          },
          {
            Header: 'Link to Post',
            accessor: 'postID',
            Cell: PostCell,
            Filter: NoFilter
          }
        ]
      }
    ],
    []
  )

  const tableLimit = 10

  return (
    <OpportunitiesTable
      profile={profile}
      handleQueryComplete={(data: any) => {
        return data?.publications?.items.filter((i: any) => {
          return i.metadata.attributes[0].value === 'opportunities'
        })
      }}
      getColumns={() => {
        return columns
      }}
      query={PROFILE_FEED_QUERY}
      request={{
        publicationTypes: 'POST',
        profileId: profile?.id,
        limit: tableLimit
      }}
      tableLimit={tableLimit}
    />
  )
}

export default OpportunitiesOrgFeed
