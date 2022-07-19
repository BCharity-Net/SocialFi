import { DoesFollowResponse } from '@generated/types'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  followData: DoesFollowResponse
}

const DoesFollow: FC<Props> = ({ followData }) => {
  const { t } = useTranslation('common')
  if (!followData?.follows) return null

  return (
    <div className="py-0.5 px-2 text-xs bg-gray-200 rounded-full dark:bg-gray-700">
      {t('Follows you')}
    </div>
  )
}

export default DoesFollow
