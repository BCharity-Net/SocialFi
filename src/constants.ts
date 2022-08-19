import { chain } from 'wagmi'

// Environments
export const IS_PRODUCTION = process.env.NODE_ENV === 'production'
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development'
export const IS_MAINNET = process.env.NEXT_PUBLIC_IS_MAINNET === 'true'

export const APP_NAME = 'BCharity'
export const DESCRIPTION =
  'Next generation group-driven composable, decentralized, and permissionless public good Web3 built on blockchain.'
export const DEFAULT_OG = 'https://github.com/bcharity/assets'

// Git
export const GIT_COMMIT_SHA =
  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7)
export const GIT_COMMIT_REF = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF

// Misc
export const CONTACT_EMAIL = 'admin@bcharity.net'
export const PUBLIC_URL = process.env.NEXT_PUBLIC_URL
export const RELAY_ON =
  PUBLIC_URL === 'https://bcharity.net' ||
  PUBLIC_URL === 'http://localhost:4783'
    ? process.env.NEXT_PUBLIC_RELAY_ON === 'true'
    : false
export const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN ?? ''
export const CATEGORIES = [
  'Education',
  'Environment',
  'Animals',
  'Social',
  'Healthcare',
  'Sports and Leisure',
  'Disaster Relief',
  'Reduce Poverty',
  'Reduce Hunger',
  'Health',
  'Clean Water',
  'Gender Equality',
  'Affordable and Clean Energy',
  'Work Experience',
  'Technology',
  'Infrastructure',
  'Peace and Justice'
]

// Messages
export const ERROR_MESSAGE = 'Something went wrong!'
export const CONNECT_WALLET = 'Please connect your wallet.'
export const WRONG_NETWORK = IS_MAINNET
  ? 'Please change network to Polygon mainnet.'
  : 'Please change network to Polygon Mumbai testnet.'
export const SIGN_ERROR = 'Failed to sign data'

// URLs
export const STATIC_ASSETS =
  'https://cdn.statically.io/gh/liraymond04/bcharity-assets/main/images'
export const API_URL = IS_MAINNET
  ? 'https://api.lens.dev'
  : 'https://api-mumbai.lens.dev'
export const POLYGONSCAN_URL = IS_MAINNET
  ? 'https://polygonscan.com'
  : 'https://mumbai.polygonscan.com'
export const VHR_TOP_HOLDERS_URL =
  'https://mumbai.polygonscan.com/token/tokenholderchart/0x28ee241ab245699968f2980d3d1b1d23120ab8be'
export const RARIBLE_URL = IS_MAINNET
  ? 'https://rarible.com'
  : 'https://rinkeby.rarible.com'
export const IMAGEKIT_URL_PROD = 'https://ik.imagekit.io/gznuz6k7b/'
export const IMAGEKIT_URL_DEV = 'https://ik.imagekit.io/ivzeeb1pg/'
export const ARWEAVE_GATEWAY = 'https://arweave.net'
export const IMAGEKIT_URL = IS_PRODUCTION ? IMAGEKIT_URL_PROD : IMAGEKIT_URL_DEV

// Web3
export const ALCHEMY_KEY = process.env.NEXT_PUBLIC_ALCHEMY_KEY
export const ALCHEMY_RPC = IS_MAINNET
  ? `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`
  : `https://polygon-mumbai.g.alchemy.com/v2/${ALCHEMY_KEY}`

export const INFURA_PROJECT_ID = process.env.NEXT_PUBLIC_INFURA_PROJECT_ID
export const INFURA_PROJECT_SECRET =
  process.env.NEXT_PUBLIC_INFURA_PROJECT_SECRET

export const ARWEAVE_KEY = process.env.NEXT_PUBLIC_ARWEAVE_KEY

export const POLYGON_MAINNET = {
  ...chain.polygon,
  name: 'Polygon Mainnet',
  rpcUrls: { default: 'https://polygon-rpc.com' }
}
export const POLYGON_MUMBAI = {
  ...chain.polygonMumbai,
  name: 'Polygon Mumbai',
  rpcUrls: { default: 'https://rpc-mumbai.maticvigil.com' }
}
export const CHAIN_ID = IS_MAINNET ? POLYGON_MAINNET.id : POLYGON_MUMBAI.id

export const ERRORS = {
  notMined:
    'A previous transaction may not been mined yet or you have passed in a invalid nonce. You must wait for that to be mined before doing another action, please try again in a few moments. Nonce out of sync.'
}

// Addresses
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
export const LENSHUB_PROXY = IS_MAINNET
  ? '0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d'
  : '0x60Ae865ee4C725cd04353b5AAb364553f56ceF82'
export const LENS_PERIPHERY = IS_MAINNET
  ? '0xeff187b4190E551FC25a7fA4dFC6cf7fDeF7194f'
  : '0xD5037d72877808cdE7F669563e9389930AF404E8'
export const FREE_COLLECT_MODULE = IS_MAINNET
  ? '0x23b9467334bEb345aAa6fd1545538F3d54436e96'
  : '0x0BE6bD7092ee83D44a6eC1D949626FeE48caB30c'
export const DEFAULT_COLLECT_TOKEN = IS_MAINNET
  ? '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270'
  : '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889'

//VHR and GOOD Conversion
export const VHR_TOKEN = '0x28EE241ab245699968F2980D3D1b1d23120ab8BE'
export const GOOD_TOKEN = '0xd21932b453f0dC0918384442D7AaD5B033C4217B'
export const GIVE_DAI_LP = '0x4373C35bB4E55Dea2dA2Ba695605a768f011b4B9'
export const DAI_TOKEN = '0xf0728Bfe68B96Eb241603994de44aBC2412548bE'
export const VHR_TO_DAI_PRICE = 0.009
export const GOOD_TO_DAI_DONATE_RATE = 0.003

export const WMATIC_GOOD_LP = '0xbe796a61F8d6E4CA823485D9D47BDBBD5eCbf909'
export const WMATIC_TOKEN = '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889'
export const DAI_CHECK_FOR_CONVERSION =
  '0x001B3B4d0F3714Ca98ba10F6042DaEbF0B1B7b6F'

// Bundlr
export const BUNDLR_CURRENCY = 'matic'
export const BUNDLR_NODE_URL = IS_MAINNET
  ? 'https://node1.bundlr.network'
  : 'https://devnet.bundlr.network'
