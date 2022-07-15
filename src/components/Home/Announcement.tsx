import { Card, CardBody } from '@components/UI/Card'
import { BeakerIcon, CurrencyDollarIcon } from '@heroicons/react/outline'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { IS_MAINNET } from 'src/constants'

const Announcement: FC = () => {
  const { t } = useTranslation('common')
  return (
    <Card
      className="mb-4 bg-yellow-50 dark:bg-yellow-900 !border-yellow-600"
      testId="beta-warning"
    >
      <CardBody className="space-y-2.5 text-yellow-600">
        <div className="flex items-center space-x-2 font-bold">
          <BeakerIcon className="w-5 h-5" />
          <p>{t('Beta Title')}</p>
        </div>
        <p className="text-sm leading-[22px]">{t('Beta Description')}</p>
        {!IS_MAINNET && (
          <div className="flex items-center space-x-1.5 text-sm font-bold">
            <CurrencyDollarIcon className="w-4 h-4" />
            <a
              href="https://faucet.polygon.technology/"
              target="_blank"
              rel="noreferrer noopener"
            >
              {t('Get Testnet')}
            </a>
          </div>
        )}
      </CardBody>
    </Card>
  )
}

export default Announcement
