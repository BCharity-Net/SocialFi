/* eslint-disable react/jsx-key */
import { gql, useLazyQuery, useQuery } from '@apollo/client'
import PostsShimmer from '@components/Shared/Shimmer/PostsShimmer'
import { Card } from '@components/UI/Card'
import { EmptyState } from '@components/UI/EmptyState'
import { ErrorMessage } from '@components/UI/ErrorMessage'
import { Profile } from '@generated/types'
import { CollectionIcon, ExternalLinkIcon } from '@heroicons/react/outline'
import Logger from '@lib/logger'
import React, { FC, useMemo, useState } from 'react'
import { useTable } from 'react-table'
import { POLYGONSCAN_URL } from 'src/constants'
import { useAppPersistStore } from 'src/store/app'

import NFTDetails from './NFTDetails'

const WHO_COLLECTED_QUERY = gql`
  query WhoCollected($request: WhoCollectedPublicationRequest!) {
    whoCollectedPublication(request: $request) {
      items {
        address
      }
    }
  }
`

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
}

interface Data {
  from: string
  description: string
  startDate: string
  endDate: string
  totalHours: number
  verified: {
    index: number
    value: string
  }
}

const OrganizationFeed: FC<Props> = ({ profile }) => {
  const { currentUser } = useAppPersistStore()
  const [tableData, setTableData] = useState<Data[]>([])
  const [addressData, setAddressData] = useState<string[]>([])
  const [getCollectAddress] = useLazyQuery(WHO_COLLECTED_QUERY, {
    onCompleted() {
      Logger.log('Lazy Query =>', `Fetched collected result`)
    }
  })

  const fetchCollectAddress = (pubId: string) =>
    getCollectAddress({
      variables: {
        request: { publicationId: pubId }
      }
    }).then(({ data }) => {
      return data.whoCollectedPublication.items
    })

  const handleTableData = async (data: any) => {
    return Promise.all(
      data.map(async (j: any, index: number) => {
        const i = j.mentionPublication
        let verified = false
        if (i.collectNftAddress)
          await fetchCollectAddress(i.id).then((data) => {
            data.forEach((item: any) => {
              if (verified) return
              verified = item.address === i.metadata.attributes[1].value
            })
          })
        return {
          from: i.metadata.name,
          description: i.metadata.description,
          startDate: i.metadata.attributes[2].value,
          endDate: i.metadata.attributes[3].value,
          totalHours: i.metadata.attributes[4].value,
          verified: {
            index: index,
            value: verified ? 'Verified' : 'Unverified'
          }
        }
      })
    )
  }

  const handleNFTData = (data: any, index: number) =>
    fetch(data)
      .then((i) => i)
      .then((result) => {
        result.json().then((metadata) => {
          tableData[index] = {
            from: metadata.name,
            description: metadata.description,
            startDate: metadata.attributes[2].value,
            endDate: metadata.attributes[3].value,
            totalHours: metadata.attributes[4].value,
            verified: {
              index: index,
              value: 'Verified'
            }
          }
          setTableData(tableData)
        })
      })

  const tableLimit = 10
  const { data, loading, error, fetchMore } = useQuery(NOTIFICATIONS_QUERY, {
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
      const notifs = data?.notifications?.items.filter((i: any) => {
        return (
          i.__typename === 'NewMentionNotification' &&
          i.mentionPublication.metadata.attributes[0].value === 'hours' &&
          !i.mentionPublication.hidden
        )
      })
      handleTableData(notifs).then((result: Data[]) => {
        setTableData([...tableData, ...result])
        if (tableData.length != tableLimit) {
          fetchMore({
            variables: {
              offset: tableLimit - tableData.length
            }
          })
        }
      })
      const addresses: string[] = notifs.map((i: any) => {
        return i.mentionPublication.collectNftAddress
      })
      setAddressData([...addressData, ...addresses])
    }
  })

  const columns = useMemo(
    () => [
      {
        Header: 'VHR Submissions',
        columns: [
          {
            Header: 'From',
            accessor: 'from',
            Cell: (props: { value: string }) => {
              const user = props.value
              return (
                <a
                  href={`/u/${user}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {user}
                </a>
              )
            }
          },
          {
            Header: 'Description',
            accessor: 'description'
          },
          {
            Header: 'Start Date',
            accessor: 'startDate'
          },
          {
            Header: 'End Date',
            accessor: 'endDate'
          },
          {
            Header: 'Total Hours',
            accessor: 'totalHours'
          },
          {
            Header: 'Status',
            accessor: 'verified',
            Cell: (props: { value: { index: number; value: string } }) => {
              const status = props.value.value
              const index = props.value.index
              if (status !== 'Verified') {
                return <span>{status}</span>
              }
              return (
                <a
                  href={`${POLYGONSCAN_URL}/token/${addressData[index]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-500"
                >
                  {status}{' '}
                  {<ExternalLinkIcon className="w-4 h-4 inline-flex" />}
                </a>
              )
            }
          }
        ]
      }
    ],
    [addressData]
  )

  const Table = () => {
    const { getTableProps, getTableBodyProps, headerGroups, prepareRow, rows } =
      useTable({ columns, data: tableData })

    return (
      <table
        className="w-full text-md text-center mb-2 mt-2"
        {...getTableProps()}
      >
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th className="p-4" {...column.getHeaderProps()}>
                  {column.render('Header')}
                </th>
              ))}
            </tr>
          ))}
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
                <NFTDetails
                  address={addressData[index]}
                  callback={(data: any) => {
                    handleNFTData(data, index)
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
      {data?.notifications?.items?.length === 0 && (
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
      {!error && !loading && data?.notifications?.items?.length !== 0 && (
        <Card>
          <Table />
        </Card>
      )}
    </>
  )
}

export default OrganizationFeed