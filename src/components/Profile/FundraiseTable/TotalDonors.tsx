/* eslint-disable react/jsx-no-useless-fragment */
import { FC, useState } from 'react'

import PublicationDonors, { CollectDonors } from './PublicationDonors'

interface Props {
  pubIdData: any
  callback?: Function
}

const TotalDonors: FC<Props> = ({ pubIdData }) => {
  const [donors, setDonors] = useState(new Set())

  return (
    <>
      <a>Total Donors: {donors.size}</a>
      {pubIdData?.map((i: any, index: number) => {
        return (
          <>
            <CollectDonors
              id={i}
              callback={(data: any) => {
                data?.whoCollectedPublication?.items?.forEach((pub: any) => {
                  setDonors(
                    (donors) => new Set(donors.add(pub.defaultProfile.handle))
                  )
                })
              }}
            />
            <PublicationDonors
              key={index}
              pubId={i}
              callback={(data: any) => {
                setDonors((donors) => new Set(donors.add(data)))
              }}
            />
          </>
        )
      })}
    </>
  )
}

export default TotalDonors
