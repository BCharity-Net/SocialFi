/* eslint-disable react/jsx-key */
import { DocumentNode, useQuery } from '@apollo/client'
import PostsShimmer from '@components/Shared/Shimmer/PostsShimmer'
import { Card } from '@components/UI/Card'
import { EmptyState } from '@components/UI/EmptyState'
import { ErrorMessage } from '@components/UI/ErrorMessage'
import { Profile } from '@generated/types'
import { CollectionIcon } from '@heroicons/react/outline'
import Logger from '@lib/logger'
import React, { FC, useState } from 'react'
import { useFilters, useTable } from 'react-table'

import NFT from './NFT'

interface Props {
  profile: Profile
  handleQueryComplete: Function
  getColumns: Function
  query: DocumentNode
  request: any
  tableLimit: number
}

export interface Data {
  orgName: string
  uuid: string
  fundName: string
  date: string
  postID: string
}

const FundraiseTable: FC<Props> = ({ profile, getColumns, query, request }) => {
  const [onEnter, setOnEnter] = useState<boolean>(false)
  const [tableData, setTableData] = useState<Data[]>([])

  const fetchMetadata = async (contentURI: string) => {
    return fetch(contentURI)
      .then((response) => {
        return response.json()
      })
      .then((responseJson) => {
        return responseJson
      })
      .catch((error) => {
        Logger.error(error)
      })
  }

  const { data, loading, error } = useQuery(query, {
    variables: {
      request: request
    },
    skip: !profile?.id,
    fetchPolicy: 'no-cache',
    onCompleted(data) {
      if (onEnter) {
        tableData.splice(0, tableData.length)
        setTableData(tableData)
        setOnEnter(false)
      }

      const nft: Data[] = []
      data.nfts.items.forEach((i: any) => {
        fetchMetadata(i.contentURI).then((result) => {
          if (
            result &&
            result.attributes[0].value === 'fundraise' &&
            new Date(result.createdOn) >=
              new Date(
                'Thu Aug 03 2022 10:24:54 GMT-0600 (Mountain Daylight Saving Time)'
              )
          ) {
            nft.push({
              orgName: result.attributes[2].value,
              uuid: result.attributes[3].value,
              fundName: '',
              date: result.createdOn.split('T')[0],
              postID: ''
            })
            setTableData([...tableData, ...nft])
          }
        })
      })

      setOnEnter(true)
    }
  })

  const columns = getColumns()

  const Table = () => {
    const { getTableProps, getTableBodyProps, headerGroups, prepareRow, rows } =
      useTable(
        {
          columns,
          data: tableData
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
              <>
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell) => {
                    return (
                      <td className="p-4" {...cell.getCellProps()}>
                        {cell.render('Cell')}
                      </td>
                    )
                  })}
                </tr>
                <NFT
                  nft={tableData[index]}
                  callback={(data: any) => {
                    if (tableData[index].postID !== data.id) {
                      tableData[index].postID = data.id
                      setTableData([...tableData])
                    }
                  }}
                />
              </>
            )
          })}
        </tbody>
      </table>
    )
  }

  return (
    <>
      {loading && <PostsShimmer />}
      {data?.publications?.items?.length === 0 && (
        <EmptyState
          message={
            <div>
              <span className="mr-1 font-bold">@{profile?.handle}</span>
              <span>seems like not {'POST'.toLowerCase()}ed yet!</span>
            </div>
          }
          icon={<CollectionIcon className="w-8 h-8 text-brand" />}
        />
      )}
      <ErrorMessage title="Failed to load funds" error={error} />
      {!error && !loading && data?.publications?.items?.length !== 0 && (
        <Card>
          <Table />
        </Card>
      )}
    </>
  )
}

export default FundraiseTable
