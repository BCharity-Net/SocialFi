import { Card, CardBody } from '@components/UI/Card'
import AppContext from '@components/utils/AppContext'
import { CurrencyDollarIcon, UserCircleIcon } from '@heroicons/react/outline'
import Link from 'next/link'
import { FC, useContext } from 'react'
import { useTranslation } from 'react-i18next'

const SetDefaultProfile: FC = () => {
  const { profiles } = useContext(AppContext)
  const hasDefaultProfile = !!profiles.find((o) => o.isDefault)
  const count = profiles.length

  const { t } = useTranslation('common')
  if (hasDefaultProfile) return null

  return (
    <Card className="mb-4 bg-green-50 dark:bg-green-900 !border-green-600">
      <CardBody className="space-y-2.5 text-green-600">
        <div className="flex items-center space-x-2 font-bold">
          <UserCircleIcon className="w-5 h-5" />
          <p>{t('Set default profile')}</p>
        </div>
        <p className="text-sm leading-[22px]">
          {t('You have owned')} {count} {count > 1 ? 'profiles' : 'profile'}{' '}
          {t("Don't have default")}.
        </p>
        <div className="flex items-center space-x-1.5 text-sm font-bold">
          <CurrencyDollarIcon className="w-4 h-4" />
          <Link href="/settings/account">
            <a href="/settings/account">{t('Set default')}</a>
          </Link>
        </div>
      </CardBody>
    </Card>
  )
}

export default SetDefaultProfile
