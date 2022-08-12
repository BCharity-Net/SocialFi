/* eslint-disable react/jsx-key */
import { GridItemSix, GridLayout } from '@components/GridLayout'
import { ProfileCell } from '@components/Profile/OpportunitiesTable/Cells'
import { Card } from '@components/UI/Card'
import isVerified from '@lib/isVerified'
import JSSoup from 'jssoup'
import { NextPage } from 'next'
import { FC, useEffect, useMemo, useState } from 'react'
import { useFilters, useTable } from 'react-table'
import { VHR_TOP_HOLDERS_URL } from 'src/constants'

import QueryHandle from './QueryHandle'

interface Tab {
  isOrg: boolean
}

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
      fetch(`api/cors?url=${VHR_TOP_HOLDERS_URL}`)
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

  const HandleHolders = () => {
    return (
      // eslint-disable-next-line react/jsx-no-useless-fragment
      <>
        {topHolders &&
          topHolders.map((i, index) => {
            return (
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
                    topHolders[index].handle !== data.profiles.items[0]?.handle
                  ) {
                    topHolders[index].handle = data.profiles.items[0]?.handle
                    setTopHolders([...topHolders])
                  }
                }}
              />
            )
          })}
      </>
    )
  }

  const columns = useMemo(
    () => [
      {
        Header: 'Top Volunteers',
        columns: [
          {
            Header: 'Rank',
            Cell: (props: { rank: number }) => {
              return <a>{props.rank + 1}</a>
            },
            Filter: () => {
              return <div />
            }
          },
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

  const Table: FC<Tab> = ({ isOrg }) => {
    if (isOrg) {
      columns[0].Header = 'Top Organizations'
    } else {
      columns[0].Header = 'Top Volunteers'
    }
    const { getTableProps, getTableBodyProps, headerGroups, prepareRow, rows } =
      useTable(
        {
          columns,
          data: isOrg
            ? topHolders.filter((value) => {
                return value.org
              })
            : topHolders.filter((value) => {
                return !value.org
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
          {rows.map((row, index) => {
            prepareRow(row)
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  let className = ''
                  if (index === 0) className = 'bg-yellow-300'
                  if (index === 1) className = 'bg-slate-300'
                  if (index === 2) className = 'bg-amber-500'
                  return (
                    <td className={`p-4 ${className}`} {...cell.getCellProps()}>
                      {cell.render('Cell', { rank: index })}
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
    <>
      <div className="flex w-full pt-[20px] text-3xl font-bold justify-center whitespace-nowrap">
        Top VHR Holders
      </div>
      <HandleHolders />
      <GridLayout>
        <GridItemSix>
          <Card>{topHolders && <Table isOrg={false} />}</Card>
        </GridItemSix>
        <GridItemSix>
          <Card>{topHolders && <Table isOrg={true} />}</Card>
        </GridItemSix>
      </GridLayout>
    </>
  )
}

export default Vhrs
