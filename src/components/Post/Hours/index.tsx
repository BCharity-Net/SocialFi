import Markup from '@components/Shared/Markup'
import { Card } from '@components/UI/Card'
import { BCharityPost } from '@generated/bcharitytypes'
import imagekitURL from '@lib/imagekitURL'
import React, { FC, ReactNode } from 'react'
import { STATIC_ASSETS } from 'src/constants'

const Badge: FC<BadgeProps> = ({ title, value }) => (
  <div className="flex bg-gray-200 rounded-full border border-gray-300 dark:bg-gray-800 dark:border-gray-700 text-[12px] w-fit">
    <div className="px-3 bg-gray-300 rounded-full dark:bg-gray-700 py-[0.3px]">
      {title}
    </div>
    <div className="pr-3 pl-2 font-bold py-[0.3px]">{value}</div>
  </div>
)

interface BadgeProps {
  title: ReactNode
  value: ReactNode
}

interface Props {
  post: BCharityPost
}

const Hours: FC<Props> = ({ post }) => {
  const cover = post?.metadata?.cover?.original?.url

  return (
    <Card forceRounded testId="hours">
      <div
        className="h-40 rounded-t-xl border-b sm:h-52 dark:border-b-gray-700/80"
        style={{
          backgroundImage: `url(${
            cover
              ? imagekitURL(cover, 'attachment')
              : `${STATIC_ASSETS}/patterns/2.svg`
          })`,
          backgroundColor: '#8b5cf6',
          backgroundSize: cover ? 'cover' : '30%',
          backgroundPosition: 'center center',
          backgroundRepeat: cover ? 'no-repeat' : 'repeat'
        }}
      />
      <div className="p-5">
        <div className="mr-0 space-y-1 sm:mr-16"></div>

        <div className="text-xl font-bold">
          {' '}
          VHR Submission for {post.metadata.name},{' '}
          {`${post.metadata.attributes[2].value} to ${post.metadata.attributes[3].value}`}
        </div>

        <br></br>

        <div className="text-sm leading-7 whitespace-pre-wrap break-words">
          <Markup>{post.metadata.description}</Markup>
        </div>

        <br></br>

        <div className="text-sm leading-7 whitespace-pre-wrap break-words">
          <Badge
            title={
              <div className="flex items-center space-x-1">
                <div>Total Minutes</div>
              </div>
            }
            value={post.metadata.attributes[4].value}
          />
        </div>
      </div>

      <br></br>
    </Card>
  )
}

export default Hours
