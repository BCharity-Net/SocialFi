import Slug from '@components/Shared/Slug'
import { BCharityPost } from '@generated/bcharitytypes'
import { UsersIcon } from '@heroicons/react/outline'
import Link from 'next/link'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  post: BCharityPost
}

const GroupPost: FC<Props> = ({ post }) => {
  const { t } = useTranslation('common')
  const commentOn: any = post?.commentOn

  return (
    <div className="flex items-center pb-4 space-x-1 text-gray-500 text-[13px]">
      <UsersIcon className="w-4 h-4" />
      <div className="flex items-center space-x-1">
        <Link href={`/groups/${commentOn?.pubId}`}>
          <a href={`/groups/${commentOn?.pubId}`}>
            <span>{t('Posted on')} </span>
            <Slug slug={post?.commentOn?.metadata?.name} />
          </a>
        </Link>
      </div>
    </div>
  )
}

export default GroupPost
