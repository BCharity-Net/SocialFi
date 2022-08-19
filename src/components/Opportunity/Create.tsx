import { LensHubProxy } from '@abis/LensHubProxy'
import { gql, useMutation } from '@apollo/client'
import { GridItemEight, GridItemFour, GridLayout } from '@components/GridLayout'
import { CREATE_POST_TYPED_DATA_MUTATION } from '@components/Post/NewPost'
import ChooseFiles from '@components/Shared/ChooseFiles'
import Pending from '@components/Shared/Pending'
import SettingsHelper from '@components/Shared/SettingsHelper'
import Autosuggest from '@components/UI/Autosuggest'
import { Button } from '@components/UI/Button'
import { Card } from '@components/UI/Card'
import { Form, useZodForm } from '@components/UI/Form'
import { Input } from '@components/UI/Input'
import { Spinner } from '@components/UI/Spinner'
import { TextArea } from '@components/UI/TextArea'
import SEO from '@components/utils/SEO'
import { CreatePostBroadcastItemResult, Profile } from '@generated/types'
import { BROADCAST_MUTATION } from '@gql/BroadcastMutation'
import { PlusIcon } from '@heroicons/react/outline'
import imagekitURL from '@lib/imagekitURL'
import Logger from '@lib/logger'
import omit from '@lib/omit'
import splitSignature from '@lib/splitSignature'
import uploadAssetsToIPFS from '@lib/uploadAssetsToIPFS'
import uploadToArweave from '@lib/uploadToArweave'
import { NextPage } from 'next'
import React, { ChangeEvent, FC, useState } from 'react'
import { Controller } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import {
  APP_NAME,
  CATEGORIES,
  CONNECT_WALLET,
  ERROR_MESSAGE,
  ERRORS,
  LENSHUB_PROXY,
  RELAY_ON
} from 'src/constants'
import Custom404 from 'src/pages/404'
import { useAppPersistStore, useAppStore } from 'src/store/app'
import { v4 as uuid } from 'uuid'
import { useContractWrite, useSignTypedData } from 'wagmi'
import { object, string } from 'zod'

export const PROFILE_QUERY = gql`
  query Profile($request: SingleProfileQueryRequest!) {
    profile(request: $request) {
      id
      ownedBy
    }
  }
`

const newOpportunitySchema = object({
  program: string()
    .min(1, { message: 'You must write a program name!' })
    .max(40, { message: 'Program name should not exceed 40 characters!' }),

  position: string()
    .min(1, { message: 'You must write a position name!' })
    .max(40, { message: 'Program name should not exceed 40 characters!' }),

  volunteers: string()
    .regex(/^(0*[1-9][0-9]*(\.[0-9]+)?|0+\.[0-9]*[1-9][0-9]*)$/, {
      message: 'Total volunteers should be larger than zero'
    })
    .regex(/^\d+(?:\.\d{1})?$/, {
      message:
        'Total volunteers should be a whole number or to one decimal place'
    }),

  city: string()
    .min(1, { message: 'You must write your city!' })
    .max(40, { message: 'City name should not exceed 40 characters!' }),

  category: string()
    .min(1, { message: 'You must write a category!' })
    .max(40, { message: 'Category name should not exceed 40 characters!' }),

  startDate: string()
    .max(10, { message: 'Invalid date' })
    .min(10, { message: 'Invalid date' }),

  endDate: string()
    .max(10, { message: 'Invalid date' })
    .min(10, { message: 'Invalid date' })
    .optional()
    .refine(
      (val) => {
        if (val === '') return false
        return true
      },
      { message: 'You should enter an end date' }
    ),

  totalHours: string()
    .regex(/^(0*[1-9][0-9]*(\.[0-9]+)?|0+\.[0-9]*[1-9][0-9]*)$/, {
      message: 'Total hours should be larger than zero'
    })
    .regex(/^\d+(?:\.\d{1})?$/, {
      message: 'Total hours should be a whole number or to one decimal place'
    }),

  description: string()
    .min(1, { message: 'You must write a description!' })
    .max(250, { message: 'Description should not exceed 250 characters' })
})

interface Props {
  media: string
}

const Media: FC<Props> = ({ media }) => {
  let attachments = []
  if (media) attachments = JSON.parse(media)
  return (
    <div>
      {attachments &&
        attachments.map((i: any) => (
          <img
            key="attachment"
            className="object-cover w-full h-60 rounded-lg"
            height={240}
            src={imagekitURL(i.item, 'attachment')}
            alt={i.item}
          />
        ))}
    </div>
  )
}

const Opportunity: NextPage = () => {
  const { t } = useTranslation('common')
  const [cover, setCover] = useState<string>()
  const [singleDay, setSingleDay] = useState<boolean>(true)
  const [coverType, setCoverType] = useState<string>()
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [uploading, setUploading] = useState<boolean>(false)
  const { userSigNonce, setUserSigNonce } = useAppStore()
  const { isAuthenticated, currentUser } = useAppPersistStore()
  const [media, setMedia] = useState<string>('')
  const { isLoading: signLoading, signTypedDataAsync } = useSignTypedData({
    onError(error) {
      toast.error(error?.message)
    }
  })

  const {
    data,
    isLoading: writeLoading,
    write
  } = useContractWrite({
    addressOrName: LENSHUB_PROXY,
    contractInterface: LensHubProxy,
    functionName: 'postWithSig',
    mode: 'recklesslyUnprepared',
    onError(error: any) {
      toast.error(error?.data?.message ?? error?.message)
    }
  })

  const form = useZodForm({
    schema: newOpportunitySchema
  })

  const handleUpload = async (evt: ChangeEvent<HTMLInputElement>) => {
    evt.preventDefault()
    setUploading(true)
    try {
      const attachment = await uploadAssetsToIPFS(evt.target.files)
      if (attachment[0]?.item) {
        const result = JSON.stringify(attachment)
        setMedia(result)
        setCover(attachment[0].item)
        setCoverType(attachment[0].type)
      }
    } finally {
      setUploading(false)
    }
  }

  const [broadcast, { data: broadcastData, loading: broadcastLoading }] =
    useMutation(BROADCAST_MUTATION, {
      onError(error) {
        if (error.message === ERRORS.notMined) {
          toast.error(error.message)
        }
        Logger.error('Relay Error =>', error.message)
      }
    })
  const [createPostTypedData, { loading: typedDataLoading }] = useMutation(
    CREATE_POST_TYPED_DATA_MUTATION,
    {
      async onCompleted({
        createPostTypedData
      }: {
        createPostTypedData: CreatePostBroadcastItemResult
      }) {
        Logger.log('Mutation =>', 'Generated createPostTypedData')
        const { id, typedData } = createPostTypedData
        const {
          profileId,
          contentURI,
          collectModule,
          collectModuleInitData,
          referenceModule,
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
            contentURI,
            collectModule,
            collectModuleInitData,
            referenceModule,
            referenceModuleInitData,
            sig
          }
          if (RELAY_ON) {
            const {
              data: { broadcast: result }
            } = await broadcast({ variables: { request: { id, signature } } })

            if ('reason' in result)
              write?.({ recklesslySetUnpreparedArgs: inputStruct })
          } else {
            write?.({ recklesslySetUnpreparedArgs: inputStruct })
          }
        } catch (error) {}
      },
      onError(error) {
        toast.error(error.message ?? ERROR_MESSAGE)
      }
    }
  )

  const createOpportunities = async (
    program: string,
    position: string,
    volunteers: string,
    city: string,
    category: string,
    startDate: string,
    endDate: string | undefined,
    totalHours: string,
    description: string,
    currentUser: Profile | null
  ) => {
    if (!isAuthenticated) return toast.error(CONNECT_WALLET)
    setIsUploading(true)
    const id = await uploadToArweave({
      version: '1.0.0',
      metadata_id: uuid(),
      description: description,
      content: `@${currentUser?.handle} Volunteer opportunities`,
      external_url: null,
      image: cover ? cover : `https://avatar.tobi.sh/${uuid()}.png`,
      imageMimeType: coverType,
      name: currentUser?.handle,
      contentWarning: null, // TODO
      attributes: [
        {
          traitType: 'string',
          key: 'type',
          value: 'opportunities'
        },
        {
          traitType: 'string',
          key: 'program',
          value: program
        },
        {
          traitType: 'string',
          key: 'position',
          value: position
        },
        {
          traitType: 'number',
          key: 'volunteers',
          value: volunteers
        },
        {
          traitType: 'string',
          key: 'city',
          value: city
        },
        {
          traitType: 'string',
          key: 'category',
          value: category
        },
        {
          traitType: 'string',
          key: 'startDate',
          value: startDate
        },
        {
          traitType: 'string',
          key: 'endDate',
          value: singleDay ? startDate : endDate
        },
        {
          traitType: 'number',
          key: 'totalHours',
          value: totalHours
        },
        {
          traitType: 'string',
          key: 'media',
          value: media
        }
      ],
      media: [],
      createdOn: new Date(),
      appId: `${APP_NAME} Hours`
    }).finally(() => setIsUploading(false))

    createPostTypedData({
      variables: {
        options: { overrideSigNonce: userSigNonce },
        request: {
          profileId: currentUser?.id,
          contentURI: `https://arweave.net/${id}`,
          collectModule: {
            freeCollectModule: {
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
  if (!isAuthenticated) return <Custom404 />

  return (
    <GridLayout>
      <SEO title={`Create Volunteering Opportunities • ${APP_NAME}`} />
      <GridItemFour>
        <SettingsHelper
          heading={t('Create Volunteering Opportunities')}
          description={t(
            'Organizations can create volunteering opportunities for volunteers to apply!'
          )}
        />
      </GridItemFour>
      <GridItemEight>
        <Card>
          {data?.hash ?? broadcastData?.broadcast?.txHash ? (
            <Pending
              txHash={
                data?.hash ? data?.hash : broadcastData?.broadcast?.txHash
              }
              indexing="Volunteer Opportunity creation in progress, please wait!"
              indexed="Volunteer Opportunity created successfully"
              type="opportunity"
              urlPrefix="posts"
            />
          ) : (
            <Form
              form={form}
              className="p-5 space-y-4"
              onSubmit={({
                program,
                position,
                volunteers,
                city,
                category,
                startDate,
                endDate,
                totalHours,
                description
              }) => {
                createOpportunities(
                  program,
                  position,
                  volunteers,
                  city,
                  category,
                  startDate,
                  endDate,
                  totalHours,
                  description,
                  currentUser
                )
              }}
            >
              <Input
                label={t('Program')}
                type="text"
                placeholder={t('Volunteer program name(s)')}
                {...form.register('program')}
              />

              <Input
                label={t('Position')}
                type="text"
                placeholder={t('Volunteer Position')}
                {...form.register('position')}
              />

              <Input
                label={t('Number of Volunteers')}
                type="number"
                step="1"
                min="1"
                placeholder="20"
                {...form.register('volunteers')}
              />

              <Input
                label={t('City/Region')}
                type="text"
                placeholder={t('Calgary, AB')}
                {...form.register('city')}
              />
              <Controller
                control={form.control}
                name="category"
                render={({ field: { onChange }, fieldState: { error } }) => (
                  <Autosuggest
                    label="Category"
                    lang={CATEGORIES}
                    type="text"
                    placeholder={t('Education')}
                    error={error?.message}
                    onChange={onChange}
                    onAdd={(e: string) => {
                      form.setValue('category', e)
                    }}
                  />
                )}
              />

              <Input
                label={singleDay ? `${t('Date')}` : `${t('Start Date')}`}
                type="startDate"
                placeholder={'Enter your start date'}
                change={() => {
                  if (singleDay === true) {
                    setSingleDay(false)
                  } else {
                    setSingleDay(true)
                  }
                  const startDate = form.getValues('startDate')
                  const endDate = form.getValues('endDate')
                  if (endDate === '') form.setValue('endDate', startDate)
                }}
                {...form.register('startDate')}
              />
              {!singleDay && (
                <Input
                  label={t('End Date')}
                  type="date"
                  placeholder={'Enter your end date'}
                  change={() => {
                    const startDate = form.getValues('startDate')
                    form.setValue('endDate', startDate)
                  }}
                  {...form.register('endDate')}
                />
              )}

              <Input
                label={t('Total Hours')}
                type="number"
                step="0.1"
                min="0.1"
                placeholder="5"
                {...form.register('totalHours')}
              />
              <TextArea
                label={t('Activity Description and Requirements')}
                placeholder={t('Activity TextArea')}
                {...form.register('description')}
              />

              <div className="space-y-1.5">
                <div className="label">{t('Activity Images (Optional)')}</div>
                <div className="space-y-3">
                  <Media media={media} />
                  <div className="flex items-center space-x-3">
                    <ChooseFiles
                      onChange={(evt: ChangeEvent<HTMLInputElement>) =>
                        handleUpload(evt)
                      }
                    />
                    {uploading && <Spinner size="sm" />}
                  </div>
                </div>
              </div>
              <Button
                className="ml-auto"
                type="submit"
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
                    <PlusIcon className="w-4 h-4" />
                  )
                }
              >
                {t('Submit')}
              </Button>
            </Form>
          )}
        </Card>
      </GridItemEight>
    </GridLayout>
  )
}

export default Opportunity
