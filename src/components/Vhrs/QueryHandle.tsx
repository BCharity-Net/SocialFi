import { useQuery } from '@apollo/client'
import { CURRENT_USER_QUERY } from '@components/SiteLayout'
import { FC } from 'react'

interface Props {
  address: string
  callback?: Function
}

const QueryHandle: FC<Props> = ({ address, callback }) => {
  useQuery(CURRENT_USER_QUERY, {
    variables: {
      ownedBy: address
    },
    onCompleted(data) {
      if (!callback) return
      callback(data)
    }
  })

  return <div />
}

export default QueryHandle
