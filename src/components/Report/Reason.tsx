import React, { Dispatch, FC } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  setType: Dispatch<string>
  setSubReason: Dispatch<string>
  type: string
}

const Reason: FC<Props> = ({ setType, setSubReason, type }) => {
  const { t } = useTranslation('common')
  return (
    <div className="space-y-3">
      <div>
        <div className="label">{t('Type')}</div>
        <div>
          <select
            className="w-full bg-white rounded-xl border border-gray-300 outline-none dark:bg-gray-800 disabled:bg-gray-500 disabled:bg-opacity-20 disabled:opacity-60 dark:border-gray-700/80 focus:border-brand-500 focus:ring-brand-400"
            onChange={(e) => setType(e.target.value)}
          >
            <option disabled selected>
              {t('Select type')}
            </option>
            <option value="illegalReason">{t('Illegal')}</option>
            <option value="fraudReason">{t('Fraud')}</option>
            <option value="sensitiveReason">{t('Sensitive')}</option>
          </select>
        </div>
      </div>
      {type && (
        <div>
          <div className="label">{t('Reason')}</div>
          <div>
            <select
              className="w-full bg-white rounded-xl border border-gray-300 outline-none dark:bg-gray-800 disabled:bg-gray-500 disabled:bg-opacity-20 disabled:opacity-60 dark:border-gray-700/80 focus:border-brand-500 focus:ring-brand-400"
              onChange={(e) => setSubReason(e.target.value)}
            >
              <option disabled selected>
                {t('Select sub reason')}
              </option>
              {type === 'illegalReason' && (
                <>
                  <option value="ANIMAL_ABUSE">{t('Animal abuse')}</option>
                  <option value="HUMAN_ABUSE">{t('Human abuse')}</option>
                </>
              )}
              {type === 'fraudReason' && (
                <>
                  <option value="SCAM">{t('Scam')}</option>
                  <option value="IMPERSONATION">{t('Impersonation')}</option>
                </>
              )}
              {type === 'sensitiveReason' && (
                <>
                  <option value="NSFW">{t('NSFW')}</option>
                  <option value="OFFENSIVE">{t('Offensive')}</option>
                </>
              )}
            </select>
          </div>
        </div>
      )}
    </div>
  )
}

export default Reason
