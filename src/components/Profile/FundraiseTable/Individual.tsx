/* eslint-disable react/jsx-key */
import { GOOD_ABI } from '@abis/GOOD_ABI'
import { WMATIC_ABI } from '@abis/WMATIC_ABI'
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
import React, { FC, useEffect, useState } from 'react'
import { useInView } from 'react-cool-inview'
import { useFilters, useTable } from 'react-table'
import {
  DAI_CHECK_FOR_CONVERSION,
  GOOD_TO_DAI_DONATE_RATE,
  GOOD_TOKEN,
  WMATIC_GOOD_LP,
  WMATIC_TOKEN
} from 'src/constants'
import { useContractRead } from 'wagmi'

import NFT from './NFT'

interface Props {
  profile: Profile
  handleQueryComplete: Function
  getColumns: Function
  query: DocumentNode
  request: any
}

export interface Data {
  orgName: string
  category: string
  uuid: string
  fundName: string
  date: string
  amount: string
  amountGOOD: string
  postID: string
}

const FundraiseTable: FC<Props> = ({ profile, getColumns, query, request }) => {
  const [pageInfo, setPageInfo] = useState<PaginatedResultInfo>()
  const [publications, setPublications] = useState<BCharityPost[]>([])
  const [onEnter, setOnEnter] = useState<boolean>(false)
  const [tableData, setTableData] = useState<Data[]>([])

  const bal = useContractRead({
    addressOrName: GOOD_TOKEN,
    contractInterface: GOOD_ABI,
    functionName: 'balanceOf',
    watch: true,
    chainId: 80001,
    args: [WMATIC_GOOD_LP]
    // onSuccess(data) {
    //   console.log(data)
    // },
    // onError(error) {
    //   console.log(error)
    // }
  })

  const balQ = useContractRead({
    addressOrName: WMATIC_TOKEN,
    contractInterface: WMATIC_ABI,
    functionName: 'balanceOf',
    watch: true,
    chainId: 80001,
    args: [WMATIC_GOOD_LP]
  })

  const decs = useContractRead({
    addressOrName: GOOD_TOKEN,
    contractInterface: GOOD_ABI,
    functionName: 'decimals',
    chainId: 80001,
    watch: true
  })

  var decimals: any = decs?.data
  var balanceOfQuote = parseInt(balQ.data?._hex as string, 16)
  var balanceOf = parseInt(bal.data?._hex as string, 16)

  useEffect(() => {
    decimals = decs.data
    balanceOfQuote = parseInt(balQ.data?._hex as string, 16)
    balanceOf = parseInt(bal.data?._hex as string, 16)
  }, [decs.data, bal.data?._hex, balQ.data?._hex])

  const quoteTokenAmountTotal = balanceOfQuote / 10 ** decimals
  const tokenAmountTotal = balanceOf / 10 ** decimals
  var wmaticToGoodPrice = +(quoteTokenAmountTotal / tokenAmountTotal).toFixed(8)

  if (bal.isError) {
    wmaticToGoodPrice = 242335773312669 / 249999999999999096594
  }

  var goodToDAIPrice = GOOD_TO_DAI_DONATE_RATE

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

  const { data, loading, error, fetchMore } = useQuery(query, {
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
            result.attributes &&
            (result.attributes[0].value === 'fundraise' ||
              result.attributes[0].value === 'fundraise-comment') &&
            new Date(result.createdOn) >=
              new Date(
                'Thu Aug 04 2022 13:45:31 GMT-0600 (Mountain Daylight Saving Time)'
              )
          ) {
            nft.push({
              orgName: result.attributes[2].value,
              category: result.attributes[4]
                ? result.attributes[4].key === 'category'
                  ? result.attributes[4].value
                  : result.attributes[5]?.value ?? ''
                : '',
              uuid: result.attributes[3].value,
              fundName: result.name,
              date: result.createdOn.split('T')[0],
              amount:
                result.attributes[4] && result.attributes[4].key === 'newAmount'
                  ? result.attributes[4].value
                  : '',
              amountGOOD:
                result.attributes[4] && result.attributes[4].key === 'newAmount'
                  ? (+(result.attributes[4].value / goodToDAIPrice).toFixed(
                      2
                    )).toString()
                  : '',
              postID: ''
            })
            setTableData([...tableData, ...nft])
          }
        })
      })
      setPageInfo(data?.nfts?.pageInfo)
      setPublications(data?.nfts?.items)
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
          request: req
        }
      })
      const nft: Data[] = []
      data.nfts.items.forEach((i: any) => {
        fetchMetadata(i.contentURI).then((result) => {
          if (
            result &&
            result.attributes &&
            (result.attributes[0].value === 'fundraise' ||
              result.attributes[0].value === 'fundraise-comment') &&
            new Date(result.createdOn) >=
              new Date(
                'Thu Aug 04 2022 13:45:31 GMT-0600 (Mountain Daylight Saving Time)'
              )
          ) {
            nft.push({
              orgName: result.attributes[2].value,
              category: result.attributes[4]
                ? result.attributes[4].key === 'category'
                  ? result.attributes[4].value
                  : result.attributes[5]?.value ?? ''
                : '',
              uuid: result.attributes[3].value,
              fundName: result.name,
              date: result.createdOn.split('T')[0],
              amount:
                result.attributes[4] && result.attributes[4].key === 'newAmount'
                  ? result.attributes[4].value
                  : '',
              amountGOOD: (
                result.attributes[4].value *
                (1 / goodToDAIPrice)
              ).toString(),
              postID: ''
            })
            setTableData([...tableData, ...nft])
          }
        })
      })
      setPageInfo(data?.nfts?.pageInfo)
      setPublications([...publications, ...data?.nfts?.items])
      Logger.log('[Query]', `Fetched next 10 funds Next:${pageInfo?.next}`)
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
                    if (tableData[index].amount === '') {
                      tableData[index].amount = data.collectModule.amount.value
                      if (
                        data.collectModule.amount.asset.address ==
                        DAI_CHECK_FOR_CONVERSION
                      ) {
                        tableData[index].amount += ' DAI'
                      } else if (
                        data.collectModule.amount.asset.address == WMATIC_TOKEN
                      ) {
                        tableData[index].amount += ' WMATIC'
                      }
                      setTableData([...tableData])
                    }
                    if (tableData[index].postID !== data.id) {
                      tableData[index].postID = data.id
                      if (tableData[index].amountGOOD === '') {
                        if (
                          data.collectModule.amount.asset.address ==
                          DAI_CHECK_FOR_CONVERSION
                        ) {
                          tableData[index].amountGOOD = (+(
                            data.collectModule.amount.value / goodToDAIPrice
                          ).toFixed(2)).toString()
                        } else if (
                          data.collectModule.amount.asset.address ==
                          WMATIC_TOKEN
                        ) {
                          tableData[index].amountGOOD = (+(
                            data.collectModule.amount.value * wmaticToGoodPrice
                          ).toFixed(2)).toString()
                        }
                      }
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
