'use-client'
import React, { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Grid2 from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import { Button, TableContainer, Paper } from '@mui/material'
import { IoMdAdd } from 'react-icons/io'
import Head from 'next/head'
import { useSettings } from 'src/@core/hooks/useSettings'
import ChatbotComponent from 'src/components/ChatbotComponent'
import AccessibilitySettings from 'src/components/AccessibilitySettings'
import { getTokenValues } from '../utils/tokenUtils'
import TableCountryMaster from 'src/views/tables/TableCountryMaster'
import AddCountryModalComponent from 'src/components/Modal/CountryModel.js'

const Index = () => {
  const { settings } = useSettings()
  const [openModal, setOpenModal] = useState(false)
  const [editData, setEditData] = useState({})
  const [config, setConfig] = useState(null)

  useEffect(() => {
    const decodedToken = getTokenValues()
    setConfig(decodedToken)
    return () => {}
  }, [])

  const handleOpenModal = async () => {
    setOpenModal(true)
  }

  const handleCloseModal = () => {
    setOpenModal(false)
  }

  const handleUpdate = async item => {
    setOpenModal(true)
    setEditData(item)
    console.log('edit country', item)
  }

  return (
    <Box padding={4}>
      <Head>
        <title>Country Master</title>
      </Head>
      <Grid2 item xs={12}>
        <Typography variant='h2'>Country Master</Typography>
      </Grid2>
      <Grid2 item xs={12}>
        <Grid2 item xs={12}>
          <Box sx={{ backgroundColor: settings.mode === 'dark' ? '#212121' : 'white', borderRadius: 1 }}>
            <Grid2 item xs={12}>
              <Box className='d-flex justify-content-end align-items-center mx-4 my-2' paddingTop={'1%'}>
                <Box className='d-flex justify-content-between align-items-center '>
                  <Box className='mx-2 '>
                    <Button
                      variant='contained'
                      className='py-2 d-flex align-items-center'
                      onClick={handleOpenModal}
                    >
                      <span>
                        <IoMdAdd />
                      </span>
                      <span>Add Country</span>
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Grid2>
            <Grid2 item xs={12}>
              <Typography variant='h4' className='mx-4 my-2 mt-3'>
                Country Master Data
              </Typography>
              <TableContainer component={Paper}>
                <TableCountryMaster openModal={openModal} handleUpdate={handleUpdate} config={config} />
              </TableContainer>
            </Grid2>
          </Box>
        </Grid2>
      </Grid2>

      <AddCountryModalComponent
        openModal={openModal}
        setOpenModal={setOpenModal}
        handleCloseModal={handleCloseModal}
        editData={editData}
        setEditData={setEditData}
      />
      <AccessibilitySettings />
      <ChatbotComponent />
    </Box>
  )
}

export default Index
