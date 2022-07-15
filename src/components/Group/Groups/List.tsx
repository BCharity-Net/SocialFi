import GroupProfile from '@components/Shared/GroupProfile'
import { Card, CardBody } from '@components/UI/Card'
import { EmptyState } from '@components/UI/EmptyState'
import { Group } from '@generated/bcharitytypes'
import { UsersIcon } from '@heroicons/react/outline'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  groups: Group[]
  testId: string
}

const List: FC<Props> = ({ groups, testId }) => {
  const { t } = useTranslation('common')
  return (
    <Card testId={testId}>
      <CardBody className="space-y-6">
        {groups?.length === 0 && (
          <EmptyState
            message={<div>{t('No groups found')}</div>}
            icon={<UsersIcon className="w-8 h-8 text-brand" />}
            hideCard
          />
        )}
        {groups.map((group: Group) => (
          <div key={group?.id}>
            <GroupProfile group={group} />
          </div>
        ))}
      </CardBody>
    </Card>
  )
}

export default List
