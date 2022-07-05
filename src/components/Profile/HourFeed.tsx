/* eslint-disable react/jsx-key */
import { Profile } from '@generated/types'
import React, { FC } from 'react'
import { Column, useTable } from 'react-table'

interface Props {
  profile: Profile
}

const data = [
  {
    txn: '0x123',
    organization: 'ECSSEN',
    event: 'Food Distribution',
    organizer: 'John',
    date: '05/12/2022',
    vhr: 5
  },
  {
    txn: '0x123',
    organization: 'Team Trees',
    event: 'Planting',
    organizer: 'Wendy',
    date: '04/08/2022',
    vhr: 7
  },
  {
    txn: '0x123',
    organization: 'Food Bank YYC',
    event: 'Distribution',
    organizer: 'Ben',
    date: '02/29/2022',
    vhr: 3
  },
  {
    txn: '0x123',
    organization: 'Mustard Seed',
    event: 'Hospitality',
    organizer: 'Cody',
    date: '02/13/2022',
    vhr: 4
  }
]

const columns: Column<typeof data[0]>[] = [
  {
    Header: 'Txn',
    accessor: 'txn'
  },
  {
    Header: 'Organization',
    accessor: 'organization'
  },
  {
    Header: 'Event',
    accessor: 'event'
  },
  {
    Header: 'Date',
    accessor: 'date'
  },
  {
    Header: 'VHR',
    accessor: 'vhr'
  }
]

const HourFeed: FC<Props> = ({ profile }) => {
  const table = useTable({ columns, data })
  return (
    <>
      <p>{profile?.handle}</p>
      <p>{'\nVHR feed here'}</p>
      <table
        className="w-full text-md bg-white shadow-md rounded mb-4"
        {...table.getTableProps()}
      >
        <thead>
          {table.headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps()}>{column.render('Header')}</th>
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
                  return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}

export default HourFeed
