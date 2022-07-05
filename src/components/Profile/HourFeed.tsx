/* eslint-disable react/jsx-key */
import { gql, useQuery } from '@apollo/client'
import { Card } from '@components/UI/Card'
import { Profile } from '@generated/types'
import Logger from '@lib/logger'
import React, { FC, useState } from 'react'
import { Column, useTable } from 'react-table'

const PROFILE_HOURS_FEED_QUERY = gql`
  query HourFeed($request: HourFeedRequest!) {
    hours(request: $request) {
      items {
        orgID
        volunteer
        date
        totalMinutes
      }
    }
  }
`

interface Data {
  items: {
    orgID: string
    volunteer: string
    date: string
    totalMinutes: number
  }
}

interface Props {
  profile: Profile
}

const columns: Column<any>[] = [
  {
    Header: 'Organization',
    accessor: 'organization'
  },
  {
    Header: 'Volunteer',
    accessor: 'volunteer'
  },
  {
    Header: 'Date',
    accessor: 'date'
  },
  {
    Header: 'Total Minutes',
    accessor: 'totalMinutes'
  }
]

const HourFeed: FC<Props> = ({ profile }) => {
  const [data, setData] = useState<Data[]>([])
  const table = useTable({ columns, data })

  useQuery(PROFILE_HOURS_FEED_QUERY, {
    variables: {
      request: { profileId: profile?.id, limit: 10 }
    },
    skip: !profile?.ownedBy,
    onCompleted(data) {
      setData(data)
      Logger.log('Query =>', `Fetched first 10 hour submissions:${profile?.id}`)
    }
  })

  return (
    <>
      <Card>
        <table
          className="w-full text-md text-center mb-2 mt-2"
          {...table.getTableProps()}
        >
          <thead>
            {table.headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th className="p-4" {...column.getHeaderProps()}>
                    {column.render('Header')}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...table.getTableBodyProps()}>
            {table.rows.map((row) => {
              table.prepareRow(row)
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell) => {
                    return (
                      <td className="p-4" {...cell.getCellProps()}>
                        {cell.render('Cell')}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>
    </>
  )
}

export default HourFeed
