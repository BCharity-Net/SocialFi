/* eslint-disable react/jsx-key */
import { gql } from '@apollo/client'
import { Profile } from '@generated/types'
import React, { FC, useMemo } from 'react'

import { PostCell } from './FundraiseTable/Cells'
import {
  DateSearch,
  FuzzySearch,
  fuzzyTextFilterFn,
  NoFilter
} from './FundraiseTable/Filters'
import FundraiseTable from './FundraiseTable/Individual'

const PROFILE_NFT_FEED_QUERY = gql`
  query ProfileNFTFeed($request: NFTsRequest!) {
    nfts(request: $request) {
      items {
        contentURI
      }
      pageInfo {
        next
        totalCount
      }
    }
  }
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
            Header: 'Organization Name',
            accessor: 'orgName',
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
      handleQueryComplete={() => {}}
      getColumns={() => {
        return columns
      }}
      query={PROFILE_NFT_FEED_QUERY}
      request={{}}
      tableLimit={tableLimit}
    />
  )
}

export default FundraiseFeed
