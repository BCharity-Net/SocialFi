import { gql, useQuery } from '@apollo/client'
import { GridItemFour, GridLayout } from '@components/GridLayout'
import { PageLoading } from '@components/UI/PageLoading'
import SEO from '@components/utils/SEO'
import { GroupFields } from '@gql/GroupFields'
import { ChartBarIcon, FireIcon, SparklesIcon } from '@heroicons/react/outline'
import Logger from '@lib/logger'
import { NextPage } from 'next'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { APP_NAME } from 'src/constants'
import Custom500 from 'src/pages/500'

import List from './List'

const GROUP_QUERY = gql`
  query (
    $topCommented: ExplorePublicationRequest!
    $topCollected: ExplorePublicationRequest!
    $latest: ExplorePublicationRequest!
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
    latest: explorePublications(request: $latest) {
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
  const { t } = useTranslation('common')
  const { data, loading, error } = useQuery(GROUP_QUERY, {
    variables: {
      topCommented: {
        sources: `${APP_NAME} Group`,
        sortCriteria: 'TOP_COMMENTED',
        publicationTypes: ['POST'],
        limit: 8
      },
      topCollected: {
        sources: `${APP_NAME} Group`,
        sortCriteria: 'TOP_COLLECTED',
        publicationTypes: ['POST'],
        limit: 8
      },
      latest: {
        sources: `${APP_NAME} Group`,
        sortCriteria: 'LATEST',
        publicationTypes: ['POST'],
        limit: 8
      }
    },
    onCompleted() {
      Logger.log(
        '[Query]',
        `Fetched 10 TOP_COMMENTED, TOP_COLLECTED and LATEST groups`
      )
    }
  })

  if (error) return <Custom500 />
  if (loading || !data) return <PageLoading message="Loading group" />

  return (
    <GridLayout>
      <SEO title={`Groups • ${APP_NAME}`} />
      <GridItemFour>
        <div className="flex items-center mb-2 space-x-1.5 font-bold text-gray-500">
          <FireIcon className="w-5 h-5 text-yellow-500" />
          <div>{t('Most Active')}</div>
        </div>
        <List groups={data?.topCommented.items} testId="most-active-groups" />
      </GridItemFour>
      <GridItemFour>
        <div className="flex items-center mb-2 space-x-1.5 font-bold text-gray-500">
          <ChartBarIcon className="w-5 h-5 text-green-500" />
          <div>{t('Fastest Growing')}</div>
        </div>
        <List
          groups={data?.topCollected.items}
          testId="fastest-growing-groups"
        />
      </GridItemFour>
      <GridItemFour>
        <div className="flex items-center mb-2 space-x-1.5 font-bold text-gray-500">
          <SparklesIcon className="w-5 h-5 text-green-500" />
          <div>{t('Latest')}</div>
        </div>
        <List groups={data?.latest.items} testId="latest-groups" />
      </GridItemFour>
    </GridLayout>
  )
}

export default Groups
