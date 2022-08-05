/* eslint-disable react/jsx-key */
import { gql } from '@apollo/client'
import { Profile } from '@generated/types'
import { CommentFields } from '@gql/CommentFields'
import { MirrorFields } from '@gql/MirrorFields'
import { PostFields } from '@gql/PostFields'
import React, { FC, useMemo } from 'react'

import FundraiseTable from './FundraiseTable'
import { FundsCell, PostCell } from './FundraiseTable/Cells'
import {
  DateSearch,
  FuzzySearch,
  fuzzyTextFilterFn,
  NoFilter
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

const FundraiseOrgFeed: FC<Props> = ({ profile }) => {
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
            Header: 'Funds',
            accessor: 'funds',
            Cell: FundsCell,
            Filter: FuzzySearch,
            filter: fuzzyTextFilterFn
          },
          {
            Header: 'Funding Goal',
            accessor: 'goal',
            Filter: FuzzySearch,
            filter: fuzzyTextFilterFn
          },
          {
            Header: 'VHR Goal',
            accessor: 'vhr',
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

export default FundraiseOrgFeed
