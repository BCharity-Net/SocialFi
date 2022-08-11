import { LensHubProxy } from '@abis/LensHubProxy'
import { gql, useMutation, useQuery } from '@apollo/client'
import { CREATE_COMMENT_TYPED_DATA_MUTATION } from '@components/Comment/NewComment'
import { GridItemSix, GridLayout } from '@components/GridLayout'
import Collectors from '@components/Shared/Collectors'
import Markup from '@components/Shared/Markup'
import ReferralAlert from '@components/Shared/ReferralAlert'
import FundraiseShimmer from '@components/Shared/Shimmer/FundraiseShimmer'
import { Button } from '@components/UI/Button'
import { Card } from '@components/UI/Card'
import { Modal } from '@components/UI/Modal'
import { Spinner } from '@components/UI/Spinner'
import { Tooltip } from '@components/UI/Tooltip'
import { BCharityPost } from '@generated/bcharitytypes'
import { CreateCommentBroadcastItemResult } from '@generated/types'
import { BROADCAST_MUTATION } from '@gql/BroadcastMutation'
import { CommentFields } from '@gql/CommentFields'
import {
  CashIcon,
  CurrencyDollarIcon,
  UsersIcon
} from '@heroicons/react/outline'
import getTokenImage from '@lib/getTokenImage'
import imagekitURL from '@lib/imagekitURL'
import Logger from '@lib/logger'
import omit from '@lib/omit'
import uploadToArweave from '@lib/uploadToArweave'
import clsx from 'clsx'
import { splitSignature } from 'ethers/lib/utils'
import React, { FC, ReactNode, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import {
  APP_NAME,
  CONNECT_WALLET,
  ERROR_MESSAGE,
  ERRORS,
  LENSHUB_PROXY,
  RELAY_ON,
  STATIC_ASSETS
} from 'src/constants'
import { useAppPersistStore, useAppStore } from 'src/store/app'
import { v4 as uuid } from 'uuid'
import { useContractWrite, useSignTypedData } from 'wagmi'

import { COLLECT_QUERY } from '../Actions/Collect/CollectModule'
import Fund from './Fund'

export const PUBLICATION_REVENUE_QUERY = gql`
  query PublicationRevenue($request: PublicationRevenueQueryRequest!) {
    publicationRevenue(request: $request) {
      revenue {
        total {
          value
        }
      }
    }
  }
`

const COMMENT_FEED_QUERY = gql`
  query CommentFeed(
    $request: PublicationsQueryRequest!
    $reactionRequest: ReactionFieldResolverRequest
    $profileId: ProfileId
  ) {
    publications(request: $request) {
      items {
        ... on Comment {
          ...CommentFields
        }
      }
      pageInfo {
        totalCount
        next
      }
    }
  }
  ${CommentFields}
`

interface BadgeProps {
  title: ReactNode
  value: ReactNode
  className?: string
}

const Badge: FC<BadgeProps> = ({ title, value, className }) => (
  <div
    className={`flex bg-gray-200 rounded-full border border-gray-300 dark:bg-gray-800 dark:border-gray-700 text-[12px] w-fit ${className}`}
  >
    <div className="px-3 bg-gray-300 rounded-full dark:bg-gray-700 py-[0.3px]">
      {title}
    </div>
    <div className="pr-3 pl-2 font-bold py-[0.3px]">{value}</div>
  </div>
)

interface Props {
  fund: BCharityPost
}

interface CommentProps {
  id: string
  callback?: Function
}

export const CommentValue: FC<CommentProps> = ({ id, callback }) => {
  useQuery(PUBLICATION_REVENUE_QUERY, {
    variables: {
      request: {
        publicationId: id
      }
    },
    onCompleted(data) {
      if (callback) callback(data)
      Logger.log('[Query]', `Fetched fundraise revenue details Fundraise:${id}`)
    }
  })
  return <div />
}

const Fundraise: FC<Props> = ({ fund }) => {
  const { t } = useTranslation('common')
  const [showFundersModal, setShowFundersModal] = useState<boolean>(false)
  const [revenue, setRevenue] = useState<number>(0)
  const { userSigNonce, setUserSigNonce } = useAppStore()
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const { isAuthenticated, currentUser } = useAppPersistStore()
  const [newAmount, setNewAmount] = useState<string>()
  const { data, loading } = useQuery(COLLECT_QUERY, {
    variables: { request: { publicationId: fund?.pubId ?? fund?.id } },
    onCompleted() {
      Logger.log(
        '[Query]',
        `Fetched collect module details Fundraise:${fund?.pubId ?? fund?.id}`
      )
    }
  })

  const collectModule: any = data?.publication?.collectModule

  let commentValue = 0

  const { data: commentFeed, loading: commentFeedLoading } = useQuery(
    COMMENT_FEED_QUERY,
    {
      variables: {
        request: { commentsOf: fund.id },
        reactionRequest: currentUser ? { profileId: currentUser?.id } : null,
        profileId: currentUser?.id ?? null
      },
      fetchPolicy: 'no-cache'
    }
  )

  const { data: revenueData, loading: revenueLoading } = useQuery(
    PUBLICATION_REVENUE_QUERY,
    {
      variables: {
        request: {
          publicationId:
            fund?.__typename === 'Mirror'
              ? fund?.mirrorOf?.id
              : fund?.pubId ?? fund?.id
        }
      },
      onCompleted() {
        Logger.log(
          '[Query]',
          `Fetched fundraise revenue details Fundraise:${
            fund?.pubId ?? fund?.id
          }`
        )
      }
    }
  )

  useEffect(() => {
    setRevenue(
      parseFloat(revenueData?.publicationRevenue?.revenue?.total?.value ?? 0)
    )
  }, [revenueData])

  const { isLoading: signLoading, signTypedDataAsync } = useSignTypedData({
    onError(error) {
      toast.error(error?.message)
    }
  })
  const [broadcast, { loading: broadcastLoading }] = useMutation(
    BROADCAST_MUTATION,
    {
      onError(error) {
        if (error.message === ERRORS.notMined) {
          toast.error(error.message)
        }
        Logger.error('[Relay Error]', error.message)
      }
    }
  )

  const { isLoading: writeLoading, write: commentWrite } = useContractWrite({
    addressOrName: LENSHUB_PROXY,
    contractInterface: LensHubProxy,
    functionName: 'commentWithSig',
    onError(error: any) {
      toast.error(error?.data?.message ?? error?.message)
    }
  })

  const [createCommentTypedData, { loading: typedDataLoading }] = useMutation(
    CREATE_COMMENT_TYPED_DATA_MUTATION,
    {
      async onCompleted({
        createCommentTypedData
      }: {
        createCommentTypedData: CreateCommentBroadcastItemResult
      }) {
        Logger.log('[Mutation]', 'Generated createCommentTypedData')
        const { id, typedData } = createCommentTypedData
        const {
          profileId,
          profileIdPointed,
          pubIdPointed,
          contentURI,
          collectModule,
          collectModuleInitData,
          referenceModule,
          referenceModuleData,
          referenceModuleInitData,
          deadline
        } = typedData?.value

        try {
          const signature = await signTypedDataAsync({
            domain: omit(typedData?.domain, '__typename'),
            types: omit(typedData?.types, '__typename'),
            value: omit(typedData?.value, '__typename')
          })
          setUserSigNonce(userSigNonce + 1)
          const { v, r, s } = splitSignature(signature)
          const sig = { v, r, s, deadline }
          const inputStruct = {
            profileId,
            profileIdPointed,
            pubIdPointed,
            contentURI,
            collectModule,
            collectModuleInitData,
            referenceModule,
            referenceModuleData,
            referenceModuleInitData,
            sig
          }
          if (RELAY_ON) {
            const {
              data: { broadcast: result }
            } = await broadcast({
              variables: { request: { id, signature } }
            })

            if ('reason' in result) commentWrite({ args: inputStruct })
          } else {
            commentWrite({ args: inputStruct })
          }
        } catch (error) {
          Logger.warn('[Sign Error]', error)
        }
      },
      onError(error) {
        toast.error(error.message ?? ERROR_MESSAGE)
      }
    }
  )

  const createComment = async (
    title: string,
    category: string,
    amount: string,
    goal: string,
    creator: string,
    _uuid: string,
    recipient: string,
    referralFee: string,
    description: string | null
  ) => {
    if (!isAuthenticated) return toast.error(CONNECT_WALLET)

    setIsUploading(true)
    const id = await uploadToArweave({
      version: '1.0.0',
      metadata_id: uuid(),
      description: description,
      content: description,
      external_url: null,
      image: `https://avatar.tobi.sh/${uuid()}.png`,
      imageMimeType: 'image',
      name: title,
      contentWarning: null, // TODO
      attributes: [
        {
          traitType: 'string',
          key: 'type',
          value: 'fundraise-comment'
        },
        {
          traitType: 'string',
          key: 'goal',
          value: goal
        },
        {
          traitType: 'string',
          key: 'creator',
          value: creator
        },
        {
          traitType: 'string',
          key: 'uuid',
          value: _uuid
        },
        {
          traitType: 'number',
          key: 'newAmount',
          value: amount
        },
        {
          traitType: 'string',
          key: 'category',
          value: category
        }
      ],
      media: [],
      createdOn: new Date(),
      appId: `${APP_NAME} Fundraise`
    }).finally(() => setIsUploading(false))

    createCommentTypedData({
      variables: {
        options: { overrideSigNonce: userSigNonce },
        request: {
          profileId: currentUser?.id,
          publicationId:
            fund?.__typename === 'Mirror'
              ? fund?.mirrorOf?.id
              : fund?.pubId ?? fund?.id,
          contentURI: `https://arweave.net/${id}`,
          collectModule: {
            feeCollectModule: {
              amount: {
                currency: collectModule?.amount?.asset?.address,
                value: amount
              },
              recipient,
              referralFee: parseInt(referralFee),
              followerOnly: false
            }
          },
          referenceModule: {
            followerOnlyReferenceModule: false
          }
        }
      }
    })
  }

  const goalAmount = fund?.metadata?.attributes[1]?.value
  const percentageReached = revenue
    ? (revenue / Number(goalAmount as string)) * 100
    : 0
  const cover = fund?.metadata?.cover?.original?.url
  if (loading) return <FundraiseShimmer />

  return (
    <Card forceRounded testId="fundraise">
      <div
        className="h-40 rounded-t-xl border-b sm:h-52 dark:border-b-gray-700/80"
        style={{
          backgroundImage: `url(${
            cover
              ? imagekitURL(cover, 'attachment')
              : `${STATIC_ASSETS}/patterns/2.svg`
          })`,
          backgroundColor: '#8b5cf6',
          backgroundSize: cover ? 'cover' : '30%',
          backgroundPosition: 'center center',
          backgroundRepeat: cover ? 'no-repeat' : 'repeat'
        }}
      />
      <div className="p-5">
        <div className="block justify-between items-center sm:flex">
          <div className="mr-0 space-y-1 sm:mr-3">
            <div className="text-xl font-bold">{fund?.metadata?.name}</div>
            <div className="text-sm leading-7 whitespace-pre-wrap break-words">
              <Markup>
                {fund?.metadata?.description
                  ?.replace(/\n\s*\n/g, '\n\n')
                  .trim()}
              </Markup>
            </div>
            <div
              className="block sm:flex items-center !my-3 space-y-2 sm:space-y-0 sm:space-x-3"
              data-test="fundraise-meta"
            >
              {fund?.stats?.totalAmountOfCollects > 0 && (
                <>
                  <button
                    type="button"
                    className="text-sm"
                    onClick={() => setShowFundersModal(!showFundersModal)}
                  >
                    <Badge
                      title={
                        <div className="flex items-center space-x-1">
                          <UsersIcon className="w-3 h-3" />
                          <div>{t('Collects')}</div>
                        </div>
                      }
                      value={fund?.stats?.totalAmountOfCollects}
                    />
                  </button>

                  <Modal
                    title="Funders"
                    icon={<CashIcon className="w-5 h-5 text-brand" />}
                    show={showFundersModal}
                    onClose={() => setShowFundersModal(false)}
                  >
                    <Collectors pubId={fund?.pubId ?? fund?.id} />
                  </Modal>
                </>
              )}
              <Badge
                title={
                  <div className="flex items-center space-x-1">
                    <CurrencyDollarIcon className="w-3 h-3" />
                    <div>{t('Price')}</div>
                  </div>
                }
                value={`${collectModule?.amount?.value} ${collectModule?.amount?.asset?.symbol}`}
                className="min-w-fit"
              />
              <input
                type="number"
                className="w-full border-0 p-0 text-neutral-500 dark:bg-gray-900"
                value={newAmount}
                placeholder={collectModule?.amount?.value}
                step={0.1}
                min={0.1}
                onChange={(e) => {
                  setNewAmount(e.target.value)
                }}
              />
              <Button
                className="pr-3 pl-2 font-bold py-[0.3px]"
                disabled={
                  typedDataLoading ||
                  isUploading ||
                  signLoading ||
                  writeLoading ||
                  broadcastLoading
                }
                icon={
                  typedDataLoading ||
                  isUploading ||
                  signLoading ||
                  writeLoading ||
                  broadcastLoading ? (
                    <Spinner size="xs" />
                  ) : (
                    <div />
                  )
                }
                onClick={() => {
                  if (
                    fund?.metadata?.name &&
                    fund?.metadata?.attributes[1]?.value &&
                    fund?.metadata?.attributes[2]?.value &&
                    fund?.metadata?.attributes[3]?.value &&
                    newAmount
                  ) {
                    createComment(
                      fund?.metadata?.name,
                      fund?.metadata?.attributes[4]?.value ?? '',
                      newAmount,
                      fund?.metadata?.attributes[1]?.value,
                      fund?.metadata?.attributes[2]?.value,
                      fund?.metadata?.attributes[3]?.value,
                      collectModule?.recipient,
                      collectModule?.referralFee,
                      fund?.metadata?.description
                    )
                  }
                }}
              >
                Confirm
              </Button>
            </div>
            <ReferralAlert
              mirror={fund}
              referralFee={collectModule?.referralFee}
            />
          </div>
          {currentUser ? (
            <div className="pt-3 sm:pt-0">
              <Fund
                fund={fund}
                collectModule={collectModule}
                revenue={revenue}
                setRevenue={setRevenue}
              />
            </div>
          ) : null}
        </div>
        {revenueLoading ? (
          <div className="w-full h-[13px] !mt-5 rounded-full shimmer" />
        ) : (
          goalAmount && (
            <Tooltip
              placement="top"
              content={
                percentageReached >= 100
                  ? 'Goal reached 🎉'
                  : `${percentageReached.toFixed(0)}% Goal reached`
              }
            >
              <div className="mt-5 w-full bg-gray-200 rounded-full dark:bg-gray-700 h-[13px]">
                <div
                  className={clsx(
                    { 'bg-green-500': percentageReached >= 100 },
                    'h-[13px] rounded-full bg-brand-500'
                  )}
                  style={{
                    width: `${
                      percentageReached >= 100
                        ? 100
                        : percentageReached <= 2
                        ? 2
                        : percentageReached
                    }%`
                  }}
                  data-test="fundraise-progress-bar"
                />
              </div>
            </Tooltip>
          )
        )}
        <GridLayout className="!p-0 mt-5">
          <GridItemSix className="!mb-4 space-y-1 sm:mb-0">
            <div className="text-sm font-bold text-gray-500">
              {t('Funds raised')}
            </div>
            {revenueLoading ? (
              <div className="w-16 h-5 !mt-2 rounded-md shimmer" />
            ) : (
              <>
                <div>
                  {commentFeedLoading ? (
                    <div />
                  ) : (
                    <div>
                      {commentFeed?.publications.items.map(
                        (i: any, index: number) => (
                          <CommentValue
                            key={index}
                            id={i.id}
                            callback={(data: any) => {
                              const value =
                                data?.publicationRevenue?.revenue.total.value
                              if (value) commentValue += Number(value)
                              setRevenue(revenue + commentValue)
                            }}
                          />
                        )
                      )}
                    </div>
                  )}
                </div>
                <span className="flex items-center space-x-1.5">
                  <Tooltip content={collectModule?.amount?.asset?.symbol}>
                    <img
                      className="w-7 h-7"
                      height={28}
                      width={28}
                      src={getTokenImage(collectModule?.amount?.asset?.symbol)}
                      alt={collectModule?.amount?.asset?.symbol}
                    />
                  </Tooltip>
                  <span className="space-x-1">
                    <span className="text-2xl font-bold">{revenue}</span>
                    <span className="text-xs">
                      {collectModule?.amount?.asset?.symbol}
                    </span>
                  </span>
                </span>
              </>
            )}
          </GridItemSix>
          {goalAmount && (
            <GridItemSix className="space-y-1">
              <div className="text-sm font-bold text-gray-500">
                {t('Funds goal')}
              </div>
              <span className="flex items-center space-x-1.5">
                <Tooltip content={collectModule?.amount?.asset?.symbol}>
                  <img
                    className="w-7 h-7"
                    height={28}
                    width={28}
                    src={getTokenImage(collectModule?.amount?.asset?.symbol)}
                    alt={collectModule?.amount?.asset?.symbol}
                  />
                </Tooltip>
                <span className="space-x-1">
                  <span className="text-2xl font-bold">{goalAmount}</span>
                  <span className="text-xs">
                    {collectModule?.amount?.asset?.symbol}
                  </span>
                </span>
              </span>
            </GridItemSix>
          )}
        </GridLayout>
      </div>
    </Card>
  )
}

export default Fundraise
