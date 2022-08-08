import clsx from 'clsx'
import dynamic from 'next/dynamic'
import { ComponentProps, forwardRef, ReactNode, useId } from 'react'
import { useTranslation } from 'react-i18next'

import { FieldError } from './Form'

const HelpTooltip = dynamic(() => import('./HelpTooltip'))

interface Props extends Omit<ComponentProps<'input'>, 'prefix'> {
  label?: string
  prefix?: string | ReactNode
  className?: string
  helper?: ReactNode
  error?: boolean
  change?: Function
}

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, prefix, type = 'text', error, className = '', helper, ...props },
  ref
) {
  const id = useId()
  const { t } = useTranslation('common')

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
          {type === 'startDate' && (
            <>
              <input
                type="checkbox"
                style={{ position: 'relative' }}
                onClick={() => {
                  if (!props.change) return
                  props.change()
                }}
              />
              <label style={{ position: 'relative' }}>
                {t('Multiple Days')}
              </label>
            </>
          )}

          <HelpTooltip content={helper} />
        </div>
      )}
      <div className="flex">
        {prefix && (
          <span className="inline-flex items-center px-3 text-gray-500 bg-gray-100 rounded-l-xl border border-r-0 border-gray-300 dark:bg-gray-900 roun xl dark:border-gray-700/80">
            {prefix}
          </span>
        )}
        <input
          id={id}
          className={clsx(
            { '!border-red-500 placeholder-red-500': error },
            { 'rounded-r-xl': prefix },
            { 'rounded-xl': !prefix },
            'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700/80 focus:border-brand-500 focus:ring-brand-400 disabled:opacity-60 disabled:bg-gray-500 disabled:bg-opacity-20 outline-none w-full',
            className
          )}
          type={type === 'startDate' ? 'date' : type}
          ref={ref}
          {...props}
        />
      </div>
      {props.name && <FieldError name={props.name} />}
    </label>
  )
})
