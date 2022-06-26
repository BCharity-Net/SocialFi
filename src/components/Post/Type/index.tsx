import { BCharityPost } from '@generated/bcharitytypes'
import { useRouter } from 'next/router'
import React, { FC } from 'react'

import Collected from './Collected'
import Commented from './Commented'
import GroupPost from './GroupPost'
import Mirrored from './Mirrored'

interface Props {
  post: BCharityPost
  hideType?: boolean
  showThread?: boolean
}

const PostType: FC<Props> = ({ post, hideType, showThread }) => {
  const { pathname } = useRouter()
  const type = post?.__typename
  const postType = post?.metadata?.attributes[0]?.value
  const isCollected = !!post?.collectedBy

  return (
    <>
      {type === 'Mirror' && <Mirrored post={post} />}
      {type === 'Comment' &&
        !hideType &&
        !showThread &&
        !isCollected &&
        postType !== 'group post' && <Commented post={post} />}
      {postType === 'group post' &&
        pathname !== '/groups/[id]' &&
        type !== 'Mirror' && <GroupPost post={post} />}
      {isCollected && postType !== 'group' && postType !== 'fundraise' && (
        <Collected post={post} type="Collected" />
      )}
      {isCollected && postType === 'fundraise' && (
        <Collected post={post} type="Funded" />
      )}
    </>
  )
}

export default PostType
