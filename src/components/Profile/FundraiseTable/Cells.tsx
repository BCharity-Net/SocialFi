import { ExternalLinkIcon } from '@heroicons/react/outline'

export const PostCell = (props: { value: string }) => {
  const postID = props.value
  const url = `/posts/${postID}`
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-brand-500"
    >
      {<ExternalLinkIcon className="w-4 h-4 inline-flex" />}
    </a>
  )
}

export const FundsCell = (props: { value: number; funds: number[] }) => {
  const index = props.value
  const value = props.funds[index]
  return <a>{value}</a>
}
