import { Button } from '@components/UI/Button'
import SEO from '@components/utils/SEO'
import { HomeIcon } from '@heroicons/react/outline'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { STATIC_ASSETS } from 'src/constants'

export default function Custom404() {
  const { t } = useTranslation('common')
  return (
    <div className="flex-col page-center">
      <SEO title="404 • BCharity" />
      <img
        src={`${STATIC_ASSETS}/gifs/nyan-cat.gif`}
        alt="Nyan Cat"
        className="h-60"
        height={240}
      />
      <div className="py-10 text-center">
        <h1 className="mb-4 text-3xl font-bold">{t('Lost')}</h1>
        <div className="mb-4">{t('Lost Description')}</div>
        <Link href="/">
          <a href="/">
            <Button
              className="flex mx-auto item-center"
              size="lg"
              icon={<HomeIcon className="w-4 h-4" />}
            >
              <div>{t('Go Home')}</div>
            </Button>
          </a>
        </Link>
      </div>
    </div>
  )
}
