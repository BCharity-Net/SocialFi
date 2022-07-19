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
        <div className="mr-0 space-y-1 sm:mr-16">
          <div className="text-xl font-bold">
            {' '}
            VHR Submission for {post.metadata.name},{' '}
            {`${post.metadata.attributes[2].value} `}
            {!(
              post.metadata.attributes[2].value ===
              post.metadata.attributes[3].value
            ) && `to ${post.metadata.attributes[3].value}`}
          </div>
          <div className="block justify-between items-center sm:flex">
            <div className="text-sm leading-7 whitespace-pre-wrap break-words float rig">
              <Markup>{post.metadata.description}</Markup>
            </div>
            {currentUser ? (
              <div className="pt-3 sm:pt-0">
                <Verify post={post} />
              </div>
            ) : null}
          </div>
          <div
            className="block sm:flex items-center !my-3 space-y-2 sm:space-y-0 sm:space-x-3"
            data-test="fundraise-meta"
          >
            {post?.stats?.totalAmountOfCollects > 0 && (
              <>
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
              </>
            )}
            <div className="text-sm">
              <Badge
                title={
                  <div className="flex items-center space-x-1">
                    <div>Total Hours</div>
                  </div>
                }
                value={post.metadata.attributes[4].value}
              />
            </div>
          </div>
        </div>
      </div>

      <br></br>
    </Card>
  )
}

export default Hours
