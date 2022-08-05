import clsx from 'clsx'
import React, { FC, ReactNode, useId, useState } from 'react'

interface Props {
  lang?: string[]
  label?: string
  prefix?: string | ReactNode
  className?: string
  helper?: ReactNode
  error?: boolean
  change?: Function
  placeholder?: string
  type?: string
  onAdd?: Function
}

const Autosuggest: FC<Props> = ({
  lang,
  label,
  prefix,
  className,
  helper,
  error,
  change,
  placeholder,
  type,
  onAdd
}) => {
  const [searchtext, setSearchtext] = useState('')
  const [suggest, setSuggest] = useState<string[]>([])
  const handleChange = (e: { target: { value: any } }) => {
    if (onAdd) onAdd(e.target.value)
    let searchval = e.target.value
    let suggestion: string[] = []
    if (searchval.length > 0) {
      if (!lang) return
      suggestion = lang
        .sort()
        .filter(
          (e: string) =>
            e.length > searchval.length &&
            e.substring(0, searchval.length).toLowerCase() ===
              searchval.toLowerCase()
        )
    }
    setSuggest(suggestion)
    setSearchtext(searchval)
  }

  const suggestedText = (value: React.SetStateAction<string>) => {
    setSearchtext(value)
    setSuggest([])
  }
  const getSuggestion = () => {
    return (
      <ul>
        {suggest.map((item, index) => {
          return (
            <div key={index}>
              <li
                className="cursor-pointer list-none hover:bg-gray-200 rounded-md pl-3"
                onClick={() => suggestedText(item)}
              >
                {item}
              </li>
              {index !== suggest.length - 1 && <hr />}
            </div>
          )
        })}
      </ul>
    )
  }
  const id = useId()

  return (
    <label className="w-full" htmlFor={id}>
      {label && (
        <div className="flex items-center mb-1 space-x-1.5">
          <div className="font-medium text-gray-800 dark:text-gray-200">
            <label
              style={{ width: '500px', float: 'right', marginRight: '-400px' }}
            >
              {label}
            </label>
          </div>
        </div>
      )}
      <input
        type={type}
        placeholder={placeholder}
        className={clsx(
          { '!border-red-500 placeholder-red-500': error },
          { 'rounded-r-xl': prefix },
          { 'rounded-xl': !prefix },
          'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700/80 focus:border-brand-500 focus:ring-brand-400 disabled:opacity-60 disabled:bg-gray-500 disabled:bg-opacity-20 outline-none w-full',
          className
        )}
        value={searchtext}
        onChange={handleChange}
      />
      {getSuggestion()}
    </label>
  )
}

export default Autosuggest
