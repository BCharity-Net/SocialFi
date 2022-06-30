import {
  NotificationProfileAvatar,
  NotificationProfileName
} from '@components/Notification/Profile'
import {
  NotificationWalletProfileAvatar,
  NotificationWalletProfileName
} from '@components/Notification/WalletProfile'
import { BCharityNotification } from '@generated/bcharitytypes'
import { NewCollectNotification } from '@generated/types'
import { CashIcon, CollectionIcon, UsersIcon } from '@heroicons/react/solid'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import Link from 'next/link'
import React, { FC } from 'react'

import CollectedAmount from './Amount'
import CollectedContent from './Content'

dayjs.extend(relativeTime)

interface Props {
  notification: NewCollectNotification & BCharityNotification
}

const CollectNotification: FC<Props> = ({ notification }) => {
  const postType =
    notification?.collectedPublication?.metadata?.attributes[0]?.value ??
    notification?.collectedPublication?.__typename?.toLowerCase()

  return (
    <div className="flex justify-between items-start">
      <div className="space-y-2 w-4/5">
        <div className="flex items-center space-x-3">
          {postType === 'group' ? (
            <UsersIcon className="h-6 w-6 text-pink-500/70" />
          ) : postType === 'fundraise' ? (
            <CashIcon className="h-6 w-6 text-pink-500/70" />
          ) : (
            <CollectionIcon className="h-6 w-6 text-pink-500/70" />
          )}
          {notification?.wallet?.defaultProfile ? (
            <NotificationProfileAvatar
              profile={notification?.wallet?.defaultProfile}
            />
          ) : (
            <NotificationWalletProfileAvatar wallet={notification?.wallet} />
          )}
        </div>
        <div className="ml-9">
          {notification?.wallet?.defaultProfile ? (
            <NotificationProfileName
              profile={notification?.wallet?.defaultProfile}
            />
          ) : (
            <NotificationWalletProfileName wallet={notification?.wallet} />
          )}{' '}
          <span className="text-gray-600 dark:text-gray-400">
            {postType === 'group'
              ? 'joined your'
              : postType === 'fundraise'
              ? 'funded your'
              : 'collected your'}{' '}
          </span>
          <Link
            href={
              postType === 'group'
                ? `/groups/${notification?.collectedPublication?.id}`
                : `/posts/${notification?.collectedPublication?.id}`
            }
          >
            <a
              href={
                postType === 'group'
                  ? `/groups/${notification?.collectedPublication?.id}`
                  : `/posts/${notification?.collectedPublication?.id}`
              }
              className="font-bold"
            >
              {postType}
            </a>
          </Link>
          <CollectedContent notification={notification} />
          {postType !== 'group' && (
            <CollectedAmount notification={notification} />
          )}
        </div>
      </div>
      <div className="text-gray-400 text-[12px]">
        {dayjs(new Date(notification?.createdAt)).fromNow()}
      </div>
    </div>
  )
}

export default CollectNotification
