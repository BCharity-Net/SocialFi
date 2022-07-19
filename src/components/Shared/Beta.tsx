import { FC } from 'react'
import { useTranslation } from 'react-i18next'

const Beta: FC = () => {
  const { t } = useTranslation('common')
  return (
    <div className="px-1.5 text-xs text-white rounded-md border shadow-sm bg-brand-500 border-brand-600">
      {t('Beta')}
    </div>
  )
}

export default Beta
