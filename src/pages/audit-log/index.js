'use-client'
import React, { useState, useEffect, useRef, useMemo } from 'react'
import Box from '@mui/material/Box'
import Grid2 from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import { Button, TextField, Paper, TableContainer } from '@mui/material'
import { CiExport } from 'react-icons/ci'
import TableAuditLog from 'src/views/tables/TableAuditLog'
import ProtectedRoute from 'src/components/ProtectedRoute'
import SnackbarAlert from 'src/components/SnackbarAlert'
import { useAuth } from 'src/Context/AuthContext'
import Head from 'next/head'
import { LocalizationProvider, StaticDateTimePicker } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { useSettings } from 'src/@core/hooks/useSettings'
import moment from 'moment'
import ChatbotComponent from 'src/components/ChatbotComponent'
import AccessibilitySettings from 'src/components/AccessibilitySettings'
import { validateToken } from 'src/utils/ValidateToken';
import CustomSearchBar from 'src/components/CustomSearchBar'
import downloadPdf from 'src/utils/DownloadPdf'

const Index = () => {
  const { settings } = useSettings()
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [alertData, setAlertData] = useState({ openSnackbar: false, type: '', message: '', variant: 'filled' })
  const [tableHeaderData, setTableHeaderData] = useState({
    searchVal: ''
  });
  const [auditLogData, setAuditLog] = useState()
  const [userDataPdf, setUserDataPdf] = useState()
  const { getUserData } = useAuth()
  const [openStartPicker, setOpenStartPicker] = useState(false)
  const [openEndPicker, setOpenEndPicker] = useState(false)
  const startPickerRef = useRef(null)
  const endPickerRef = useRef(null)
  const searchBarRef = useRef(null);


  const tableBody = auditLogData?.map((item, index) => [
    index + 1,
    item.performed_action,
    item.remarks,
    item.user_name,
    item.user_id,
    item.performed_at
  ]);
  const tableData = useMemo(() => ({
    tableHeader: ['Sr.No.', 'Action', 'Remarks', 'User Name', 'User ID', 'Timestamp'],
    tableHeaderText: 'Audit Log Report',
    tableBodyText: 'Audit Log Data',
    filename: 'Audit-log'
  }), []);
  useEffect(() => {
    const data = getUserData()
    setUserDataPdf(data)
  }, [])


  const closeSnackbar = () => {
    setAlertData({ ...alertData, openSnackbar: false })
  }
  const handleSearch = (val) => {
    setTableHeaderData({ ...tableHeaderData, searchVal: val.trim().toLowerCase() })
  }

  const resetFilter = () => {
    if (searchBarRef.current) {
      searchBarRef.current.resetSearch();
    }
    setTableHeaderData({ ...tableHeaderData, searchVal: "" })
    setStartDate(null)
    setEndDate(null)
  }


  const pdfDownload = () => {
    downloadPdf(tableData, tableHeaderData, tableBody, auditLogData, userDataPdf)
  }
  useEffect(() => {
    const handleClickOutside = event => {
      if (startPickerRef.current && !startPickerRef.current.contains(event.target)) {
        setOpenStartPicker(false)
      }
      if (endPickerRef.current && !endPickerRef.current.contains(event.target)) {
        setOpenEndPicker(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])
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
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box ref={startPickerRef}>
                      <TextField
                        label='Start Date'
                        value={startDate ? moment(startDate).format('DD/MM/YYYY, hh:mm:ss') : ''}
                        onFocus={() => setOpenStartPicker(true)}
                        fullWidth
                        size='small'
                        readOnly
                      />
                      {openStartPicker && (
                        <Box position='absolute' zIndex={1000}>
                          <StaticDateTimePicker
                            displayStaticWrapperAs='desktop'
                            value={startDate}
                            onChange={newValue => {
                              setStartDate(newValue)
                              setOpenStartPicker(false)
                            }}
                          />
                        </Box>
                      )}
                    </Box>
                    <Box sx={{ ml: 3 }} ref={endPickerRef}>
                      <TextField
                        label='End Date'
                        value={endDate ? moment(endDate).format('DD/MM/YYYY, hh:mm:ss') : ''}
                        onFocus={() => setOpenEndPicker(true)}
                        fullWidth
                        size='small'
                        readOnly
                      />
                      {openEndPicker && (
                        <Box position='absolute' zIndex={1000}>
                          <StaticDateTimePicker
                            displayStaticWrapperAs='desktop'
                            value={endDate}
                            onChange={newValue => {
                              setEndDate(newValue)
                              setOpenEndPicker(false)
                            }}
                          />
                        </Box>
                      )}
                    </Box>
                  </Box>
                </LocalizationProvider>
              </Box>
              <Box className='d-flex justify-content-between align-items-center mx-4 my-2'>
                <Box className='d-flex'>
                  <Box>
                    <Button variant='contained' style={{ display: 'inline-flex' }} onClick={pdfDownload}>
                      <Box style={{ display: 'flex', alignItems: 'baseline' }}>
                        <span>
                          <CiExport fontSize={20} />
                        </span>
                        <span style={{ marginLeft: 8 }}>Export</span>
                      </Box>
                    </Button>
                  </Box>
                  <Box className='mx-2'>
                    <Button variant='contained' style={{ display: 'inline-flex' }} onClick={resetFilter}>
                      Reset
                    </Button>
                  </Box>
                </Box>
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
                  setAuditLog={setAuditLog}
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