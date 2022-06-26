import { gql, useQuery } from '@apollo/client'
import { GridItemSix, GridLayout } from '@components/GridLayout'
import { PageLoading } from '@components/UI/PageLoading'
import SEO from '@components/utils/SEO'
import { GroupFields } from '@gql/GroupFields'
import { ChartBarIcon, FireIcon } from '@heroicons/react/outline'
import consoleLog from '@lib/consoleLog'
import { NextPage } from 'next'
import React from 'react'
import Custom500 from 'src/pages/500'

import List from './List'

const GROUP_QUERY = gql`
  query (
    $topCommented: ExplorePublicationRequest!
    $topCollected: ExplorePublicationRequest!
  ) {
    topCommented: explorePublications(request: $topCommented) {
      items {
        ... on Post {
          ...GroupFields
        }
      }
    }
    topCollected: explorePublications(request: $topCollected) {
      items {
        ... on Post {
          ...GroupFields
        }
      }
    }
  }
  ${GroupFields}
`

const Groups: NextPage = () => {
  const { data, loading, error } = useQuery(GROUP_QUERY, {
    variables: {
      topCommented: {
        sources: 'BCharity Group',
        sortCriteria: 'TOP_COMMENTED',
        publicationTypes: ['POST'],
        limit: 8
      },
      topCollected: {
        sources: 'BCharity Group',
        sortCriteria: 'TOP_COLLECTED',
        publicationTypes: ['POST'],
        limit: 8
      }
    },
    onCompleted() {
      consoleLog(
        'Query',
        '#8b5cf6',
        `Fetched 10 TOP_COMMENTED and TOP_COLLECTED groups`
      )
    }
  })

  if (error) return <Custom500 />
  if (loading || !data) return <PageLoading message="Loading group" />

  return (
    <GridLayout>
      <SEO title="Groups • BCharity" />
      <GridItemSix>
        <div className="flex items-center mb-2 space-x-1.5 font-bold text-gray-500">
          <FireIcon className="w-5 h-5 text-yellow-500" />
          <div>Most Active</div>
        </div>
        <List groups={data?.topCommented.items} />
      </GridItemSix>
      <GridItemSix>
        <div className="flex items-center mb-2 space-x-1.5 font-bold text-gray-500">
          <ChartBarIcon className="w-5 h-5 text-green-500" />
          <div>Fastest Growing</div>
        </div>
        <List groups={data?.topCollected.items} />
      </GridItemSix>
    </GridLayout>
  )
}

export default Groups
