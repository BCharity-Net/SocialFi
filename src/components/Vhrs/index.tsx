/* eslint-disable react/jsx-key */
import { GridItemSix, GridLayout } from '@components/GridLayout'
import { ProfileCell } from '@components/Profile/OpportunitiesTable/Cells'
import { Card } from '@components/UI/Card'
import isVerified from '@lib/isVerified'
import JSSoup from 'jssoup'
import { NextPage } from 'next'
import { useEffect, useMemo, useState } from 'react'
import { useFilters, useTable } from 'react-table'
import { CORS_PROXY, VHR_TOP_HOLDERS_URL } from 'src/constants'

import QueryHandle from './QueryHandle'

interface Item {
  index: number
  address: string
  handle: string
  amount: number
  percentage: string
  org: boolean
}

const Vhrs: NextPage = () => {
  const [topHolders, setTopHolders] = useState<Item[]>([])

  useEffect(() => {
    if (topHolders.length === 0)
      fetch(`${CORS_PROXY}/${VHR_TOP_HOLDERS_URL}`)
        .then((response) => {
          return response.text()
        })
        .then((html) => {
          const soup = new JSSoup(html)
          const tag = soup.findAll('td')
          let index = 0
          let items: Item[] = []
          let cur = []
          for (let i = 0; i < tag.length; i++) {
            cur[i % 4] = tag[i].text
            if (i % 4 === 0 && i !== 0) {
              items[index] = {
                index: index,
                address: cur[1],
                handle: '',
                amount: Number(cur[2]?.replace(/,/g, '')),
                percentage: cur[3],
                org: false
              }
              index++
            }
          }
          setTopHolders([...items])
          return html
        })
  }, [topHolders])

  const columns = useMemo(
    () => [
      {
        Header: 'Top Individual Holders',
        columns: [
          {
            Header: 'Handle',
            accessor: 'handle',
            Cell: ProfileCell,
            Filter: () => {
              return <div />
            }
          },
          {
            Header: 'Amount',
            accessor: 'amount',
            Filter: () => {
              return <div />
            }
          }
        ]
      }
    ],
    []
  )

  const orgColumns = useMemo(
    () => [
      {
        Header: 'Top Organization Holders',
        columns: [
          {
            Header: 'Handle',
            accessor: 'handle',
            Cell: ProfileCell,
            Filter: () => {
              return <div />
            }
          },
          {
            Header: 'Amount',
            accessor: 'amount',
            Filter: () => {
              return <div />
            }
          }
        ]
      }
    ],
    []
  )

  const Table = () => {
    const { getTableProps, getTableBodyProps, headerGroups, prepareRow, rows } =
      useTable(
        {
          columns,
          data: topHolders.filter((i) => {
            return !i.org
          })
        },
        useFilters
      )

    return (
      <table
        className="w-full text-md text-center mb-2 mt-2"
        {...getTableProps()}
      >
        <thead>
          {headerGroups.map((headerGroup, index) => {
            return index === 0 ? (
              <tr>
                <th
                  className="p-4"
                  {...headerGroup.headers[0].getHeaderProps()}
                >
                  {headerGroup.headers[0] &&
                    headerGroup.headers[0].render('Header')}
                </th>
              </tr>
            ) : (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th className="p-" {...column.getHeaderProps()}>
                    {column.render('Header')}
                    <div>
                      {column.canFilter ? column.render('Filter') : null}
                    </div>
                  </th>
                ))}
              </tr>
            )
          })}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row, index) => {
            prepareRow(row)
            return (
              <>
                <QueryHandle
                  address={topHolders[index].address}
                  callback={(data: any) => {
                    if (
                      topHolders[index].org === false &&
                      isVerified(data.profiles.items[0]?.id)
                    ) {
                      topHolders[index].org = true
                      setTopHolders([...topHolders])
                    }

                    if (
                      topHolders[index].handle !==
                      data.profiles.items[0]?.handle
                    ) {
                      topHolders[index].handle = data.profiles.items[0]?.handle
                      setTopHolders([...topHolders])
                    }
                  }}
                />
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell) => {
                    return (
                      <td className="p-4" {...cell.getCellProps()}>
                        {cell.render('Cell')}
                      </td>
                    )
                  })}
                </tr>
              </>
            )
          })}
        </tbody>
      </table>
    )
  }

  const OrgTable = () => {
    const { getTableProps, getTableBodyProps, headerGroups, prepareRow, rows } =
      useTable(
        {
          columns: orgColumns,
          data: topHolders.filter((i) => {
            return i.org
          })
        },
        useFilters
      )

    return (
      <table
        className="w-full text-md text-center mb-2 mt-2"
        {...getTableProps()}
      >
        <thead>
          {headerGroups.map((headerGroup, index) => {
            return index === 0 ? (
              <tr>
                <th
                  className="p-4"
                  {...headerGroup.headers[0].getHeaderProps()}
                >
                  {headerGroup.headers[0] &&
                    headerGroup.headers[0].render('Header')}
                </th>
              </tr>
            ) : (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th className="p-4" {...column.getHeaderProps()}>
                    {column.render('Header')}
                    <div>
                      {column.canFilter ? column.render('Filter') : null}
                    </div>
                  </th>
                ))}
              </tr>
            )
          })}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row)
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
    )
  }

  return (
    <GridLayout>
      <GridItemSix>
        <Card>{topHolders && <Table />}</Card>
      </GridItemSix>
      <GridItemSix>
        <Card>{topHolders && <OrgTable />}</Card>
      </GridItemSix>
    </GridLayout>
  )
}

export default Vhrs
