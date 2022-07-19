import { GridItemEight, GridItemFour, GridLayout } from '@components/GridLayout'
import SettingsHelper from '@components/Shared/SettingsHelper'
import { Button } from '@components/UI/Button'
import { Card } from '@components/UI/Card'
import { EmptyState } from '@components/UI/EmptyState'
import { Form, useZodForm } from '@components/UI/Form'
import { Input } from '@components/UI/Input'
import { TextArea } from '@components/UI/TextArea'
import SEO from '@components/utils/SEO'
import { PencilAltIcon } from '@heroicons/react/outline'
import { CheckCircleIcon } from '@heroicons/react/solid'
import { useRouter } from 'next/router'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { APP_NAME, CONTACT_EMAIL } from 'src/constants'
import { object, string } from 'zod'

const newContactSchema = object({
  subject: string()
    .max(260, {
      message: 'Subject should not exceed 260 characters'
    })
    .nonempty(),
  message: string()
    .max(1000, {
      message: 'Message should not exceed 1000 characters'
    })
    .nonempty()
})

const Contact: FC = () => {
  const { t } = useTranslation('common')
  const { push } = useRouter()
  const form = useZodForm({
    schema: newContactSchema
  })

  return (
    <GridLayout>
      <SEO title={`Contact • ${APP_NAME}`} />
      <GridItemFour>
        <SettingsHelper
          heading={t('Contact Title')}
          description={t('Contact Description')}
        />
      </GridItemFour>
      <GridItemEight>
        <Card testId="contact-form">
          {false ? (
            <EmptyState
              message={<span>{t('Pub reported')}</span>}
              icon={<CheckCircleIcon className="w-14 h-14 text-green-500" />}
              hideCard
            />
          ) : (
            <Form
              form={form}
              className="p-5 space-y-4"
              onSubmit={({ subject, message }) => {
                location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
                  subject
                )}&body=${encodeURIComponent(message)}`
                push('/')
              }}
            >
              <Input
                label={t('Subject')}
                placeholder={t('What happened')}
                {...form.register('subject')}
              />
              <TextArea
                label={t('Contact message')}
                placeholder={t('Message')}
                {...form.register('message')}
              />
              <div className="ml-auto">
                <Button
                  type="submit"
                  icon={<PencilAltIcon className="w-4 h-4" />}
                >
                  {t('Submit')}
                </Button>
              </div>
            </Form>
          )}
        </Card>
      </GridItemEight>
    </GridLayout>
  )
}

export default Contact
