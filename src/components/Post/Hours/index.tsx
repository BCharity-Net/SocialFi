import Collectors from '@components/Shared/Collectors'
import Markup from '@components/Shared/Markup'
import { Card } from '@components/UI/Card'
import { Modal } from '@components/UI/Modal'
import { BCharityPost } from '@generated/bcharitytypes'
import { ClockIcon, UsersIcon } from '@heroicons/react/outline'
import imagekitURL from '@lib/imagekitURL'
import React, { FC, ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { STATIC_ASSETS } from 'src/constants'
import { useAppPersistStore } from 'src/store/app'

import Verify from './Verify'

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
  const { t } = useTranslation('common')
  const { currentUser } = useAppPersistStore()
  const [showVerifyModal, setShowVerifyModal] = useState<boolean>(false)
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
        <div className="block justify-between items-center sm:flex">
          <div className="text-xl font-bold">
            {' '}
            VHR Verifcation Submitted by {post.profile.name} (
            {post.profile.handle}):
          </div>
          {currentUser ? (
            <div className="pt-3 sm:pt-0">
              <Verify post={post} />
            </div>
          ) : null}
        </div>
        {post?.stats?.totalAmountOfCollects > 0 && (
          <div className="p-3">
            <button
              type="button"
              className="text-sm"
              onClick={() => setShowVerifyModal(!showVerifyModal)}
            >
              <Badge
                title={
                  <div className="flex items-center space-x-1">
                    <UsersIcon className="w-3 h-3" />
                    <div>{t('Collects')}</div>
                  </div>
                }
                value={post?.stats?.totalAmountOfCollects}
              />
            </button>
            <Modal
              title="Verify"
              icon={<ClockIcon className="w-5 h-5 text-brand" />}
              show={showVerifyModal}
              onClose={() => setShowVerifyModal(false)}
            >
              <Collectors pubId={post?.pubId ?? post?.id} />
            </Modal>
          </div>
        )}
        <div>
          <table className="border border-violet-500 w-10 whitespace-nowrap">
            <tr className="text-center font-bold bg-violet-200">
              <th className="border border-violet-500 px-6 py-2">
                Organization
              </th>
              <th className="border border-violet-500 px-6 py-2">
                {post.metadata.name}
              </th>
            </tr>
            <tr className="text-center font-bold bg-violet-200">
              <th className="border border-violet-500 px-6 py-2">
                Organization Wallet
              </th>
              <th className="border border-violet-500 px-6 py-2">
                {post.metadata.attributes[1].value?.substring(0, 30) + '...'}
              </th>
            </tr>
            <tr className="text-center font-bold bg-violet-200">
              {!(
                post.metadata.attributes[2].value ===
                post.metadata.attributes[3].value
              ) ? (
                <th className="border border-violet-500 px-6 py-2">
                  Start Date
                </th>
              ) : (
                <th className="border border-violet-500 px-6 py-2">Date</th>
              )}
              <th className="border border-violet-500 px-6 py-2">
                {post.metadata.attributes[2].value}
              </th>
            </tr>

            {!(
              post.metadata.attributes[2].value ===
              post.metadata.attributes[3].value
            ) && (
              <tr className="text-center font-bold bg-violet-200">
                <th className="border border-violet-500 px-6 py-2">End Date</th>
                <th className="border border-violet-500 px-6 py-2">
                  {post.metadata.attributes[3].value}
                </th>
              </tr>
            )}
            <tr className="text-center font-bold bg-violet-200">
              <th className="border border-violet-500 px-6 py-2">
                Total Hours
              </th>
              <th className="border border-violet-500 px-6 py-2">
                {post.metadata.attributes[4].value}
              </th>
            </tr>
          </table>
        </div>

        <br></br>
        <div className="text-lg leading-2 whitespace-pre-wrap break-words">
          <Markup>{post.metadata.description}</Markup>
        </div>
      </div>

      <br></br>
    </Card>
  )
}

export default Hours
