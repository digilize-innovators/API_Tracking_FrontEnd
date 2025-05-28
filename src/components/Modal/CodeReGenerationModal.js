import {Checkbox,Divider,Grid2,Paper,TableBody,TableCell,TableContainer,TableHead,TextField,Typography,Button,Modal,Box,Table,TableRow} from '@mui/material'
import moment from 'moment'
import React, { useState } from 'react'
import { style } from 'src/configs/generalConfig'

const CodeReGenerationModal = ({ open, onClose, handleGenerateCode, availableCodeData, setAvailableCodeData ,setForm,setAuthModalOpen,config}) => {
  const [selected, setSelected] = useState([])

  const handleCheckboxChange = id => {
    setSelected(prevSelected =>
      prevSelected.includes(id) ? prevSelected.filter(item => item !== id) : [...prevSelected, id]
    )
  }

  const changeGenereateCode = (id, value, availableValue) => {
    if (value <= availableValue) {
      const packagingHierarchyData = availableCodeData?.packagingHierarchyData
      const updatedData = packagingHierarchyData.map(item => {
        if (item.id === id) {
          return { ...item, generate: value }
        } else {
          return item
        }
      })
      setAvailableCodeData({ ...availableCodeData, packagingHierarchyData: updatedData })
    }
  }
 const  handleSubmit =()=>{
  if (config?.config?.esign_status) {
    setAuthModalOpen(true);
    return;
  }
  handleGenerateCode(true,{},"approved")
 }
  

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        data-testid='modal'
        role='dialog'
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
      >
        <Box sx={{ ...style, width: '70%' }}>
          <Typography variant='h3' className='my-2'>
            Re-Generate Codes
          </Typography>

          <Grid2 item xs={12} className='d-flex justify-content-between align-items-center mb-2'>
            <Box className='w-50'>
              <TextField
                fullWidth
                id='productId'
                label='Product'
                placeholder='Product'
                value={availableCodeData?.batch?.productHistory?.product_name}
                disabled={true}
              />
            </Box>
            <Box className='w-50' sx={{ ml: 2 }}>
              <TextField
                fullWidth
                id='batchId'
                label='Batch No.'
                placeholder='Batch No.'
                value={availableCodeData?.batch?.batch_no}
                disabled={true}
              />
            </Box>
            <Box className='w-50' sx={{ ml: 2 }}>
              <TextField
                fullWidth
                id='location'
                label='Location'
                placeholder='Location'
                value={availableCodeData?.locations?.location_name}
                disabled={true}
              />
            </Box>
          </Grid2>
          <Grid2 item xs={12} className='d-flex justify-content-between align-items-center mb-2'>
            <Box className='w-50'>
              <TextField
                fullWidth
                id='manufacturingDate'
                label='Mfg. Date'
                placeholder='Mfg. Date'
                value={moment(availableCodeData?.batch?.manufacturing_date).format('DD-MM-YYYY')}
                disabled={true}
              />
            </Box>
            <Box className='w-50' sx={{ ml: 2 }}>
              <TextField
                fullWidth
                id='expiryDate'
                label='Expiry Date'
                placeholder='Expiry Date'
                value={moment(availableCodeData?.batch?.expiry_date).format('DD-MM-YYYY')}
                disabled={true}
              />
            </Box>
            <Box className='w-50' sx={{ ml: 2 }}>
              <TextField
                fullWidth
                id='batchQuantity'
                label='Batch Quantity'
                placeholder='Batch Quantity'
                value={availableCodeData?.batch?.qty}
                disabled={true}
              />
            </Box>
          </Grid2>
          <Divider sx={{ my: 6, backgroundColor: 'black', width: '90%', mx: 'auto' }} />

          <Grid2 item xs={12} className='d-flex justify-content-between align-items-center mb-2'>
            <Box className='w-75'>
              <TableContainer component={Paper}>
                <Table aria-label='simple table'>
                  <TableHead>
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell>Packing Level</TableCell>
                      <TableCell>Batch Qty</TableCell>
                      <TableCell>Generated Codes</TableCell>
                      <TableCell>Available Codes</TableCell>
                      <TableCell>Generate</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {availableCodeData?.packagingHierarchyData?.map(row => (
                      <TableRow key={row.id}>
                        <TableCell padding='checkbox'>
                          <Checkbox checked={selected.includes(row.id)} onChange={() => handleCheckboxChange(row.id)} />
                        </TableCell>
                        <TableCell>{row.level}</TableCell>
                        <TableCell>{row.batchQty}</TableCell>
                        <TableCell>{row.generatedCodes}</TableCell>
                        <TableCell>{row.availableCodes}</TableCell>
                        <TableCell>
                          <TextField
                            value={row.generate}
                            onChange={e => changeGenereateCode(row.id, e.target.value, row.availableCodes)}
                            size='medium'
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            <Box className='w-25' sx={{ ml: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box
                component='img'
                sx={{
                  marginTop: 3,
                  width: '60%',
                  height: '60%',
                  borderRadius: '8px',
                  border: '1px solid grey',
                  mb: 4
                }}
                src='/images/packaginghierarchy01.png'
                alt='description'
              />
              <TextField
                fullWidth
                id='packagingHierarchy'
                label='Packaging Hierarchy'
                placeholder='Packaging Hierarchy'
                value={availableCodeData?.batch?.productHistory?.packagingHierarchy}
                disabled={true}
              />
            </Box>
          </Grid2>

          <Grid2 item xs={12} className='my-3 '>
            <Button variant='contained' sx={{ marginRight: 3.5 }} disabled={availableCodeData?.batch?.isBatchEnd} onClick={() => handleSubmit()}>
              Generate
            </Button>
            <Button variant='outlined' color='error' sx={{ marginLeft: 3.5 }} onClick={onClose}>
              Close
            </Button>
          </Grid2>
        </Box>
      </Modal>
    </>
  )
}

export default CodeReGenerationModal
