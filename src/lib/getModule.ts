//import { useTranslation } from 'react-i18next'
import { FREE_COLLECT_MODULE } from 'src/constants'

export const getModule = (
  name: string
): {
  name: string
  hasParam?: boolean
  config?: any
  type: string
  helper: string
} => {
  //const t = useTranslation('common')
  switch (name) {
    // Collect Modules
    case 'FeeCollectModule':
      return {
        name: 'Fee collect',
        hasParam: true,
        config: 'feeCollectModule',
        type: 'collectModule',
        helper: 'Fee collect description'
      }
    case 'LimitedFeeCollectModule':
      return {
        name: 'Limited fee collect',
        hasParam: true,
        config: 'limitedFeeCollectModule',
        type: 'collectModule',
        helper: 'Limited fee collect description'
      }
    case 'TimedFeeCollectModule':
      return {
        name: 'Timed feed collect',
        hasParam: true,
        config: 'timedFeeCollectModule',
        type: 'collectModule',
        helper: 'Timed fee collect description'
      }
    case 'LimitedTimedFeeCollectModule':
      return {
        name: 'Limited time fee collect',
        hasParam: true,
        config: 'limitedTimedFeeCollectModule',
        type: 'collectModule',
        helper: 'Limited time fee collect description'
      }
    case 'FreeCollectModule':
      return {
        name: 'Free collect',
        hasParam: false,
        config: {
          freeCollectModule: { followerOnly: false }
        },
        type: 'collectModule',
        helper: 'Free collect description'
      }
    case 'RevertCollectModule':
      return {
        name: 'Revert collect',
        hasParam: false,
        config: {
          revertCollectModule: true
        },
        type: 'collectModule',
        helper: 'Revert collect description'
      }

    // Follow modules
    case 'FeeFollowModule':
      return {
        name: 'Fee follow',
        type: 'followModule',
        helper: 'Fee follow description'
      }

    // Reference modules
    case 'FollowerOnlyReferenceModule':
      return {
        name: 'Follower only reference',
        type: 'referenceModule',
        helper: 'Follower only reference description'
      }
    default:
      return { name: name, type: 'collectModule', helper: 'Others' }
  }
}

export type FEE_DATA_TYPE = {
  amount: { currency: string; value: string }
  collectLimit: string | null
  recipient: string
  referralFee: number
  followerOnly: boolean
}

export const defaultModuleData = {
  moduleName: 'FreeCollectModule',
  contractAddress: FREE_COLLECT_MODULE,
  inputParams: [],
  redeemParams: [],
  returnDataParms: []
}

export const defaultFeeData = {
  amount: { currency: '', value: '' },
  collectLimit: '',
  recipient: '',
  referralFee: 0,
  followerOnly: false
}
