/* eslint-disable react/jsx-key */
import { GridItemTwelve, GridLayout } from '@components/GridLayout'
import { Card } from '@components/UI/Card'
import JSSoup from 'jssoup'
import { NextPage } from 'next'
import { useEffect, useMemo, useState } from 'react'
import { useFilters, useTable } from 'react-table'
import { CORS_PROXY, VHR_TOP_HOLDERS_URL } from 'src/constants'

interface Item {
  index: number
  address: string
  amount: number
  percentage: string
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
                amount: Number(cur[2]?.replace(/,/g, '')),
                percentage: cur[3]
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
        Header: 'Top VHR Holders',
        columns: [
          {
            Header: 'Address',
            accessor: 'address',
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
          },
          {
            Header: 'Percentage',
            accessor: 'percentage',
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
          data: topHolders
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
      <GridItemTwelve className="space-y-5">
        <Card>{topHolders && <Table />}</Card>
      </GridItemTwelve>
    </GridLayout>
  )
}

export default Vhrs
