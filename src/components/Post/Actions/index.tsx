import { BCharityPost } from '@generated/bcharitytypes'
import React, { FC } from 'react'

import Collect from './Collect'
import Comment from './Comment'
import Like from './Like'
import PostMenu from './Menu'
import Mirror from './Mirror'

interface Props {
  post: BCharityPost
}

const PostActions: FC<Props> = ({ post }) => {
  const postType = post?.metadata?.attributes[0]?.value

  return postType !== 'group' ? (
    <div className="flex gap-8 items-center pt-3 -ml-2 text-gray-500">
      <Comment post={post} />
      <Mirror post={post} />
      <Like post={post} />
      {post?.collectModule?.__typename !== 'RevertCollectModuleSettings' &&
        postType !== 'fundraise' &&
        postType !== 'fundraise-comment' &&
        postType !== 'hours' && <Collect post={post} />}
      <PostMenu post={post} />
    </div>
  ) : null
}

export default PostActions
