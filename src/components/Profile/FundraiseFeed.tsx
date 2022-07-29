/* eslint-disable react/jsx-key */
import { gql } from '@apollo/client'
import { Profile } from '@generated/types'
import { CommentFields } from '@gql/CommentFields'
import { MirrorFields } from '@gql/MirrorFields'
import { PostFields } from '@gql/PostFields'
import React, { FC, useMemo } from 'react'

import FundraiseTable from './FundraiseTable'
import { PostCell } from './FundraiseTable/Cells'
import { NoFilter } from './FundraiseTable/Filters'
import {
  DateSearch,
  FuzzySearch,
  fuzzyTextFilterFn
} from './FundraiseTable/Filters'

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

const FundraiseFeed: FC<Props> = ({ profile }) => {
  const columns = useMemo(
    () => [
      {
        Header: 'Fundraisers',
        columns: [
          {
            Header: 'Name',
            accessor: 'name',
            Filter: FuzzySearch,
            filter: fuzzyTextFilterFn
          },
          {
            Header: 'Description',
            accessor: 'description',
            Filter: FuzzySearch,
            filter: fuzzyTextFilterFn
          },
          {
            Header: 'Goal',
            accessor: 'goal',
            Filter: FuzzySearch,
            filter: fuzzyTextFilterFn
          },
          {
            Header: 'Date',
            accessor: 'date',
            Filter: DateSearch
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
    <FundraiseTable
      profile={profile}
      handleQueryComplete={(data: any) => {
        return data?.publications?.items.filter((i: any) => {
          return i.metadata.attributes[0].value === 'fundraise'
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

export default FundraiseFeed
