import React from 'react'
import { useTranslation } from 'react-i18next'

const Hero: React.FC = () => {
  const { t } = useTranslation('common')
  return (
    <div className="py-12 mb-4 bg-white border-b bg-hero">
      <div className="container px-5 mx-auto max-w-screen-xl">
        <div className="flex items-stretch py-8 w-full text-center sm:py-12 sm:text-left">
          <div className="flex-1 flex-shrink-0 space-y-3">
            <div
              className="text-2xl font-extrabold text-black sm:text-4xl"
              data-test="app-name"
            >
              {t('Welcome')}
            </div>
            <div
              className="leading-7 text-gray-700"
              data-test="app-description"
            >
              {t('Welcome Description')}
            </div>
            <div className="text-2xl font-extrabold text-black sm:text-2xl">
              {t('VHR Title')}
            </div>
            <div className="leading-7 text-gray-700">
              {t('VHR Description')}
            </div>
          </div>
          <div className="hidden flex-1 flex-shrink-0 w-full sm:block"></div>
        </div>
      </div>
    </div>
  )
}

export default Hero
