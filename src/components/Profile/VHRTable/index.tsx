/* eslint-disable react/jsx-key */
import { DAI_ABI } from '@abis/DAI_ABI'
import { GOOD_ABI } from '@abis/GOOD_ABI'
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
import { ethers } from 'ethers'
import React, { FC, useState } from 'react'
import { useInView } from 'react-cool-inview'
import { Row, useFilters, useTable } from 'react-table'
import {
  DAI_TOKEN,
  GIVE_DAI_LP,
  GOOD_TOKEN,
  VHR_TO_DAI_PRICE
} from 'src/constants'
import { useAppPersistStore } from 'src/store/app'
import { useContractRead } from 'wagmi'

import NFTDetails from './NFTDetails'
import VHRToken from './VHRToken'

interface Props {
  profile: Profile
  handleQueryComplete: Function
  getColumns: Function
  query: DocumentNode
  request: any
  from: boolean
}

export interface Data {
  orgName: string
  program: string
  city: string
  category: string
  startDate: string
  endDate: string
  totalHours: {
    index: number
    value: number
  }
  totalGood: {
    index: number
    value: number
  }
  verified: {
    index: number
    value: string
    postID: string
  }
}

const VHRTable: FC<Props> = ({
  profile,
  handleQueryComplete,
  getColumns,
  query,
  request,
  from
}) => {
  const { currentUser } = useAppPersistStore()
  const [pageInfo, setPageInfo] = useState<PaginatedResultInfo>()
  const [publications, setPublications] = useState<BCharityPost[]>([])
  const [onEnter, setOnEnter] = useState<boolean>(false)
  const [tableData, setTableData] = useState<Data[]>([])
  const [pubIdData, setPubIdData] = useState<string[]>([])
  const [vhrTxnData, setVhrTxnData] = useState<string[]>([])
  const [goodTxnData, setGoodTxnData] = useState<string[]>([])
  const [addressData, setAddressData] = useState<string[]>([])

  const [balanceOf, setBalanceOf] = useState(0)
  const [balanceOfQuote, setBalanceOfQuote] = useState(0)
  const [decimals, setDecimals] = useState(0)

  useContractRead({
    addressOrName: GOOD_TOKEN,
    contractInterface: GOOD_ABI,
    functionName: 'balanceOf',
    watch: true,
    args: [GIVE_DAI_LP],

    onSuccess(data) {
      //console.log('Success', data)
      setBalanceOf(parseFloat(data.toString()))
      //console.log(totalSupply);
    }
  })

  useContractRead({
    addressOrName: DAI_TOKEN,
    contractInterface: DAI_ABI,
    functionName: 'balanceOf',
    watch: true,
    args: [GIVE_DAI_LP],

    onSuccess(data) {
      //console.log('Success', data)
      setBalanceOfQuote(parseFloat(data.toString()))
      //console.log(totalSupply);
    }
  })

  useContractRead({
    addressOrName: GOOD_TOKEN,
    contractInterface: GOOD_ABI,
    functionName: 'decimals',
    watch: true,
    onSuccess(data) {
      //console.log('Success', data)
      setDecimals(parseFloat(data.toString()))
      //console.log(totalSupply);
    }
  })

  const quoteTokenAmountTotal = balanceOfQuote / 10 ** decimals
  const tokenAmountTotal = balanceOf / 10 ** decimals
  const goodToDAIPrice = +(quoteTokenAmountTotal / tokenAmountTotal).toFixed(8)
  const vhrToGoodPrice = +(VHR_TO_DAI_PRICE / goodToDAIPrice).toFixed(8)

  const handleTableData = async (data: any) => {
    return Promise.all(
      data.map(async (i: any, index: number) => {
        let verified = false
        if (i.collectNftAddress) verified = true
        return {
          orgName: from ? i.profile.handle : i.metadata.name,
          program: i.metadata.attributes[5].value,
          city: i.metadata.attributes[6].value,
          category: i.metadata.attributes[7].value,
          startDate: i.metadata.attributes[2].value,
          endDate: i.metadata.attributes[3].value,
          totalHours: {
            index: index,
            value: i.metadata.attributes[4].value
          },
          totalGood: {
            index: index,
            value: Number(i.metadata.attributes[4].value) * vhrToGoodPrice
          },
          verified: {
            index: index,
            value: verified ? 'Verified' : 'Unverified',
            postID: i.id
          }
        }
      })
    )
  }

  const handleNFTData = (data: any, index: number, id: string, name = '') =>
    fetch(data)
      .then((i) => i)
      .then((result) => {
        result.json().then((metadata) => {
          tableData[index] = {
            orgName: from ? name : metadata.name,
            program: metadata.attributes[5].value,
            city: metadata.attributes[6].value,
            category: metadata.attributes[7].value,
            startDate: metadata.attributes[2].value,
            endDate: metadata.attributes[3].value,
            totalHours: {
              index: index,
              value: metadata.attributes[4].value
            },
            totalGood: {
              index: index,
              value: Number(metadata.attributes[4].value) * vhrToGoodPrice
            },
            verified: {
              index: index,
              value: 'Verified',
              postID: id
            }
          }
          setTableData(tableData)
        })
      })

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
      const hours = handleQueryComplete(data)
      handleTableData(hours).then((result: Data[]) => {
        setTableData([...tableData, ...result])
      })
      if (from) {
        setPageInfo(data?.notifications?.pageInfo)
        setPublications(data?.notifications?.items)
      } else {
        setPageInfo(data?.publications?.pageInfo)
        setPublications(data?.publications?.items)
      }
      const pubId: string[] = [],
        vhrTxn: string[] = [],
        goodTxn: string[] = [],
        addresses: string[] = []
      hours.map((i: any) => {
        pubId.push(i.id)
        vhrTxn.push('')
        goodTxn.push('')
        addresses.push(i.collectNftAddress)
      })
      setPubIdData([...pubIdData, ...pubId])
      setVhrTxnData([...vhrTxnData, ...vhrTxn])
      setGoodTxnData([...goodTxnData, ...goodTxn])
      setAddressData([...addressData, ...addresses])
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
      const hours = handleQueryComplete(data)
      handleTableData(hours).then((result: Data[]) => {
        setTableData([...tableData, ...result])
      })
      const pubId: string[] = [],
        vhrTxn: string[] = [],
        goodTxn: string[] = [],
        addresses: string[] = []
      hours.map((i: any) => {
        pubId.push(i.id)
        vhrTxn.push('')
        goodTxn.push('')
        addresses.push(i.collectNftAddress)
      })
      setPubIdData([...pubIdData, ...pubId])
      setVhrTxnData([...vhrTxnData, ...vhrTxn])
      setGoodTxnData([...goodTxnData, ...goodTxn])
      setAddressData([...addressData, ...addresses])
      if (from) {
        setPageInfo(data?.notifications?.pageInfo)
        setPublications([...publications, ...data?.notifications?.items])
      } else {
        setPageInfo(data?.publications?.pageInfo)
        setPublications([...publications, ...data?.publications?.items])
      }
      Logger.log(
        '[Query]',
        `Fetched next 10 hours publications Next:${pageInfo?.next}`
      )
    }
  })

  const columns = getColumns(addressData)

  const computeHours = (rows: Row<Data>[]) => {
    let result = 0
    rows.forEach((row) => {
      result += row.values.totalHours.value * 1
    })
    return result
  }

  const computeVolunteers = (rows: Row<Data>[]) => {
    let result = new Set()
    rows.forEach((row) => {
      result.add(row.values.orgName)
    })
    return result.size
  }

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
                  <div className="flex items-stretch justify-center space-x-4">
                    <p>Total Hours: {computeHours(rows)}</p>
                    {from && <p>Total Volunteers: {computeVolunteers(rows)}</p>}
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
                        {cell.render('Cell', {
                          vhr: vhrTxnData,
                          good: goodTxnData
                        })}
                      </td>
                    )
                  })}
                </tr>
                <VHRToken
                  pubId={pubIdData[index]}
                  callback={(data: any) => {
                    const publications = data.publications.items.filter(
                      (i: any) => {
                        return ethers.utils.isHexString(i.metadata.content)
                      }
                    )
                    if (publications.length !== 0) {
                      if (
                        vhrTxnData[index] != publications[0].metadata.content
                      ) {
                        vhrTxnData[index] = publications[0].metadata.content
                        setVhrTxnData(vhrTxnData)
                        setTableData([...tableData])
                      }
                    }

                    const good: string[] = []
                    data.publications.items.forEach((i: any) => {
                      const res = i?.metadata?.content?.split(' ')
                      if (
                        ethers.utils.isHexString(res[0]) &&
                        res[1] === '"good"'
                      ) {
                        good.push(res[0])
                      }
                    })
                    if (good.length !== 0) {
                      if (goodTxnData[index] != good[0]) {
                        goodTxnData[index] = good[0]
                        setGoodTxnData(goodTxnData)
                        setTableData([...tableData])
                      }
                    }
                  }}
                />
                <NFTDetails
                  address={addressData[index]}
                  callback={(data: any) => {
                    handleNFTData(
                      data,
                      index,
                      tableData[index].verified.postID,
                      tableData[index].orgName
                    )
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
      <ErrorMessage title="Failed to load hours" error={error} />
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

export default VHRTable
