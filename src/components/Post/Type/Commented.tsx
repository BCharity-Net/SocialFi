import { BCharityPost } from '@generated/bcharitytypes'
import React, { FC } from 'react'

import ThreadBody from '../ThreadBody'

interface Props {
  post: BCharityPost
}

const Commented: FC<Props> = ({ post }) => {
  const commentOn: BCharityPost | any = post?.commentOn
  const mainPost = commentOn?.mainPost
  const postType = mainPost?.metadata?.attributes[0]?.value

  return (
    <div>
      {mainPost && postType !== 'group' ? <ThreadBody post={mainPost} /> : null}
      <ThreadBody post={commentOn} />
    </div>
  )
}

export default Commented
