import Slug from '@components/Shared/Slug'
import { BCharityPost } from '@generated/bcharitytypes'
import { ChatAlt2Icon } from '@heroicons/react/outline'
import Link from 'next/link'
import React, { FC } from 'react'

interface Props {
  publication: BCharityPost
}

const PublicationCommented: FC<Props> = ({ publication }) => {
  const sourceIsGroup =
    publication?.commentOn?.metadata?.attributes[0]?.value === 'group post'
  // @ts-ignore
  const sourceId = publication?.commentOn?.id ?? publication?.commentOn?.pubId
  const sourceProfileHandle = publication?.commentOn?.profile?.handle

  return (
    <div className="flex items-center pb-4 space-x-1 text-gray-500 text-[13px]">
      <ChatAlt2Icon className="w-4 h-4" />
      <div className="flex items-center space-x-1">
        <Link href={`/posts/${sourceId}`}>
          <a href={`/posts/${sourceId}`}>
            Commented on{' '}
            {sourceIsGroup
              ? 'post'
              : publication?.commentOn?.__typename?.toLowerCase()}{' '}
            by
          </a>
        </Link>
        <Link href={`/u/${sourceProfileHandle}`}>
          <a href={`/u/${sourceProfileHandle}`}>
            <Slug slug={sourceProfileHandle} prefix="@" />
          </a>
        </Link>
      </div>
    </div>
  )
}

export default PublicationCommented
