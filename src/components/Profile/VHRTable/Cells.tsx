import { ExternalLinkIcon } from '@heroicons/react/outline'
import { POLYGONSCAN_URL } from 'src/constants'

export const ProfileCell = (props: { value: string }) => {
  const user = props.value
  return (
    <a href={`/u/${user}`} target="_blank" rel="noopener noreferrer">
      {user}
    </a>
  )
}

export const TotalHoursCell = (props: {
  value: { index: number; value: number }
  vhr: string[]
}) => {
  const index = props.value.index
  const value = props.value.value
  const vhr = props.vhr[index]
  if (vhr === '') {
    return <a>{value}</a>
  }
  const url = `${POLYGONSCAN_URL}/tx/${vhr}`
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-brand-500"
    >
      {value} {<ExternalLinkIcon className="w-4 h-4 inline-flex" />}
    </a>
  )
}

export const StatusCell = (
  props: {
    value: { index: number; value: string; postID: string }
  },
  addressData: string[]
) => {
  const status = props.value.value
  const index = props.value.index
  const postID = props.value.postID
  let url = `/posts/${postID}`
  if (status === 'Verified') {
    url = `${POLYGONSCAN_URL}/token/${addressData[index]}`
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-brand-500"
    >
      {status} {<ExternalLinkIcon className="w-4 h-4 inline-flex" />}
    </a>
  )
}
