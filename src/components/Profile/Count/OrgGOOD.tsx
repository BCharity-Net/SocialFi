/* eslint-disable react/jsx-key */
import { gql, useQuery } from '@apollo/client'
import { BCharityPost } from '@generated/bcharitytypes'
import { PaginatedResultInfo, Profile } from '@generated/types'
import { ethers } from 'ethers'
import React, { FC, useMemo, useState } from 'react'
import { useFilters, useTable } from 'react-table'
import { getGoodSent } from 'src/good'
import { useAppPersistStore } from 'src/store/app'

import VHRToken from '../VHRTable/VHRToken'

const NOTIFICATIONS_QUERY = gql`
  query Notifications($request: NotificationRequest!) {
    notifications(request: $request) {
      items {
        ... on NewMentionNotification {
          mentionPublication {
            ... on Post {
              id
              collectNftAddress
              metadata {
                name
                description
                content
                media {
                  original {
                    url
                    mimeType
                  }
                }
                attributes {
                  value
                }
              }
              profile {
                handle
              }
              hidden
            }
          }
        }
      }
      pageInfo {
        totalCount
        next
      }
    }
  }
`

interface Props {
  profile: Profile
  callback?: Function
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

const OrgGOOD: FC<Props> = ({ profile, callback }) => {
  const { currentUser } = useAppPersistStore()
  const [pageInfo, setPageInfo] = useState<PaginatedResultInfo>()
  const [publications, setPublications] = useState<BCharityPost[]>([])
  const [onEnter, setOnEnter] = useState<boolean>(false)
  const [tableData, setTableData] = useState<Data[]>([])
  const [pubIdData, setPubIdData] = useState<string[]>([])
  const [goodTxnData, setGoodTxnData] = useState<string[]>([])

  const handleTableData = async (data: any) => {
    return Promise.all(
      data.map(async (j: any, index: number) => {
        const i = j.mentionPublication
        let verified = false
        if (i.collectNftAddress) verified = true
        return {
          orgName: i.profile.handle,
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
            value: 0
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

  const tableLimit = 50
  const { fetchMore } = useQuery(NOTIFICATIONS_QUERY, {
    variables: {
      request: {
        profileId: profile?.id,
        limit: tableLimit
      },
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
      const notifs = data?.notifications?.items.filter((i: any) => {
        return (
          i.__typename === 'NewMentionNotification' &&
          i.mentionPublication.metadata.attributes[0].value === 'hours' &&
          !i.mentionPublication.hidden
        )
      })
      setPageInfo(data?.publications?.pageInfo)
      setPublications(data?.publications?.items)
      handleTableData(notifs).then((result: Data[]) => {
        setTableData([...tableData, ...result])
        if (tableData.length != tableLimit) {
          fetchMore({
            variables: {
              request: {
                profileId: profile?.id,
                limit: tableLimit,
                cursor: pageInfo?.next
              }
            }
          }).then((result: any) => {
            const results = result?.data?.notifications?.items.filter(
              (i: any) => {
                return (
                  i.__typename === 'NewMentionNotification' &&
                  i.mentionPublication.metadata.attributes[0].value ===
                    'hours' &&
                  !i.mentionPublication.hidden
                )
              }
            )
            const pubId: string[] = [],
              goodTxn: string[] = []
            results.map((i: any) => {
              pubId.push(i.mentionPublication.id)
              goodTxn.push('')
            })
            setPubIdData([...pubIdData, ...pubId])
            setGoodTxnData([...goodTxnData, ...goodTxn])
            setPageInfo(result?.data?.publications?.pageInfo)
            setPublications([...publications, ...results])
          })
        }
      })
      const pubId: string[] = [],
        goodTxn: string[] = []
      notifs.map((i: any) => {
        pubId.push(i.mentionPublication.id)
        goodTxn.push('')
      })
      setPubIdData([...pubIdData, ...pubId])
      setGoodTxnData([...goodTxnData, ...goodTxn])
      setOnEnter(true)
    }
  })

  const columns = useMemo(
    () => [
      {
        Header: 'VHR Verification',
        columns: [
          {
            Header: 'From',
            accessor: 'orgName'
          },
          {
            Header: 'Total Hours',
            accessor: 'totalHours'
          },
          {
            Header: 'Total GOOD',
            accessor: 'totalGood'
          },
          {
            Header: 'Status',
            accessor: 'verified'
          }
        ]
      }
    ],
    []
  )

  useTable(
    {
      columns,
      data: tableData
    },
    useFilters
  )

  const Table = () => {
    const { getTableProps, getTableBodyProps, prepareRow, rows } = useTable(
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
        <tbody {...getTableBodyProps()}>
          {rows.map((row, index) => {
            prepareRow(row)
            return (
              <VHRToken
                pubId={pubIdData[index]}
                callback={(data: any) => {
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
                      getGoodSent(good[0], (value: number) => {
                        if (tableData[index].totalGood.value !== value) {
                          tableData[index].totalGood.value = value
                          setTableData([...tableData])
                        }
                      })
                      let result = 0
                      tableData.forEach((item) => {
                        result += item.totalGood.value
                      })
                      if (callback) callback(result)
                      goodTxnData[index] = good[0]
                      setGoodTxnData(goodTxnData)
                      setTableData([...tableData])
                    }
                  }
                }}
              />
            )
          })}
        </tbody>
      </table>
    )
  }

  return <Table />
}

export default OrgGOOD
