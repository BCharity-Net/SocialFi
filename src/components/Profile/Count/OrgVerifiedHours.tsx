/* eslint-disable react/jsx-key */
import { gql, useQuery } from '@apollo/client'
import { BCharityPost } from '@generated/bcharitytypes'
import { PaginatedResultInfo, Profile } from '@generated/types'
import React, { FC, useMemo, useState } from 'react'
import { Row, useFilters, useTable } from 'react-table'
import { useAppPersistStore } from 'src/store/app'

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

interface Data {
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
  verified: {
    index: number
    value: string
    postID: string
  }
}

const OrgVerifiedHours: FC<Props> = ({ profile, callback }) => {
  const { currentUser } = useAppPersistStore()
  const [pageInfo, setPageInfo] = useState<PaginatedResultInfo>()
  const [publications, setPublications] = useState<BCharityPost[]>([])
  const [onEnter, setOnEnter] = useState<boolean>(false)
  const [tableData, setTableData] = useState<Data[]>([])
  const [pubIdData, setPubIdData] = useState<string[]>([])
  const [vhrTxnData, setVhrTxnData] = useState<string[]>([])
  const [addressData, setAddressData] = useState<string[]>([])

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
              vhrTxn: string[] = [],
              addresses: string[] = []
            results.map((i: any) => {
              pubId.push(i.mentionPublication.id)
              vhrTxn.push('')
              addresses.push(i.mentionPublication.collectNftAddress)
            })
            setPubIdData([...pubIdData, ...pubId])
            setVhrTxnData([...vhrTxnData, ...vhrTxn])
            setAddressData([...addressData, ...addresses])
            setPageInfo(result?.data?.publications?.pageInfo)
            setPublications([...publications, ...results])
          })
        }
      })
      const pubId: string[] = [],
        vhrTxn: string[] = [],
        addresses: string[] = []
      notifs.map((i: any) => {
        pubId.push(i.mentionPublication.id)
        vhrTxn.push('')
        addresses.push(i.mentionPublication.collectNftAddress)
      })
      setPubIdData([...pubIdData, ...pubId])
      setVhrTxnData([...vhrTxnData, ...vhrTxn])
      setAddressData([...addressData, ...addresses])
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
            Header: 'Status',
            accessor: 'verified'
          }
        ]
      }
    ],
    []
  )

  const computeHours = (rows: Row<Data>[]) => {
    let result = 0
    rows
      .filter((row) => {
        return row.values.verified.value === 'Verified'
      })
      .forEach((row) => {
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

  const { loading, rows } = useTable(
    {
      columns,
      data: tableData
    },
    useFilters
  )

  const Complete = () => {
    if (callback) callback(computeHours(rows), computeVolunteers(rows))
    return <div />
  }

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{!loading && <Complete />}</>
}

export default OrgVerifiedHours
