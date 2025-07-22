'use-client'
import React, { useState, useEffect, useRef, useMemo, useLayoutEffect } from 'react'
import { TextField, Paper, TableContainer, Box, Grid2, Typography } from '@mui/material'
import TableAuditLog from 'src/views/tables/TableAuditLog'
import ProtectedRoute from 'src/components/ProtectedRoute'
import SnackbarAlert from 'src/components/SnackbarAlert'
import { useAuth } from 'src/Context/AuthContext'
import Head from 'next/head'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { useSettings } from 'src/@core/hooks/useSettings'
import ChatbotComponent from 'src/components/ChatbotComponent'
import AccessibilitySettings from 'src/components/AccessibilitySettings'
import { validateToken } from 'src/utils/ValidateToken'
import CustomSearchBar from 'src/components/CustomSearchBar'
import downloadPdf from 'src/utils/DownloadPdf'
import AuthModal from 'src/components/authModal'
import { getTokenValues } from '../utils/tokenUtils'
import ExportResetActionButtons from 'src/components/ExportResetActionButtons'
import { api } from 'src/utils/Rest-API'
import { DesktopDateTimePicker } from '@mui/x-date-pickers/DesktopDateTimePicker'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'



const Index = () => {
  const { settings } = useSettings()
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [alertData, setAlertData] = useState({ openSnackbar: false, type: '', message: '', variant: 'filled' })
  const [tableHeaderData, setTableHeaderData] = useState({
    searchVal: ''
  })
  const [auditLogData, setAuditLogData] = useState({ data: [], index: 0 })
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [openModalApprove, setOpenModalApprove] = useState(false)
  const [esignDownloadPdf, setEsignDownloadPdf] = useState(false)
  const [approveAPI, setApproveAPI] = useState({ approveAPIName: '', approveAPImethod: '', approveAPIEndPoint: '' })

  const [userDataPdf, setUserDataPdf] = useState()
  const { getUserData } = useAuth()
 
  const [config, setConfig] = useState(null)
 
  const searchBarRef = useRef(null)

  const tableBody = auditLogData?.data?.map((item, index) => [
    index + 1,
    item.performed_action,
    item.remarks,
    item.user_name,
    item.user_id,
    item.performed_at
  ])
  const tableData = useMemo(
    () => ({
      tableHeader: ['Sr.No.', 'Action', 'Remarks', 'User Name', 'User ID', 'Timestamp'],
      tableHeaderText: 'Audit Log Report',
      tableBodyText: 'Audit Log Data',
      filename: 'Audit-log'
    }),
    []
  )
  useLayoutEffect(() => {
    let data = getUserData()
    const decodedToken = getTokenValues()
    setConfig(decodedToken)
    setUserDataPdf(data)
    return () => {}
  }, [])

  const closeSnackbar = () => {
    setAlertData({ ...alertData, openSnackbar: false })
  }
  const handleSearch = val => {
    setTableHeaderData({ ...tableHeaderData, searchVal: val.trim().toLowerCase() })
  }
  const handleAuthModalClose = () => {
    setAuthModalOpen(false)
    setOpenModalApprove(false)
    setEsignDownloadPdf(false)
  }

  const resetFilter = () => {
    if (searchBarRef.current) {
      searchBarRef.current.resetSearch()
    }
    setTableHeaderData({ ...tableHeaderData, searchVal: '' })
    setStartDate(null)
    setEndDate(null)
  }
  const handleAuthModalOpen = () => {
    setApproveAPI({
      approveAPIName: 'auditlog-approve',
      approveAPImethod: 'PATCH',
      approveAPIEndPoint: '/api/v1/auditlog'
    })
    setAuthModalOpen(true)
  }
  const handleDownloadPdf = () => {
    setApproveAPI({
      approveAPIName: 'auditlog-approve',
      approveAPImethod: 'PATCH',
      approveAPIEndPoint: '/api/v1/auditlog'
    })
    if (config?.config?.esign_status) {
      setEsignDownloadPdf(true)
      setAuthModalOpen(true)
      return
    }
    downloadPdf(tableData, tableHeaderData, tableBody, auditLogData.data, userDataPdf)
  }
  const handleAuthResult = async (isAuthenticated, user, isApprover, esignStatus, remarks) => {
    const resetState = () => {
      setApproveAPI({ approveAPIName: '', approveAPImethod: '', approveAPIEndPoint: '' })
      setEsignDownloadPdf(false)
      setAuthModalOpen(false)
    }

    const handleUnauthenticated = () => {
      setAlertData({ type: 'error', message: 'Authentication failed, Please try again.', openSnackbar: true })
      resetState()
    }

    if (!isAuthenticated) {
      handleUnauthenticated()
      return
    }
    if (isApprover && esignDownloadPdf) {
      downloadPdf(tableData, tableHeaderData, tableBody, auditLogData.data, user)
      if (config?.config?.audit_logs) {
        const data = {}
        data.audit_log = {
          audit_log: true,
          performed_action: 'Export report of auditlog ',
          remarks: remarks?.length > 0 ? remarks : `Auditlog export report `,
          authUser: user
        }
        await api(`/auditlog/`, data, 'post', true)
      }
      resetState()
      return
    }

    if (!isApprover && esignDownloadPdf) {
      setAlertData({
        ...alertData,
        openSnackbar: true,
        type: 'error',
        message: 'Access denied: Download pdf disabled for this user.'
      })
      resetState()
      
    }
  }
  return (
    <Box padding={4}>
      <Head>
        <title>Audit Logs</title>
      </Head>
      <Grid2 item xs={12}>
        <Typography variant='h2'>Audit Master</Typography>
      </Grid2>

      <Grid2 item xs={12}>
        <Grid2 item xs={12}>
          <Box sx={{ backgroundColor: settings.mode === 'dark' ? '#212121' : 'white', borderRadius: 1 }}>
            <Typography variant='h4' className='mx-4 my-2 mx-2' sx={{ paddingTop: '1%' }}>
              Filter
            </Typography>
            <Grid2 item xs={12}>
              <Box className='d-flex justify-content-between align-items-center mx-4 my-3'>
             <LocalizationProvider dateAdapter={AdapterMoment}>
  <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
    {/* Start Date */}
    <DesktopDateTimePicker
      label="Start Date"
      value={startDate}
      onChange={(newValue) => setStartDate(newValue)}
      inputFormat="DD/MM/YYYY"
      renderInput={(params) => (
        <TextField
          {...params}
          fullWidth
          size="small"
          readOnly
        />
      )}
    />

    {/* End Date */}
    <DesktopDateTimePicker
      label="End Date"
      value={endDate}
      onChange={(newValue) => setEndDate(newValue)}
      inputFormat="DD/MM/YYYY"
      renderInput={(params) => (
        <TextField
          {...params}
          fullWidth
          size="small"
          readOnly
        />
      )}
    />
  </Box>
</LocalizationProvider>



              </Box>
              <Box className='d-flex justify-content-between align-items-center mx-4 my-2'>
                <ExportResetActionButtons handleDownloadPdf={handleDownloadPdf} resetFilter={resetFilter} />

                <Box className='d-flex justify-content-between align-items-center '>
                  <CustomSearchBar ref={searchBarRef} handleSearchClick={handleSearch} />
                </Box>
              </Box>
            </Grid2>
            <Grid2 item xs={12}>
              <Typography variant='h4' className='mx-4 my-2 mt-3'>
                Audit log Data
              </Typography>
              <TableContainer component={Paper}>
                <TableAuditLog
                  setAuditLog={setAuditLogData}
                  tableHeaderData={tableHeaderData}
                  startDate={startDate}
                  endDate={endDate}
                  setAlertData={setAlertData}
                />
              </TableContainer>
            </Grid2>
          </Box>
        </Grid2>
      </Grid2>
      <AuthModal
        open={authModalOpen}
        handleClose={handleAuthModalClose}
        handleAuthResult={handleAuthResult}
        approveAPIName={approveAPI.approveAPIName}
        approveAPIEndPoint={approveAPI.approveAPIEndPoint}
        approveAPImethod={approveAPI.approveAPImethod}
        config={config}
        handleAuthModalOpen={handleAuthModalOpen}
        openModalApprove={openModalApprove}
      />
      <SnackbarAlert openSnackbar={alertData.openSnackbar} closeSnackbar={closeSnackbar} alertData={alertData} />
      <AccessibilitySettings />
      <ChatbotComponent />
    </Box>
  )
}


export async function getServerSideProps(context) {
  return validateToken(context, 'Audit Logs')
}
export default ProtectedRoute(Index)
