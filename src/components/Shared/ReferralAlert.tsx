import Slug from '@components/Shared/Slug'
import { Mirror } from '@generated/types'
import { HeartIcon } from '@heroicons/react/solid'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  mirror: Mirror
  referralFee?: number
}

const ReferralAlert: FC<Props> = ({ mirror, referralFee = 0 }) => {
  const { t } = useTranslation('common')
  if (mirror?.__typename !== 'Mirror' || referralFee === 0) return null

  return (
    <div className="flex items-center pt-1 space-x-1.5 text-sm text-gray-500">
      <HeartIcon className="w-4 h-4 text-pink-500" />
      <Slug slug={mirror?.profile?.handle} prefix="@" />
      <span>
        {' '}
        {t('Will get')} <b>{referralFee}%</b> {t('Referral 1')}
      </span>
    </div>
  )
}

export default ReferralAlert
