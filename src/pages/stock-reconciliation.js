'use-client'
import React, { useState, useRef } from 'react'
import { Button, TableContainer, Paper, Box, Grid2, Typography } from '@mui/material'
import ProtectedRoute from 'src/components/ProtectedRoute'
import SnackbarAlert from 'src/components/SnackbarAlert'
import Head from 'next/head'
import { useSettings } from 'src/@core/hooks/useSettings'
import ChatbotComponent from 'src/components/ChatbotComponent'
import AccessibilitySettings from 'src/components/AccessibilitySettings'
import { validateToken } from 'src/utils/ValidateToken'
import ExportResetActionButtons from 'src/components/ExportResetActionButtons'
import TableStockReconciliation from 'src/views/tables/TableStockReconciliation'
import StockReconciliation from 'src/components/Modal/StockReconciliation'

const Index = () => {
  const { settings } = useSettings()
  const [alertData, setAlertData] = useState({ openSnackbar: false, type: '', message: '', variant: 'filled' })
  const [tableHeaderData, setTableHeaderData] = useState({ esignStatus: '', searchVal: '' })
  const searchBarRef = useRef(null)
  const [openModel, setOpenModel] = useState(false)

  const closeSnackbar = () => {
    setAlertData({ ...alertData, openSnackbar: false })
  }

  const resetFilter = () => {
    setTableHeaderData({ ...tableHeaderData, esignStatus: '', searchVal: '' })
    if (searchBarRef.current) {
      searchBarRef.current.resetSearch()
    }
  }

  const handleStart = () => {
    setOpenModel(true)
  }
  const handleCloseModal = () => {
    setOpenModel(false)
  }

  return (
    <Box padding={4}>
      <Head>
        <title>Stock Reconciliation</title>
      </Head>
      <Grid2 item xs={12}>
        <Typography variant='h2'>Stock Reconciliation</Typography>
      </Grid2>
      <Grid2 item xs={12}>
        <Grid2 item xs={12}>
          <Box sx={{ backgroundColor: settings.mode === 'dark' ? '#212121' : 'white', borderRadius: 1 }}>
            <Typography variant='h4' className='mx-4 my-2 mx-2' sx={{ paddingTop: '1%' }}>
              Filter
            </Typography>
            <Grid2 item xs={12}>
              <Box className='d-flex justify-content-between align-items-center my-3 mx-4'></Box>
              <Box className='d-flex justify-content-between align-items-center mx-4 my-2'>
                <ExportResetActionButtons handleDownloadPdf={()=>{}} resetFilter={resetFilter} />
                <Button variant='contained' className='mx-2' role='button' onClick={handleStart}>
                  <span>Start Reconciliation </span>
                </Button>
              </Box>
            </Grid2>
            <Grid2 item xs={12}>
                <TableStockReconciliation />
            </Grid2>
          </Box>
        </Grid2>
      </Grid2>
      <SnackbarAlert openSnackbar={alertData.openSnackbar} closeSnackbar={closeSnackbar} alertData={alertData} />

      <StockReconciliation open={openModel} onClose={handleCloseModal} handleSubmitForm={()=> {}} />
      <AccessibilitySettings />
      <ChatbotComponent />
    </Box>
  )
}
export async function getServerSideProps(context) {
  return validateToken(context, 'Stock Reconciliation')
}
export default ProtectedRoute(Index)
