import { matchSorter } from 'match-sorter'
import React, { useState } from 'react'

export const FuzzySearch = (item: any) => {
  const [value, setValue] = useState('')
  const column = item.column
  // const count = column.preFilteredRows.length
  return (
    <input
      className="w-full"
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
      className="w-full"
      value={item.filterValue}
      type="date"
      onChange={(e) => {
        column.setFilter(e.target.value || undefined)
      }}
    />
  )
}

export const fuzzyTextFilterFn = (rows: any, id: any, filterValue: any) => {
  return matchSorter(rows, filterValue, {
    keys: [(row: any) => row.values[id]]
  })
}
fuzzyTextFilterFn.autoRemove = (val: any) => !val

export const greaterThanEqualToFn = (rows: any, id: any, filterValue: any) => {
  return rows.filter((row: any) => {
    const rowValue = new Date(row.values[id])
    const filterDate = new Date(filterValue)
    return rowValue >= filterDate
  })
}

export const lessThanEqualToFn = (rows: any, id: any, filterValue: any) => {
  return rows.filter((row: any) => {
    const rowValue = new Date(row.values[id])
    const filterDate = new Date(filterValue)
    return rowValue <= filterDate
  })
}
