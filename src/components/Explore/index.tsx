import { GridItemEight, GridItemFour, GridLayout } from '@components/GridLayout'
import RecommendedProfiles from '@components/Home/RecommendedProfiles'
import Footer from '@components/Shared/Footer'
import PostsShimmer from '@components/Shared/Shimmer/PostsShimmer'
import SEO from '@components/utils/SEO'
import { NextPage } from 'next'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import FeedType from './FeedType'

const Feed = dynamic(() => import('./Feed'), {
  loading: () => <PostsShimmer />
})

const Explore: NextPage = () => {
  const {
    query: { type }
  } = useRouter()
  const { t } = useTranslation('common')
  const [feedType, setFeedType] = useState<string>(
    type &&
      ['top_commented', 'top_collected', 'latest'].includes(type as string)
      ? type?.toString().toUpperCase()
      : 'TOP_COMMENTED'
  )

  return (
    <GridLayout>
      <SEO title={t('Explore web')} description={t('Web description')} />
      <GridItemEight className="space-y-5" data-test="explore-feed">
        <FeedType setFeedType={setFeedType} feedType={feedType} />
        <Feed feedType={feedType} />
      </GridItemEight>
      <GridItemFour>
        <RecommendedProfiles />
        <Footer />
      </GridItemFour>
    </GridLayout>
  )
}

export default Explore
