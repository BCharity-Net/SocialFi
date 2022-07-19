import Slug from '@components/Shared/Slug'
import { Card, CardBody } from '@components/UI/Card'
import { StarIcon, UsersIcon } from '@heroicons/react/outline'
import clsx from 'clsx'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  handle: string
  isSuperFollow?: boolean | null | undefined
  action: string
}

const ReferenceAlert: FC<Props> = ({
  handle,
  isSuperFollow = false,
  action
}) => {
  const { t } = useTranslation('common')
  return (
    <Card className={clsx({ '!bg-pink-100 border-pink-300': isSuperFollow })}>
      <CardBody className="flex items-center space-x-1.5 text-sm font-bold text-gray-500">
        {isSuperFollow ? (
          <>
            <StarIcon className="w-4 h-4 text-pink-500" />
            <span>{t('Only')} </span>
            <Slug slug={`${handle}'s`} prefix="@" />
            <span className="text-pink-500"> {t('Super followers')}</span>
            <span>
              {' '}
              {t('Can')}
              {action}
            </span>
          </>
        ) : (
          <>
            <UsersIcon className="w-4 h-4 text-brand" />
            <span>{t('Only')}</span>
            <Slug slug={`${handle}'s`} prefix="@" />
            <span> {t('Followers can comment')}</span>
          </>
        )}
      </CardBody>
    </Card>
  )
}

export default ReferenceAlert
