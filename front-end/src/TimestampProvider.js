import React, { createContext, useContext, useEffect, useState } from 'react';

const TimestampContext = createContext();

export const useTimestampContext = () => {
  return useContext(TimestampContext)
}

export const TimestampProvider = ({ children }) => {
  const [offset, setOffset] = useState(0) // videoStart + offset = fileStart
  const [videoStart, setVideoStart] = useState('')
  const [fileStart, setFileStart] = useState('')
  const [chartTimestamp, setChartTimestamp] = useState(0)
  const [videoTimestamp, setVideoTimestamp] = useState(0)

  useEffect(() => {
    setOffset(new Date(fileStart) - new Date(videoStart))
  }, [videoStart, fileStart])

  useEffect(() => {
    const newTimestamp = chartTimestamp - offset
    if (videoTimestamp != newTimestamp) setVideoTimestamp(newTimestamp)
  }, [chartTimestamp, offset])

  useEffect(() => {
    const newTimestamp = videoTimestamp + offset
    if (videoTimestamp != newTimestamp) setChartTimestamp(newTimestamp)
  }, [videoTimestamp, offset])

  return (
    <TimestampContext.Provider
      value={{
        chartTimestamp,
        setChartTimestamp,
        videoTimestamp,
        setVideoTimestamp,
        setVideoStart,
        setFileStart,
      }}
    >
      {children}
    </TimestampContext.Provider>
  )
}