'use-client'
import React, { useState, useRef } from 'react'
import { Box, Grid2, Typography } from '@mui/material'
import ProtectedRoute from 'src/components/ProtectedRoute'
import SnackbarAlert from 'src/components/SnackbarAlert'
import Head from 'next/head'
import { useSettings } from 'src/@core/hooks/useSettings'
import ChatbotComponent from 'src/components/ChatbotComponent'
import AccessibilitySettings from 'src/components/AccessibilitySettings'
import { validateToken } from 'src/utils/ValidateToken'
import ExportResetActionButtons from 'src/components/ExportResetActionButtons'
import CustomSearchBar from 'src/components/CustomSearchBar'
import TableStockSummary from 'src/views/tables/TableStockSummary'

const Index = () => {
  const { settings } = useSettings()
  const [alertData, setAlertData] = useState({ openSnackbar: false, type: '', message: '', variant: 'filled' })
  const [tableHeaderData, setTableHeaderData] = useState({ esignStatus: '', searchVal: '' })
  const searchBarRef = useRef(null)

  const closeSnackbar = () => {
    setAlertData({ ...alertData, openSnackbar: false })
  }

  const resetFilter = () => {
    setTableHeaderData({ ...tableHeaderData, esignStatus: '', searchVal: '' })
    if (searchBarRef.current) {
      searchBarRef.current.resetSearch()
    }
  }
  const handleSearch = val => {
    setTableHeaderData({ ...tableHeaderData, searchVal: val.trim().toLowerCase() })
  }

  return (
    <Box padding={4}>
      <Head>
        <title>Stock Summary</title>
      </Head>
      <Grid2 item xs={12}>
        <Typography variant='h2'>Stock Summary</Typography>
      </Grid2>
      <Grid2 item xs={12}>
        <Grid2 item xs={12}>
          <Box sx={{ backgroundColor: settings.mode === 'dark' ? '#212121' : 'white', borderRadius: 1 }}>
            <Grid2 item xs={12}>
              <Typography variant='h4' className='mx-4 my-2 mx-2' sx={{ paddingTop: '1%' }}>
                Filter
              </Typography>
              <Grid2 item xs={12}>
                <Box className='d-flex justify-content-between align-items-center mx-4 my-2'>
                  <ExportResetActionButtons handleDownloadPdf={null} resetFilter={resetFilter} />
                  <Box className='d-flex justify-content-between align-items-center '>
                    <CustomSearchBar ref={searchBarRef} handleSearchClick={handleSearch} />
                  </Box>
                </Box>
              </Grid2>
            </Grid2>
            <Grid2 item xs={12}>
              <Typography variant='h4' className='mx-4 mt-3'>
                Stock Summary Data
              </Typography>
            </Grid2>
            <Grid2 item xs={12}>
              <TableStockSummary tableHeaderData={tableHeaderData} />
            </Grid2>
          </Box>
        </Grid2>
      </Grid2>
      <SnackbarAlert openSnackbar={alertData.openSnackbar} closeSnackbar={closeSnackbar} alertData={alertData} />
      <AccessibilitySettings />
      <ChatbotComponent />
    </Box>
  )
}
export async function getServerSideProps(context) {
  return validateToken(context, 'Stock ')
}
export default ProtectedRoute(Index)
