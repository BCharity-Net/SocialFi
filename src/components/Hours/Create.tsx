import { LensHubProxy } from '@abis/LensHubProxy'
import { useMutation } from '@apollo/client'
import { GridItemEight, GridItemFour, GridLayout } from '@components/GridLayout'
import { CREATE_POST_TYPED_DATA_MUTATION } from '@components/Post/NewPost'
import ChooseFile from '@components/Shared/ChooseFile'
import Pending from '@components/Shared/Pending'
import SettingsHelper from '@components/Shared/SettingsHelper'
import { Button } from '@components/UI/Button'
import { Card } from '@components/UI/Card'
import { Form, useZodForm } from '@components/UI/Form'
import { Input } from '@components/UI/Input'
import { OrganizationNameInput } from '@components/UI/OrganizationNameInput'
import { Spinner } from '@components/UI/Spinner'
import { TextArea } from '@components/UI/TextArea'
import SEO from '@components/utils/SEO'
import { CreatePostBroadcastItemResult } from '@generated/types'
import { BROADCAST_MUTATION } from '@gql/BroadcastMutation'
import { PlusIcon } from '@heroicons/react/outline'
import imagekitURL from '@lib/imagekitURL'
import Logger from '@lib/logger'
import omit from '@lib/omit'
import splitSignature from '@lib/splitSignature'
import uploadAssetsToIPFS from '@lib/uploadAssetsToIPFS'
import uploadToIPFS from '@lib/uploadToIPFS'
import { NextPage } from 'next'
import React, { ChangeEvent, useState } from 'react'
import { Controller } from 'react-hook-form'
import toast from 'react-hot-toast'
import {
  APP_NAME,
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

const newHourSchema = object({
  orgName: string()
    .min(2, { message: 'Name should be at least 2 characters' })
    .max(100, { message: 'Name should not exceed 100 characters' }),
  orgWalletAddress: string()
    .max(42, { message: 'Ethereum address should be within 42 characters' })
    .regex(/^0x[a-fA-F0-9]{40}$/, { message: 'Invalid Ethereum address' }),

  startDate: string()
    .max(10, { message: 'Invalid date' })
    .min(10, { message: 'Invalid date' }),

  endDate: string()
    .max(10, { message: 'Invalid date' })
    .min(10, { message: 'Invalid date' }),

  totalMinutes: string()
    .min(1, {
      message: 'Invalid total minutes (Enter a number between 1 and 1440)'
    })
    .max(4, {
      message: 'Invalid total minutes (Enter a number between 1 and 1440)'
    }),
  description: string()
    .max(250, { message: 'Description should not exceed 250 characters' })
    .nullable()
})

const Hours: NextPage = () => {
  const [cover, setCover] = useState<string>()
  const [coverType, setCoverType] = useState<string>()
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [uploading, setUploading] = useState<boolean>(false)
  const { userSigNonce, setUserSigNonce } = useAppStore()
  const { isAuthenticated, currentUser } = useAppPersistStore()
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
    onError(error: any) {
      toast.error(error?.data?.message ?? error?.message)
    }
  })

  const form = useZodForm({
    schema: newHourSchema
  })

  const handleUpload = async (evt: ChangeEvent<HTMLInputElement>) => {
    evt.preventDefault()
    setUploading(true)
    try {
      const attachment = await uploadAssetsToIPFS(evt.target.files)
      if (attachment[0]?.item) {
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

            if ('reason' in result) write({ args: inputStruct })
          } else {
            write({ args: inputStruct })
          }
        } catch (error) {
          Logger.warn('Sign Error =>', error)
        }
      },
      onError(error) {
        toast.error(error.message ?? ERROR_MESSAGE)
      }
    }
  )

  const createHours = async (
    orgName: string,
    orgWalletAddress: string,
    startDate: string,
    endDate: string,
    totalMinutes: string,
    description: string | null
  ) => {
    if (!isAuthenticated) return toast.error(CONNECT_WALLET)

    setIsUploading(true)
    const { path } = await uploadToIPFS({
      version: '1.0.0',
      metadata_id: uuid(),
      description: description,
      content: `@${orgName} VHR submission`,
      external_url: null,
      image: cover ? cover : `https://avatar.tobi.sh/${uuid()}.png`,
      imageMimeType: coverType,
      name: orgName,
      contentWarning: null, // TODO
      attributes: [
        {
          traitType: 'string',
          key: 'type',
          value: 'hours'
        },
        {
          traitType: 'string',
          key: 'orgWalletAddress',
          value: orgWalletAddress
        },
        {
          traitType: 'string',
          key: 'startDate',
          value: startDate
        },
        {
          traitType: 'string',
          key: 'endDate',
          value: endDate
        },
        {
          traitType: 'number',
          key: 'totalMinutes',
          value: totalMinutes
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
          contentURI: `https://ipfs.infura.io/ipfs/${path}`,
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
      <SEO title={`Verify Hours • ${APP_NAME}`} />
      <GridItemFour>
        <SettingsHelper
          heading="Verify Hours"
          description="Submit hours to the LensHub network to earn rewards."
        />
      </GridItemFour>
      <GridItemEight>
        <Card>
          {data?.hash ?? broadcastData?.broadcast?.txHash ? (
            <Pending
              txHash={
                data?.hash ? data?.hash : broadcastData?.broadcast?.txHash
              }
              indexing="Hour Submission creation in progress, please wait!"
              indexed="Hour Submission created successfully"
              type="hours"
              urlPrefix="posts"
            />
          ) : (
            <Form
              form={form}
              className="p-5 space-y-4"
              onSubmit={({
                orgName,
                orgWalletAddress,
                startDate,
                endDate,
                totalMinutes,
                description
              }) => {
                createHours(
                  orgName,
                  orgWalletAddress,
                  startDate,
                  endDate,
                  totalMinutes,
                  description
                )
              }}
            >
              <Controller
                control={form.control}
                name="orgName"
                render={({
                  field: { value, onChange },
                  fieldState: { error }
                }) => (
                  <OrganizationNameInput
                    label="Organization Name"
                    error={error?.message}
                    placeholder={'BCharity'}
                    value={value}
                    onChange={onChange}
                  />
                )}
              />
              <Input
                label="Organization Wallet Address"
                type="text"
                placeholder={'0x3A5bd...5e3'}
                {...form.register('orgWalletAddress')}
              />

              <Input
                label="Start Date"
                type="date"
                placeholder={'Enter your start date'}
                {...form.register('startDate')}
              />

              <Input
                label="End Date"
                type="date"
                placeholder={'Enter your end date'}
                {...form.register('endDate')}
              />
              <Input
                label="Total Minutes"
                type="number"
                step="1"
                min="1"
                max="1440"
                placeholder="5"
                {...form.register('totalMinutes')}
              />
              <TextArea
                label="Activity Description"
                placeholder="Tell us about your volunteer experience!"
                {...form.register('description')}
              />
              <div className="space-y-1.5">
                <div className="label">Event Images (Optional)</div>
                <div className="space-y-3">
                  {cover && (
                    <img
                      className="object-cover w-full h-60 rounded-lg"
                      height={240}
                      src={imagekitURL(cover, 'attachment')}
                      alt={cover}
                    />
                  )}
                  <div className="flex items-center space-x-3">
                    <ChooseFile
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
                Hours
              </Button>
            </Form>
          )}
        </Card>
      </GridItemEight>
    </GridLayout>
  )
}

export default Hours
