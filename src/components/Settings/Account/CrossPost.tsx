import Beta from '@components/Shared/Beta'
import { Card, CardBody } from '@components/UI/Card'
import { ExternalLinkIcon } from '@heroicons/react/outline'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

const CrossPost: FC = () => {
  const { t } = useTranslation('common')
  return (
    <Card>
      <CardBody className="space-y-2 linkify">
        <div className="flex items-center space-x-2">
          <div className="text-lg font-bold">{t('Twitter cross post')}</div>
          <Beta />
        </div>
        <div className="pb-3">{t('Twitter cross post description')}</div>
        <a
          className="flex items-center space-x-1.5"
          href="https://reflect.withlens.app/"
          target="_blank"
          rel="noreferrer noopener"
        >
          <span>{t('Setup')}</span>
          <ExternalLinkIcon className="w-4 h-4" />
        </a>
      </CardBody>
    </Card>
  )
}

export default CrossPost
