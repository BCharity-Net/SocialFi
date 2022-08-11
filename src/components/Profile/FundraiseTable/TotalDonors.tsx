/* eslint-disable react/jsx-no-useless-fragment */
import { FC, useState } from 'react'

import PublicationDonors, { CollectDonors } from './PublicationDonors'

interface Props {
  pubIdData: any
  callback?: Function
  from?: boolean
}

const TotalDonors: FC<Props> = ({ pubIdData, callback, from }) => {
  const [donors, setDonors] = useState(new Set())

  return (
    <>
      {!from && <a>Total Donors: {donors.size}</a>}
      {pubIdData?.map((i: any, index: number) => {
        return (
          <>
            <CollectDonors
              id={i}
              callback={(data: any) => {
                data?.whoCollectedPublication?.items?.forEach((pub: any) => {
                  if (pub?.defaultProfile?.handle)
                    setDonors(
                      (donors) =>
                        new Set(donors.add(pub?.defaultProfile?.handle))
                    )
                })
              }}
            />
            <PublicationDonors
              key={index}
              pubId={i}
              callback={(data: any) => {
                setDonors((donors) => new Set(donors.add(data)))
                if (callback) callback(donors.size)
              }}
            />
          </>
        )
      })}
    </>
  )
}

export default TotalDonors
