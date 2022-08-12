import Link from 'next/link'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
// import { APP_NAME } from 'src/constants'
import { useAppPersistStore } from 'src/store/app'

const Footer: FC = () => {
  const { staffMode } = useAppPersistStore()
  const { t } = useTranslation('common')

  return (
    <footer
      className={`mt-4 leading-7 text-sm sticky flex flex-wrap px-3 lg:px-0 gap-x-[12px] ${
        staffMode ? 'top-28' : 'top-20'
      }`}
      data-test="footer"
    >
      <a
        href="https://polygive.gitbook.io/bcharity/"
        target="_blank"
        rel="noreferrer noopener"
      >
        {t('About')}
      </a>
      <a
        href="https://discord.gg/4vKS59q5kV"
        target="_blank"
        rel="noreferrer noopener"
      >
        Discord
      </a>
      <a
        href="https://twitter.com/BCharityFi"
        target="_blank"
        rel="noreferrer noopener"
      >
        {t('Twitter')}
      </a>
      <a
        href="https://t.me/BCharitynet"
        target="_blank"
        rel="noreferrer noopener"
      >
        {t('Telegram')}
      </a>
      <a href="" target="_blank" rel="noreferrer noopener">
        {t('Donate')}
      </a>
      <a href="" target="_blank" rel="noreferrer noopener">
        {t('Status')}
      </a>
      <a
        href="https://snapshot.org/#/igive.eth"
        target="_blank"
        rel="noreferrer noopener"
      >
        {t('Vote')}
      </a>
      <a
        href="https://github.com/BCharity-Net/SocialFi"
        target="_blank"
        rel="noreferrer noopener"
      >
        GitHub
      </a>
      <Link href="/thanks">
        <a href="/thanks">{t('Thanks')}</a>
      </Link>
      <Link href="/privacy">
        <a href="/privacy">{t('Privacy')}</a>
      </Link>
      <Link href="/terms">
        <a href="/terms">{t('Terms')}</a>
      </Link>
      <span className="font-bold text-gray-600 dark:text-gray-600">
        <a href="https://ecssen.ca/" target="_blank" rel="noreferrer noopener">
          {t('Copyright')}
        </a>
      </span>
      <span className="font-bold text-gray-600 dark:text-gray-600">
        <a
          href="https://github.com/lensterxyz/lenster"
          target="_blank"
          rel="noreferrer noopener"
        >
          {t('Copyright-lenster')}
        </a>
      </span>
      {/* <a
        className="pr-3 hover:font-bold"
        href={`https://vercel.com/?utm_source=${APP_NAME}&utm_campaign=oss`}
        target="_blank"
        rel="noreferrer noopener"
      >
        ▲ Powered by Vercel
      </a> */}
    </footer>
  )
}

export default Footer
