'use-client'
import React, { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Select from '@mui/material/Select'
import { useSettings } from 'src/@core/hooks/useSettings'
import { Grid2, Typography, FormControl, InputLabel, MenuItem, Button } from '@mui/material'
import { validateToken } from 'src/utils/ValidateToken'
import AccessibilitySettings from 'src/components/AccessibilitySettings'
import ChatbotComponent from 'src/components/ChatbotComponent'
import { decodeAndSetConfig } from '../../utils/tokenUtils'
import Head from 'next/head'
import { api } from 'src/utils/Rest-API'
import SnackbarAlert from 'src/components/SnackbarAlert'
import { useLoading } from 'src/@core/hooks/useLoading'
import { useAuth } from 'src/Context/AuthContext'
import { useRouter } from 'next/router'

const Index = () => {
  const [config, setConfig] = useState(null)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [alertData, setAlertData] = useState({ type: '', message: '', variant: 'filled' })
  const [files, setFiles] = useState([])
  const [selectedFile, setSelectedFile] = useState('')
  const settings = useSettings()
  const { removeAuthToken } = useAuth()
  const { setIsLoading } = useLoading()
  const router = useRouter()

  useEffect(() => {
    decodeAndSetConfig(setConfig)
    return () => {}
  }, [])

  useEffect(() => {
    getFiles()
  }, [])

  const closeSnackbar = () => {
    setOpenSnackbar(false)
  }

  const getFiles = async () => {
    try {
      setIsLoading(true)
      const response = await api('/backup-files', null, 'get',true)
      // console.log(response.data.success)
      setFiles(response?.data?.data?.files)
      setIsLoading(false)

      if (response.data.success) {
        setOpenSnackbar(true)
        setAlertData({ ...alertData, type: 'success', message: response.data?.message })
        setFiles([...response.data.data.files].sort())
      }
      else{
        if (response.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        } else {
          setOpenSnackbar(true)
          setAlertData({ ...alertData, type: 'error', message: response.data?.message })
        }
      }
    } catch (error) {
      console.error(error)
      setOpenSnackbar(true)
      setAlertData({ ...alertData, type: 'error', message: error?.message })
    }
  }

  const restoreBackupBtn = async () => {
    try {
      if(!selectedFile ||selectedFile==''){
        setOpenSnackbar(true)
          setAlertData({ ...alertData, type: 'error', message:"Please select a file to proceed." })
        return 
      }
      const data = { fileName: selectedFile }
      setIsLoading(true)
      const response = await api('/backup-files', data, 'post',true)
      // console.log(response)
      setIsLoading(false)
      if (response?.data?.success) {
        setOpenSnackbar(true)
        setAlertData({ ...alertData, type: 'success', message: response?.data?.message })
        setFiles([...response.data.data.files])
      }else{
        if (response.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        } else {
          setOpenSnackbar(true)
          setAlertData({ ...alertData, type: 'error', message: response?.data?.message })
        }
      }
    } catch (error) {
      console.error(error)
      setOpenSnackbar(true)
      setAlertData({ ...alertData, type: 'error', message: error?.message })
    }
  }

  return (
    <Box padding={4}>
      <Head>
        <title>Recovery Utility</title>
      </Head>
      <Grid2 item xs={12}>
        <Typography variant='h2'>Recovery Utility</Typography>
      </Grid2>
      <Box sx={{ height: '50vh' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around',
            alignItems: 'center',
            backgroundColor: settings.mode === 'dark' ? '#212121' : 'white',
            borderRadius: 1,
            height: '80%',
            padding: 4,
            gap: '1rem'
          }}
        >
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <FormControl fullWidth sx={{ width: 240 }}>
              <InputLabel id='time'>Time</InputLabel>
              <Select
                labelId='time'
                id='time'
                label='Time'
                value={selectedFile}
                onChange={e => setSelectedFile(e.target.value)}
              >
                {files.map(file => {
                  return (
                    <MenuItem value={file} key={file}>
                      {file}
                    </MenuItem>
                  )
                })}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'row',justifyContent:'end' }}>
            <Button variant='contained' onClick={async () => await restoreBackupBtn()}>
              Restore Backup
            </Button>
          </Box>
        </Box>
      </Box>
      <SnackbarAlert openSnackbar={openSnackbar} closeSnackbar={closeSnackbar} alertData={alertData} />
      <AccessibilitySettings />
      <ChatbotComponent />
    </Box>
  )
}

export async function getServerSideProps(context) {
  return validateToken(context, 'Product Master')
}
export default Index
