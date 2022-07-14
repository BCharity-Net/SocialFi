import { gql, useQuery } from '@apollo/client'
import { GridItemEight, GridItemFour, GridLayout } from '@components/GridLayout'
import PostsShimmer from '@components/Shared/Shimmer/PostsShimmer'
import SEO from '@components/utils/SEO'
import { GroupFields } from '@gql/GroupFields'
import Logger from '@lib/logger'
import { NextPage } from 'next'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import React from 'react'
import Custom404 from 'src/pages/404'
import Custom500 from 'src/pages/500'

import Details from './Details'
import GroupPageShimmer from './Shimmer'

const Feed = dynamic(() => import('@components/Comment/Feed'), {
  loading: () => <PostsShimmer />
})

const GROUP_QUERY = gql`
  query Group($request: PublicationQueryRequest!) {
    publication(request: $request) {
      ... on Post {
        ...GroupFields
      }
    }
  }
  ${GroupFields}
`

const ViewGroup: NextPage = () => {
  const {
    query: { id }
  } = useRouter()
  const { data, loading, error } = useQuery(GROUP_QUERY, {
    variables: { request: { publicationId: id } },
    skip: !id,
    onCompleted() {
      Logger.log('[Query]', `Fetched group details Group:${id}`)
    }
  })

  if (error) return <Custom500 />
  if (loading || !data) return <GroupPageShimmer />
  if (
    !data.publication ||
    data.publication?.metadata?.attributes[0]?.value !== 'group'
  )
    return <Custom404 />

  return (
    <GridLayout>
      <SEO title={`${data?.publication?.metadata?.name} • BCharity`} />
      <GridItemFour>
        <Details group={data.publication} />
      </GridItemFour>
      <GridItemEight className="space-y-5">
        <Feed post={data.publication} type="group post" />
      </GridItemEight>
    </GridLayout>
  )
}

export default ViewGroup
