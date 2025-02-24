import React, { createContext, useState, useMemo } from 'react'
import PropTypes from 'prop-types'

export const LoaderContext = createContext({
  isLoading: false,
  setIsLoading: () => null
})

export const LoaderProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false)

  const contextValue = useMemo(() => ({ isLoading, setIsLoading }), [isLoading, setIsLoading])

  return <LoaderContext.Provider value={contextValue}>{children}</LoaderContext.Provider>
}

LoaderProvider.propTypes = {
  children: PropTypes.any
}

export const LoaderConsumer = LoaderContext.Consumer
