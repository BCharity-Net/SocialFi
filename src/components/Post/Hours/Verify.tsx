import { LensHubProxy } from '@abis/LensHubProxy'
import { VHR_ABI } from '@abis/VHR_ABI'
import { gql, useMutation, useQuery } from '@apollo/client'
import { Button } from '@components/UI/Button'
import { Spinner } from '@components/UI/Spinner'
import { BCharityPost } from '@generated/bcharitytypes'
import { CreateCollectBroadcastItemResult } from '@generated/types'
import { BROADCAST_MUTATION } from '@gql/BroadcastMutation'
import { CollectModuleFields } from '@gql/CollectModuleFields'
import { CheckCircleIcon } from '@heroicons/react/outline'
import Logger from '@lib/logger'
import omit from '@lib/omit'
import splitSignature from '@lib/splitSignature'
import React, { FC, useState } from 'react'
import toast from 'react-hot-toast'
import {
  CONNECT_WALLET,
  ERROR_MESSAGE,
  ERRORS,
  LENSHUB_PROXY,
  RELAY_ON
} from 'src/constants'
import { useAppPersistStore, useAppStore } from 'src/store/app'
import { useAccount, useContractWrite, useSignTypedData } from 'wagmi'

import IndexStatus from '../../Shared/IndexStatus'

export const COLLECT_QUERY = gql`
  query CollectModule($request: PublicationQueryRequest!) {
    publication(request: $request) {
      ... on Post {
        collectNftAddress
        collectModule {
          ...CollectModuleFields
        }
      }
      ... on Comment {
        collectNftAddress
        collectModule {
          ...CollectModuleFields
        }
      }
      ... on Mirror {
        collectNftAddress
        collectModule {
          ...CollectModuleFields
        }
      }
    }
  }
  ${CollectModuleFields}
`

const CREATE_COLLECT_TYPED_DATA_MUTATION = gql`
  mutation CreateCollectTypedData(
    $options: TypedDataOptions
    $request: CreateCollectRequest!
  ) {
    createCollectTypedData(options: $options, request: $request) {
      id
      expiresAt
      typedData {
        types {
          CollectWithSig {
            name
            type
          }
        }
        domain {
          name
          chainId
          version
          verifyingContract
        }
        value {
          nonce
          deadline
          profileId
          pubId
          data
        }
      }
    }
  }
`

interface Props {
  post: BCharityPost
}

const Verify: FC<Props> = ({ post }) => {
  // const { t } = useTranslation('common')
  const { userSigNonce, setUserSigNonce } = useAppStore()
  const { isAuthenticated, currentUser } = useAppPersistStore()
  const { address } = useAccount()
  const [hoursAddressDisable, setHoursAddressDisable] = useState<boolean>(false)
  const { isLoading: signLoading, signTypedDataAsync } = useSignTypedData({
    onError(error) {
      toast.error(error?.message)
    }
  })

  const { data, write: writeVhrTransfer } = useContractWrite({
    addressOrName: '0x28EE241ab245699968F2980D3D1b1d23120ab8BE',
    contractInterface: VHR_ABI,
    functionName: 'transfer',
    args: [post.profile.ownedBy, post.metadata.attributes[4].value]
  })

  useQuery(COLLECT_QUERY, {
    variables: { request: { publicationId: post?.pubId ?? post?.id } },
    onCompleted() {
      if (
        post?.metadata.attributes[0].value === 'hours' &&
        post?.metadata.attributes[1].value !== currentUser?.ownedBy
      ) {
        setHoursAddressDisable(true)
      }
      Logger.log(
        '[Query]',
        `Fetched collect module details Publication:${post?.pubId ?? post?.id}`
      )
    }
  })

  const onCompleted = () => {
    toast.success('Transaction submitted successfully!')
  }

  const {
    data: writeData,
    isLoading: writeLoading,
    write
  } = useContractWrite({
    addressOrName: LENSHUB_PROXY,
    contractInterface: LensHubProxy,
    functionName: 'collectWithSig',
    onSuccess() {
      onCompleted()
    },
    onError(error: any) {
      toast.error(error?.data?.message ?? error?.message)
    }
  })

  const [broadcast, { data: broadcastData, loading: broadcastLoading }] =
    useMutation(BROADCAST_MUTATION, {
      onCompleted,
      onError(error) {
        if (error.message === ERRORS.notMined) {
          toast.error(error.message)
        }
        Logger.error('[Relay Error]', error.message)
      }
    })
  const [createCollectTypedData, { loading: typedDataLoading }] = useMutation(
    CREATE_COLLECT_TYPED_DATA_MUTATION,
    {
      async onCompleted({
        createCollectTypedData
      }: {
        createCollectTypedData: CreateCollectBroadcastItemResult
      }) {
        Logger.log('[Mutation]', 'Generated createCollectTypedData')
        const { id, typedData } = createCollectTypedData
        const { deadline } = typedData?.value

        try {
          const signature = await signTypedDataAsync({
            domain: omit(typedData?.domain, '__typename'),
            types: omit(typedData?.types, '__typename'),
            value: omit(typedData?.value, '__typename')
          })
          setUserSigNonce(userSigNonce + 1)
          const { profileId, pubId, data: collectData } = typedData?.value
          const { v, r, s } = splitSignature(signature)
          const sig = { v, r, s, deadline }
          const inputStruct = {
            collector: address,
            profileId,
            pubId,
            data: collectData,
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
          Logger.warn('[Sign Error]', error)
        }
      },
      onError(error) {
        toast.error(error.message ?? ERROR_MESSAGE)
      }
    }
  )

  const createCollect = () => {
    if (!isAuthenticated) return toast.error(CONNECT_WALLET)

    createCollectTypedData({
      variables: {
        options: { overrideSigNonce: userSigNonce },
        request: { publicationId: post.id }
      }
    })
  }

  return (
    <div className="flex items-center mt-3 space-y-0 space-x-3 sm:block sm:mt-0 sm:space-y-2">
      {!hoursAddressDisable && (
        <>
          <Button
            className="sm:mt-0 sm:ml-auto"
            onClick={() => {
              writeVhrTransfer()
              createCollect()
            }}
            disabled={
              typedDataLoading ||
              signLoading ||
              writeLoading ||
              broadcastLoading
            }
            variant="success"
            icon={
              typedDataLoading ||
              signLoading ||
              writeLoading ||
              broadcastLoading ? (
                <Spinner variant="success" size="xs" />
              ) : (
                <CheckCircleIcon className="w-4 h-4" />
              )
            }
          >
            Verify
          </Button>
          {writeData?.hash ?? broadcastData?.broadcast?.txHash ? (
            <div className="mt-2">
              <IndexStatus
                txHash={
                  writeData?.hash
                    ? writeData?.hash
                    : broadcastData?.broadcast?.txHash
                }
              />
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}

export default Verify
