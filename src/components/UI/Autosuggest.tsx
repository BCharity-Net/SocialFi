import { matchSorter } from 'match-sorter'
import React, { FC, ReactNode, useState } from 'react'
import AutoSuggest from 'react-autosuggest'

interface Props {
  lang: string[]
  label?: string
  prefix?: string | ReactNode
  className?: string
  helper?: ReactNode
  error: string | undefined
  onChange?: Function
  placeholder?: string
  type?: string
  onAdd?: Function
}

const Autocomplete: FC<Props> = ({
  lang,
  label,
  error,
  onChange,
  placeholder,
  onAdd
}) => {
  const [value, setValue] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])

  return (
    <>
      {label && (
        <div className="flex items-center mb-1 space-x-1.5">
          <div className="font-medium text-gray-800 dark:text-gray-200">
            <label
              style={{
                width: '500px',
                float: 'right',
                marginRight: '-400px',
                marginBottom: '-12px'
              }}
            >
              {label}
            </label>
          </div>
        </div>
      )}
      <AutoSuggest
        suggestions={suggestions}
        onSuggestionsClearRequested={() => setSuggestions([])}
        onSuggestionsFetchRequested={({ value }) => {
          setValue(value)
          setSuggestions(matchSorter(lang, value))
        }}
        onSuggestionSelected={(_, { suggestionValue }) => {
          if (onAdd) onAdd(suggestionValue)
        }}
        getSuggestionValue={(suggestion) => suggestion}
        renderSuggestion={(suggestion) => <span>{suggestion}</span>}
        inputProps={{
          placeholder: placeholder,
          value: value,
          onChange: (_, { newValue }) => {
            if (onChange) onChange(newValue)
            setValue(newValue)
          }
        }}
        highlightFirstSuggestion={true}
      />
      {error && (
        <div className="mt-1 text-sm font-bold text-red-500">{error}</div>
      )}
    </>
  )
}

export default Autocomplete
