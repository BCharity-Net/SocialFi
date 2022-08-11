/* eslint-disable react/jsx-key */
import { DocumentNode, useQuery } from '@apollo/client'
import PostsShimmer from '@components/Shared/Shimmer/PostsShimmer'
import { Card } from '@components/UI/Card'
import { EmptyState } from '@components/UI/EmptyState'
import { ErrorMessage } from '@components/UI/ErrorMessage'
import { Spinner } from '@components/UI/Spinner'
import { BCharityPost } from '@generated/bcharitytypes'
import { PaginatedResultInfo, Profile } from '@generated/types'
import { CollectionIcon } from '@heroicons/react/outline'
import Logger from '@lib/logger'
import React, { FC, useState } from 'react'
import { useInView } from 'react-cool-inview'
import { useFilters, useTable } from 'react-table'
import { useAppPersistStore } from 'src/store/app'

import PublicationRevenue from './PublicationRevenue'
import TotalDonors from './TotalDonors'

interface Props {
  profile: Profile
  handleQueryComplete: Function
  getColumns: Function
  query: DocumentNode
  request: any
}

export interface Data {
  name: string
  category: string
  funds: number
  goal: string
  date: string
  postID: string
}

const FundraiseTable: FC<Props> = ({
  profile,
  handleQueryComplete,
  getColumns,
  query,
  request
}) => {
  const { currentUser } = useAppPersistStore()
  const [pageInfo, setPageInfo] = useState<PaginatedResultInfo>()
  const [publications, setPublications] = useState<BCharityPost[]>([])
  const [onEnter, setOnEnter] = useState<boolean>(false)
  const [tableData, setTableData] = useState<Data[]>([])
  const [pubIdData, setPubIdData] = useState<string[]>([])
  const [fundsData, setFundsData] = useState<number[]>([])

  const handleTableData = async (data: any) => {
    return Promise.all(
      data.map(async (i: any, index: number) => {
        return {
          name: i.metadata.name,
          category: i.metadata.attributes[4]?.value ?? '',
          funds: index,
          goal: i.metadata.attributes[1].value,
          vhr: Math.floor(i.metadata.attributes[1].value / 3),
          date: i.createdAt.split('T')[0],
          postID: i.id
        }
      })
    )
  }

  const { data, loading, error, fetchMore } = useQuery(query, {
    variables: {
      request: request,
      reactionRequest: currentUser ? { profileId: currentUser?.id } : null,
      profileId: currentUser?.id ?? null
    },
    skip: !profile?.id,
    fetchPolicy: 'no-cache',
    onCompleted(data) {
      if (onEnter) {
        tableData.splice(0, tableData.length)
        setTableData(tableData)
        setOnEnter(false)
      }
      const fundraisers = handleQueryComplete(data)
      handleTableData(fundraisers).then((result: Data[]) => {
        setTableData([...tableData, ...result])
      })
      const pubId: string[] = [],
        funds: number[] = []
      fundraisers.map((i: any) => {
        pubId.push(i.id)
        funds.push(0)
      })
      setPageInfo(data?.publications?.pageInfo)
      setPublications(data?.publications?.items)
      setPubIdData([...pubIdData, ...pubId])
      setFundsData([...fundsData, ...funds])
      setOnEnter(true)
    }
  })

  const { observe } = useInView({
    onEnter: async () => {
      const req = {
        ...request,
        cursor: pageInfo?.next
      }
      const { data } = await fetchMore({
        variables: {
          request: req,
          reactionRequest: currentUser ? { profileId: currentUser?.id } : null,
          profileId: currentUser?.id ?? null
        }
      })
      const fundraisers = handleQueryComplete(data)
      handleTableData(fundraisers).then((result: Data[]) => {
        setTableData([...tableData, ...result])
      })
      setPageInfo(data?.publications?.pageInfo)
      setPublications([...publications, ...data?.publications?.items])
      Logger.log(
        '[Query]',
        `Fetched next 10 fundraise publications Next:${pageInfo?.next}`
      )
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
                  <div className="flex items-stretch justify-center">
                    <TotalDonors pubIdData={pubIdData} />
                  </div>
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
                        {cell.render('Cell', { funds: fundsData })}
                      </td>
                    )
                  })}
                </tr>
                <PublicationRevenue
                  pubId={pubIdData[index]}
                  callback={(data: any) => {
                    if (fundsData[index] != data) {
                      fundsData[index] = data
                      setFundsData(fundsData)
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
      <ErrorMessage title="Failed to load fundraisers" error={error} />
      {!error && !loading && data?.publications?.items?.length !== 0 && (
        <Card>
          <Table />
          {pageInfo?.next && publications.length !== pageInfo?.totalCount && (
            <span ref={observe} className="flex justify-center p-5">
              <Spinner size="sm" />
            </span>
          )}
        </Card>
      )}
    </>
  )
}

export default FundraiseTable
