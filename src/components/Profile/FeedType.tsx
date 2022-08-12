import { Profile, ProfileStats } from '@generated/types'
import {
  CashIcon,
  ChatAlt2Icon,
  ClipboardListIcon,
  ClockIcon,
  PencilAltIcon,
  PhotographIcon,
  SwitchHorizontalIcon
} from '@heroicons/react/outline'
import isVerified from '@lib/isVerified'
import nFormatter from '@lib/nFormatter'
import clsx from 'clsx'
import React, { Dispatch, FC, ReactNode, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getTotalVHRSent } from 'src/alchemy'
import { VHR_TOKEN } from 'src/constants'
import { useBalance } from 'wagmi'

import OrgDonors from './Count/OrgDonors'
import OrgGOOD from './Count/OrgGOOD'
import OrgVerifiedHours from './Count/OrgVerifiedHours'

interface Props {
  stats: ProfileStats
  address: string
  id: string
  setFeedType: Dispatch<string>
  feedType: string
  profile: Profile
}

const FeedType: FC<Props> = ({
  stats,
  address,
  id,
  setFeedType,
  feedType,
  profile
}) => {
  const { t } = useTranslation('common')
  const [orgVerifiedHours, setOrgVerifiedHours] = useState<number>()
  const [orgVolunteers, setOrgVolunteers] = useState<number>()
  const [orgDonors, setOrgDonors] = useState<number>()
  const [orgGood, setOrgGood] = useState<number>()
  const { data: vhrBalance } = useBalance({
    addressOrName: address,
    token: VHR_TOKEN,
    watch: true
  })

  useEffect(() => {
    getTotalVHRSent(profile.ownedBy).then((value) => {
      setOrgVerifiedHours(value)
    })
  })

  interface FeedLinkProps {
    name: string
    icon: ReactNode
    type: string
    count?: number
    testId: string
  }

  const FeedLink: FC<FeedLinkProps> = ({
    name,
    icon,
    type,
    count = 0,
    testId
  }) => (
    <button
      type="button"
      onClick={() => {
        setFeedType(type)
      }}
      className={clsx(
        {
          'text-brand bg-brand-100 dark:bg-opacity-20 bg-opacity-100 font-bold':
            feedType === type
        },
        'flex items-center space-x-2 rounded-lg px-4 sm:px-3 py-2 sm:py-1 text-brand hover:bg-brand-100 dark:hover:bg-opacity-20 hover:bg-opacity-100'
      )}
      aria-label={name}
      data-test={testId}
    >
      {icon}
      <div className="hidden sm:block">{name}</div>
      {count ? (
        <div className="px-2 text-xs font-medium rounded-full bg-brand-200 dark:bg-brand-800">
          {nFormatter(count)}
        </div>
      ) : null}
    </button>
  )

  interface FeedLabelProps {
    name: string
  }

  const FeedLabel: FC<FeedLabelProps> = ({ name }) => (
    <button
      type="button"
      className={clsx(
        'flex rounded-lg px-4 sm:px-3 py-2 sm:py-1 text-brand hover:bg-brand-100 dark:hover:bg-opacity-20 hover:bg-opacity-100'
      )}
      aria-label={name}
    >
      <div className="hidden sm:block">{name}</div>
    </button>
  )

  return (
    <>
      {isVerified(id) && (
        <>
          <OrgVerifiedHours
            profile={profile}
            callback={(hours: number, volunteers: number) => {
              setOrgVolunteers(volunteers)
            }}
          />
          <OrgDonors
            profile={profile}
            callback={(donors: number) => {
              setOrgDonors(donors)
            }}
          />
          <OrgGOOD
            profile={profile}
            callback={(good: number) => {
              setOrgGood(good)
            }}
          />
        </>
      )}
      <div className="w-[600px] flex flex-wrap gap-3 px-5 pb-2 mt-3 sm:px-0 sm:mt-0 md:pb-0">
        <FeedLink
          name={t('Posts')}
          icon={<PencilAltIcon className="w-4 h-4" />}
          type="POST"
          count={stats?.totalPosts}
          testId="type-posts"
        />
        <FeedLink
          name={t('Comments')}
          icon={<ChatAlt2Icon className="w-4 h-4" />}
          type="COMMENT"
          count={stats?.totalComments}
          testId="type-comments"
        />
        <FeedLink
          name={t('Mirrors')}
          icon={<SwitchHorizontalIcon className="w-4 h-4" />}
          type="MIRROR"
          count={stats?.totalMirrors}
          testId="type-mirrors"
        />
        <FeedLink
          name="NFTs"
          icon={<PhotographIcon className="w-4 h-4" />}
          type="NFT"
          testId="type-nfts"
        />
      </div>
      <div className="w-[800px] flex flex-wrap gap-3 px-5 pb-2 mt-3 sm:px-0 sm:mt-0 md:pb-0">
        {isVerified(id) ? (
          <>
            <FeedLink
              name="OrgFunds"
              icon={<CashIcon className="w-4 h-4" />}
              type="funds-org"
              testId="type-fundraise-org"
            />
            <FeedLink
              name="OrgVHR"
              icon={<ClockIcon className="w-4 h-4" />}
              type="org"
              count={orgVerifiedHours}
              testId="type-org"
            />
            <FeedLink
              name="OrgOpp"
              icon={<ClipboardListIcon className="w-4 h-4" />}
              type="org-opp"
              testId="type-opp"
            />
            <FeedLabel name={`Org Donors: ${orgDonors?.toString() ?? ''}`} />
            <FeedLabel
              name={`Org Volunteers: ${orgVolunteers?.toString() ?? ''}`}
            />
            <FeedLabel
              name={`Org GOOD: ${orgGood?.toFixed(2)?.toString() ?? ''}`}
            />
          </>
        ) : (
          <>
            <FeedLink
              name="Funds"
              icon={<CashIcon className="w-4 h-4" />}
              type="funds"
              testId="type-fundraise"
            />
            <FeedLink
              name="VHR"
              icon={<ClockIcon className="w-4 h-4" />}
              type="vhr"
              count={vhrBalance !== undefined ? vhrBalance.value.toNumber() : 0}
              testId="type-vhr"
            />
            <FeedLink
              name="Opportunities"
              icon={<ClipboardListIcon className="w-4 h-4" />}
              type="opp"
              testId="type-opp"
            />
          </>
        )}
      </div>
    </>
  )
}

export default FeedType
