import { Group } from '@generated/bcharitytypes'
import { UsersIcon } from '@heroicons/react/outline'
import humanize from '@lib/humanize'
import imagekitURL from '@lib/imagekitURL'
import Link from 'next/link'
import React, { FC } from 'react'

interface Props {
  group: Group
}

const GroupProfile: FC<Props> = ({ group }) => {
  return (
    <div className="flex justify-between items-center">
      <Link href={`/groups/${group?.id}`}>
        <a href={`/groups/${group?.id}`}>
          <div className="flex items-center space-x-3">
            <img
              src={imagekitURL(
                group?.metadata?.cover?.original?.url
                  ? group?.metadata?.cover?.original?.url
                  : `https://avatar.tobi.sh/${group?.id}.png`,
                'avatar'
              )}
              className="w-16 h-16 bg-gray-200 rounded-xl border dark:border-gray-700/80"
              height={64}
              width={64}
              alt={group?.id}
            />
            <div className="space-y-1">
              <div className="">{group?.metadata?.name}</div>
              <div className="text-sm text-gray-500">
                {group?.metadata?.description}
              </div>
              {group?.stats?.totalAmountOfCollects !== 0 && (
                <div className="flex items-center space-x-1 text-sm">
                  <UsersIcon className="w-3 h-3" />
                  <div>
                    {humanize(group?.stats?.totalAmountOfCollects)}{' '}
                    {group?.stats?.totalAmountOfCollects > 1
                      ? 'members'
                      : 'member'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </a>
      </Link>
    </div>
  )
}

export default GroupProfile
