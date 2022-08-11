import { DAI_ABI } from '@abis/DAI_ABI'
import { GOOD_ABI } from '@abis/GOOD_ABI'
import { LensHubProxy } from '@abis/LensHubProxy'
import { VHR_ABI } from '@abis/VHR_ABI'
import { gql, useMutation, useQuery } from '@apollo/client'
import { CREATE_COMMENT_TYPED_DATA_MUTATION } from '@components/Comment/NewComment'
import { Button } from '@components/UI/Button'
import { Spinner } from '@components/UI/Spinner'
import { BCharityPost } from '@generated/bcharitytypes'
import {
  CreateCollectBroadcastItemResult,
  CreateCommentBroadcastItemResult,
  EnabledModule
} from '@generated/types'
import { BROADCAST_MUTATION } from '@gql/BroadcastMutation'
import { CommentFields } from '@gql/CommentFields'
import { CheckCircleIcon } from '@heroicons/react/outline'
import {
  defaultFeeData,
  defaultModuleData,
  FEE_DATA_TYPE,
  getModule
} from '@lib/getModule'
import Logger from '@lib/logger'
import omit from '@lib/omit'
import splitSignature from '@lib/splitSignature'
import trimify from '@lib/trimify'
import uploadToArweave from '@lib/uploadToArweave'
import { ethers } from 'ethers'
import React, { FC, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  APP_NAME,
  CONNECT_WALLET,
  DAI_TOKEN,
  ERROR_MESSAGE,
  ERRORS,
  GIVE_DAI_LP,
  GOOD_TOKEN,
  LENSHUB_PROXY,
  RELAY_ON,
  VHR_TO_DAI_PRICE,
  VHR_TOKEN
} from 'src/constants'
import { useAppPersistStore, useAppStore } from 'src/store/app'
import { v4 as uuid } from 'uuid'
import {
  useAccount,
  useBalance,
  useContractRead,
  useContractWrite,
  useSignTypedData
} from 'wagmi'

import IndexStatus from '../../Shared/IndexStatus'

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

interface Props {
  post: BCharityPost
}

const Verify: FC<Props> = ({ post }) => {
  // const { t } = useTranslation('common')
  const { userSigNonce, setUserSigNonce } = useAppStore()
  const { isAuthenticated, currentUser } = useAppPersistStore()
  const { address } = useAccount()
  const [selectedModule, setSelectedModule] =
    useState<EnabledModule>(defaultModuleData)
  const [feeData, setFeeData] = useState<FEE_DATA_TYPE>(defaultFeeData)
  const [txnData, setTxnData] = useState<string>()
  const [hasVhrTxn, setHasVrhTxn] = useState<boolean>(false)
  const { isLoading: signLoading, signTypedDataAsync } = useSignTypedData({
    onError(error) {
      toast.error(error?.message)
    }
  })

  const [vhrBalance, setVhrBalance] = useState(0)
  const [goodBalance, setGoodBalance] = useState('')
  const [balanceOf, setBalanceOf] = useState(0)
  const [balanceOfQuote, setBalanceOfQuote] = useState(0)
  const [decimals, setDecimals] = useState(0)
  // const [validBalance, setValidBalance] = useState(0)
  const [goodTransferAmount, setGoodTransferAmount] = useState(0)

  useQuery(COMMENT_FEED_QUERY, {
    variables: {
      request: { commentsOf: post.id },
      reactionRequest: currentUser ? { profileId: currentUser?.id } : null,
      profileId: currentUser?.id ?? null
    },
    fetchPolicy: 'no-cache',
    onCompleted(data) {
      const publications = data.publications.items.filter((i: any) =>
        ethers.utils.isHexString(i.metadata.content)
      )
      if (publications.length !== 0) {
        setHasVrhTxn(true)
      }
    }
  })

  useContractRead({
    addressOrName: GOOD_TOKEN,
    contractInterface: GOOD_ABI,
    functionName: 'balanceOf',
    watch: true,
    args: [GIVE_DAI_LP],

    onSuccess(data) {
      //console.log('Success', data)
      setBalanceOf(parseFloat(data.toString()))
      //console.log(totalSupply);
    }
  })

  useContractRead({
    addressOrName: DAI_TOKEN,
    contractInterface: DAI_ABI,
    functionName: 'balanceOf',
    watch: true,
    args: [GIVE_DAI_LP],

    onSuccess(data) {
      //console.log('Success', data)
      setBalanceOfQuote(parseFloat(data.toString()))
      //console.log(totalSupply);
    }
  })

  useContractRead({
    addressOrName: GOOD_TOKEN,
    contractInterface: GOOD_ABI,
    functionName: 'decimals',
    watch: true,
    onSuccess(data) {
      //console.log('Success', data)
      setDecimals(parseFloat(data.toString()))
      //console.log(totalSupply);
    }
  })

  const quoteTokenAmountTotal = balanceOfQuote / 10 ** decimals
  const tokenAmountTotal = balanceOf / 10 ** decimals
  const goodToDAIPrice = +(quoteTokenAmountTotal / tokenAmountTotal).toFixed(8)
  const vhrToGoodPrice = +(VHR_TO_DAI_PRICE / goodToDAIPrice).toFixed(8)

  const getVhrBalance = useBalance({
    addressOrName: address,
    token: VHR_TOKEN,
    watch: true,
    chainId: 80001
  })

  const getGoodBalance = useBalance({
    addressOrName: address,
    token: GOOD_TOKEN,
    watch: true,
    chainId: 80001
  })

  useEffect(() => {
    //console.log(parseInt(getVhrBalance.data?.value._hex as string, 16))
    setVhrBalance(parseInt(getVhrBalance.data?.value._hex as string, 16))
    // console.log(getGoodBalance.data)
    setGoodBalance(
      getGoodBalance.data?.formatted.length! > 7
        ? getGoodBalance.data?.formatted.slice(0, 7)! + '...'
        : getGoodBalance.data?.formatted!
    )
    // console.log(
    //   parseInt(post.metadata.attributes[4].value as string) * vhrToGoodPrice
    // )
    setGoodTransferAmount(
      parseInt(post.metadata.attributes[4].value as string) * vhrToGoodPrice
    )
  }, [
    getVhrBalance.data,
    getGoodBalance.data?.formatted,
    vhrToGoodPrice,
    post.metadata.attributes
  ])

  const { isLoading: vhrWriteLoading, write: writeVhrTransfer } =
    useContractWrite({
      addressOrName: VHR_TOKEN,
      contractInterface: VHR_ABI,
      functionName: 'transfer',
      args: [post.profile.ownedBy, post.metadata.attributes[4].value],
      onSuccess(data) {
        setTxnData(data.hash)
        createComment(data.hash)
      },
      onError(error: any) {
        toast.error(error?.data?.message ?? error?.message)
      }
    })

  // const { config } = usePrepareContractWrite({
  //   addressOrName: GOOD_TOKEN,
  //   contractInterface: GOOD_ABI,
  //   functionName: 'transfer',
  //   args: [post.profile.ownedBy, (goodTransferAmount * 10 ** 18).toString()]
  // })

  // const {
  //   data,
  //   isLoading,
  //   isSuccess,
  //   write: writeGoodTransfer
  // } = useContractWrite(config)

  const { isLoading: goodWriteLoading, write: writeGoodTransfer } =
    useContractWrite({
      addressOrName: GOOD_TOKEN,
      contractInterface: GOOD_ABI,
      functionName: 'transfer',
      args: [post.profile.ownedBy, (goodTransferAmount * 10 ** 18).toString()],
      onSuccess(data) {
        //setTxnData(data.hash)
        //createComment(data.hash)
      },
      onError(error: any) {
        toast.error(error?.data?.message ?? error?.message)
      }
    })

  const { isLoading: commentWriteLoading, write: commentWrite } =
    useContractWrite({
      addressOrName: LENSHUB_PROXY,
      contractInterface: LensHubProxy,
      functionName: 'commentWithSig',
      onSuccess() {
        setSelectedModule(defaultModuleData)
        setFeeData(defaultFeeData)
      },
      onError(error: any) {
        if (txnData) createComment(txnData)
        toast.error(error?.data?.message ?? error?.message)
      }
    })

  const [commentBroadcast, { loading: commentBroadcastLoading }] = useMutation(
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
  const [createCommentTypedData] = useMutation(
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
            } = await commentBroadcast({
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

  const createComment = async (hash: string) => {
    if (!isAuthenticated) return toast.error(CONNECT_WALLET)

    // TODO: Add animated_url support
    const id = await uploadToArweave({
      version: '1.0.0',
      metadata_id: uuid(),
      description: 'VHR transfer transaction token',
      content: hash,
      name: `VHR transfer transaction token`,
      contentWarning: null, // TODO
      attributes: [
        {
          traitType: 'string',
          key: 'type',
          value: 'comment'
        }
      ],
      createdOn: new Date(),
      appId: APP_NAME
    }).finally(() => {})
    createCommentTypedData({
      variables: {
        options: { overrideSigNonce: userSigNonce },
        request: {
          profileId: currentUser?.id,
          publicationId:
            post?.__typename === 'Mirror'
              ? post?.mirrorOf?.id
              : post?.pubId ?? post?.id,
          contentURI: `https://arweave.net/${id}`,
          collectModule: feeData.recipient
            ? {
                [getModule(selectedModule.moduleName).config]: feeData
              }
            : getModule(selectedModule.moduleName).config,
          referenceModule: {
            followerOnlyReferenceModule: false
          }
        }
      }
    })
  }

  const onCompleted = () => {
    toast.success('Transaction submitted successfully!')
  }
  const {
    data: collectWriteData,
    isLoading: collectWriteLoading,
    write: collectWrite
  } = useContractWrite({
    addressOrName: LENSHUB_PROXY,
    contractInterface: LensHubProxy,
    functionName: 'collectWithSig',
    onSuccess() {
      onCompleted()
    },
    onError(error: any) {
      createCollect()
      toast.error(error?.data?.message ?? error?.message)
    }
  })
  const [
    collectBroadcast,
    { data: collectBroadcastData, loading: collectBroadcastLoading }
  ] = useMutation(BROADCAST_MUTATION, {
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
            } = await collectBroadcast({
              variables: { request: { id, signature } }
            })

            if ('reason' in result) collectWrite({ args: inputStruct })
          } else {
            collectWrite({ args: inputStruct })
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
        request: { publicationId: post?.pubId ?? post?.id }
      }
    })
  }

  const checkEnoughBalance = () => {
    const vhrTransferAmount = parseInt(
      post.metadata.attributes[4].value as string
    )
    // console.log(vhrBalance)
    // console.log(goodBalance)
    // console.log(vhrToGoodPrice)
    // console.log(vhrTransferAmount)
    // console.log(goodTransferAmount)

    if (vhrBalance < vhrTransferAmount) {
      toast.error(
        'Not enough VHR in wallet. (' + vhrTransferAmount + ' needed)'
      )
    } else if (parseInt(goodBalance) < goodTransferAmount) {
      toast.error(
        'Not enough GOOD in wallet. (' + goodTransferAmount + ' needed)'
      )
    } else {
      if (!hasVhrTxn) {
        writeGoodTransfer()
        writeVhrTransfer()
      }
      createCollect()
    }
    // if (validBalance) {
    //   writeGoodTransfer()
    //   if (!hasVhrTxn) {
    //     writeVhrTransfer()
    //   }
    //   createCollect()
    // }
  }

  return (
    <div className="flex items-center mt-3 space-y-0 space-x-3 sm:block sm:mt-0 sm:space-y-2">
      {post?.metadata.attributes[1].value === currentUser?.ownedBy &&
        trimify(post?.metadata?.name ?? '') === currentUser?.handle && (
          <>
            <Button
              className="sm:mt-0 sm:ml-auto"
              onClick={() => {
                checkEnoughBalance()
                // if (validBalance) {
                //   // if (!hasVhrTxn) writeVhrTransfer()
                //   // createCollect()
                // }
              }}
              disabled={
                typedDataLoading ||
                signLoading ||
                vhrWriteLoading ||
                goodWriteLoading ||
                commentWriteLoading ||
                collectWriteLoading ||
                commentBroadcastLoading ||
                collectBroadcastLoading
              }
              variant="success"
              icon={
                typedDataLoading ||
                signLoading ||
                vhrWriteLoading ||
                goodWriteLoading ||
                commentWriteLoading ||
                collectWriteLoading ||
                commentBroadcastLoading ||
                collectBroadcastLoading ? (
                  <Spinner variant="success" size="xs" />
                ) : (
                  <CheckCircleIcon className="w-4 h-4" />
                )
              }
            >
              Verify
            </Button>
            {collectWriteData?.hash ??
            collectBroadcastData?.broadcast?.txHash ? (
              <div className="mt-2">
                <IndexStatus
                  txHash={
                    collectWriteData?.hash
                      ? collectWriteData?.hash
                      : collectBroadcastData?.broadcast?.txHash
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
