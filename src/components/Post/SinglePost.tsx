import UserProfile from '@components/Shared/UserProfile'
import { BCharityPost } from '@generated/bcharitytypes'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import Link from 'next/link'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import PostActions from './Actions'
import HiddenPost from './HiddenPost'
import PostBody from './PostBody'
import PostType from './Type'

dayjs.extend(relativeTime)

interface Props {
  post: BCharityPost
  showType?: boolean
  showThread?: boolean
  showActions?: boolean
}

const SinglePost: FC<Props> = ({
  post,
  showType = true,
  showThread = false,
  showActions = true
}) => {
  const postType = post?.metadata?.attributes[0]?.value
  const { t } = useTranslation('common')

  return (
    <div className="p-5" data-test="publication">
      <PostType post={post} showType={showType} showThread={showThread} />
      <div>
        <div className="flex justify-between pb-4 space-x-1.5">
          <UserProfile
            profile={
              postType === 'group' && !!post?.collectedBy?.defaultProfile
                ? post?.collectedBy?.defaultProfile
                : post?.__typename === 'Mirror'
                ? post?.mirrorOf?.profile
                : post?.profile
            }
          />
          <Link href={`/posts/${post?.id ?? post?.pubId}`}>
            <a
              href={`/posts/${post?.id ?? post?.pubId}`}
              className="text-sm text-gray-500"
              data-test="publication-timestamp"
            >
              {`${dayjs(new Date(post?.createdAt)).fromNow()}`}
            </a>
          </Link>
        </div>
        <div className="ml-[53px]" data-test="publication-content">
          {post?.hidden ? (
            <HiddenPost type={post?.__typename} />
          ) : (
            <>
              <PostBody post={post} />
              {showActions && <PostActions post={post} />}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default SinglePost
