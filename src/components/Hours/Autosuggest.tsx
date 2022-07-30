import dynamic from 'next/dynamic'
import React, { FC, useState } from 'react'

const HelpTooltip = dynamic(() => import('src/components/UI/HelpTooltip'))

interface Props {
  lang: any
}

const Autosuggest: FC<Props> = ({ lang }) => {
  const [searchtext, setSearchtext] = useState('')
  const [suggest, setSuggest] = useState([])
  const handleChange = (e: { target: { value: any } }) => {
    let searchval = e.target.value
    let suggestion = []
    if (searchval.length > 0) {
      suggestion = lang
        .sort()
        .filter((e: string) =>
          e.toLowerCase().includes(searchval.toLowerCase())
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
              <li onClick={() => suggestedText(item)}>{item}</li>
              {index !== suggest.length - 1 && <hr />}
            </div>
          )
        })}
      </ul>
    )
  }
  return (
    <>
      <input
        type="text"
        placeholder="Search.."
        value={searchtext}
        onChange={handleChange}
      />
      {getSuggestion()}
    </>
  )
}

export default Autosuggest
