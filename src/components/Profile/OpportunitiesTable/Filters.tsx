import { matchSorter } from 'match-sorter'
import React, { useMemo, useState } from 'react'
import { Row } from 'react-table'

import { Data } from './index'

export const NoFilter = () => {
  return <div />
}

export const FuzzySearch = (item: any) => {
  const [value, setValue] = useState('')
  const column = item.column
  // const count = column.preFilteredRows.length
  return (
    <input
      className="w-full dark:bg-gray-900"
      value={value}
      onChange={(e) => {
        setValue(e.target.value)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          column.setFilter(value || undefined)
        }
      }}
      placeholder={`Search`}
    />
  )
}

export const DateSearch = (item: any) => {
  const column = item.column
  return (
    <input
      className="w-full border-0 p-0 text-neutral-500 dark:bg-gray-900"
      value={item.filterValue}
      type="date"
      onChange={(e) => {
        column.setFilter(e.target.value || undefined)
      }}
    />
  )
}

export const SelectColumnFilter = (item: any) => {
  const filterValue = item.column.filterValue
  const setFilter = item.column.setFilter
  const preFilteredRows = item.column.preFilteredRows
  const id = item.column.id
  const options = useMemo(() => {
    const options = new Set()
    preFilteredRows.forEach((row: any) => {
      options.add(row.values[id].value)
    })
    return [...options.values()]
  }, [id, preFilteredRows])
  return (
    <select
      className="border-0 text-neutral-500 dark:bg-gray-900 pt-0 pb-0 pl-0 pr-6"
      value={filterValue}
      onChange={(e) => {
        setFilter(e.target.value || undefined)
      }}
    >
      <option value="">All</option>
      {options.map((option: any, i) => (
        <option key={i} value={option}>
          {option}
        </option>
      ))}
    </select>
  )
}

export const fuzzyTextFilterFn = (
  rows: Row<Data>[],
  id: number,
  filterValue: any
) => {
  return matchSorter(rows, filterValue, {
    keys: [(row: any) => row.values[id]]
  })
}
fuzzyTextFilterFn.autoRemove = (val: any) => !val

export const greaterThanEqualToFn = (
  rows: Row<Data>[],
  id: number,
  filterValue: any
) => {
  return rows.filter((row: any) => {
    const rowValue = new Date(row.values[id])
    const filterDate = new Date(filterValue)
    return rowValue >= filterDate
  })
}

export const lessThanEqualToFn = (
  rows: Row<Data>[],
  id: number,
  filterValue: any
) => {
  return rows.filter((row: any) => {
    const rowValue = new Date(row.values[id])
    const filterDate = new Date(filterValue)
    return rowValue <= filterDate
  })
}

export const getStatusFn = (
  rows: Row<Data>[],
  id: number,
  filterValue: any
) => {
  return rows.filter((row: Row<Data>) => {
    const rowValue = row.values[id].value
    return rowValue === filterValue
  })
}
