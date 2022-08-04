import { useQuery } from '@apollo/client'
import Collectors from '@components/Shared/Collectors'
import ReferralAlert from '@components/Shared/ReferralAlert'
import { Card } from '@components/UI/Card'
import { Modal } from '@components/UI/Modal'
import { BCharityPost } from '@generated/bcharitytypes'
import {
  CashIcon,
  CurrencyDollarIcon,
  UsersIcon
} from '@heroicons/react/outline'
import Logger from '@lib/logger'
import React, { FC, ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppPersistStore } from 'src/store/app'

import { COLLECT_QUERY } from '../Actions/Collect/CollectModule'
import Fund from './Fund'

interface BadgeProps {
  title: ReactNode
  value: ReactNode
}

const Badge: FC<BadgeProps> = ({ title, value }) => (
  <div className="flex bg-gray-200 rounded-full border border-gray-300 dark:bg-gray-800 dark:border-gray-700 text-[12px] w-fit">
    <div className="px-3 bg-gray-300 rounded-full dark:bg-gray-700 py-[0.3px]">
      {title}
    </div>
    <div className="pr-3 pl-2 font-bold py-[0.3px]">{value}</div>
  </div>
)

interface Props {
  fund: BCharityPost
}

const FundraiseComment: FC<Props> = ({ fund }) => {
  const { t } = useTranslation('common')
  const [showFundersModal, setShowFundersModal] = useState<boolean>(false)
  const [revenue, setRevenue] = useState<number>(0)
  const { currentUser } = useAppPersistStore()
  const { data } = useQuery(COLLECT_QUERY, {
    variables: { request: { publicationId: fund?.pubId ?? fund?.id } },
    onCompleted() {
      Logger.log(
        '[Query]',
        `Fetched collect module details Fundraise:${fund?.pubId ?? fund?.id}`
      )
    }
  })

  const collectModule: any = data?.publication?.collectModule

  return (
    <Card forceRounded testId="fundraise">
      <div className="p-5">
        <div className="block justify-between items-center sm:flex">
          <div className="mr-0 space-y-1 sm:mr-16">
            <div
              className="block sm:flex items-center !my-3 space-y-2 sm:space-y-0 sm:space-x-3"
              data-test="fundraise-meta"
            >
              {fund?.stats?.totalAmountOfCollects > 0 && (
                <>
                  <button
                    type="button"
                    className="text-sm"
                    onClick={() => setShowFundersModal(!showFundersModal)}
                  >
                    <Badge
                      title={
                        <div className="flex items-center space-x-1">
                          <UsersIcon className="w-3 h-3" />
                          <div>{t('Collects')}</div>
                        </div>
                      }
                      value={fund?.stats?.totalAmountOfCollects}
                    />
                  </button>

                  <Modal
                    title="Funders"
                    icon={<CashIcon className="w-5 h-5 text-brand" />}
                    show={showFundersModal}
                    onClose={() => setShowFundersModal(false)}
                  >
                    <Collectors pubId={fund?.pubId ?? fund?.id} />
                  </Modal>
                </>
              )}
              <Badge
                title={
                  <div className="flex items-center space-x-1">
                    <CurrencyDollarIcon className="w-3 h-3" />
                    <div>{t('Price')}</div>
                  </div>
                }
                value={`${collectModule?.amount?.value} ${collectModule?.amount?.asset?.symbol}`}
              />
            </div>
            <ReferralAlert
              mirror={fund}
              referralFee={collectModule?.referralFee}
            />
          </div>
          {currentUser ? (
            <div className="pt-3 sm:pt-0">
              <Fund
                fund={fund}
                collectModule={collectModule}
                revenue={revenue}
                setRevenue={setRevenue}
              />
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  )
}

export default FundraiseComment
