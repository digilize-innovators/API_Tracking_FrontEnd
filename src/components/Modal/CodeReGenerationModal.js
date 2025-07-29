import {
  Checkbox,
  Divider,
  Grid2,
  Paper,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TextField,
  Typography,
  Button,
  Modal,
  Box,
  Table,
  TableRow,
  FormHelperText,
  Tooltip
} from '@mui/material'
import moment from 'moment'
import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import { style } from 'src/configs/generalConfig'

const CodeReGenerationModal = ({
  open,
  onClose,
  availableCodeData,
  setAvailableCodeData,
  setAuthModalOpen,
  handleGenerateCode,
  config
}) => {
  const [errorData, setErrorData] = useState({ error: false, message: '' })
  const [isCodeAvailable, setIsCodeAvailable] = useState(false)

  useEffect(() => {
    setIsCodeAvailable(
      availableCodeData?.packagingHierarchyData?.some(row => row?.availableCodes > 0)
    )

    // Reset selections
    setAvailableCodeData(prev => ({
      ...prev,
      packagingHierarchyData: prev.packagingHierarchyData?.map(row => ({
        ...row,
        selected: false,
        generate: ''
      }))
    }))
    setErrorData({ error: false, message: '' })
  }, [open])

  const handleCheckboxChange = rowId => {
    setAvailableCodeData(prev => ({
      ...prev,
      packagingHierarchyData: prev.packagingHierarchyData.map(row =>
        row.id === rowId
          ? {
              ...row,
              selected: !row.selected,
              generate: !row.selected ? row.generate : ''
            }
          : row
      )
    }))
  }

  const changeGenereateCode = (id, value, availableValue) => {
    if (parseInt(value || 0) <= availableValue) {
      setAvailableCodeData(prev => ({
        ...prev,
        packagingHierarchyData: prev.packagingHierarchyData.map(row =>
          row.id === id ? { ...row, generate: value } : row
        )
      }))
    }
  }
 const hasGenerated = availableCodeData.packagingHierarchyData?.some(
  row =>
    row.selected &&
    row.generate &&
    /^\d+$/.test(row.generate) &&
    parseInt(row.generate) > 0
)
  const handleSubmit = () => {
  
    if(!hasGenerated)
    {
      setErrorData({ error: true, message: 'Enter number code to generate ' })
      return
    }
     else if (config?.config?.esign_status) {
      setErrorData({ error: false, message: '' })
      setAuthModalOpen(true)
      return 
    } 
   
    handleGenerateCode(true)

  }

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ ...style, width: '70%', maxHeight: '700px', overflowY: 'auto' }}>
        <Typography variant='h3' className='my-2'>
          Re-Generate Codes
        </Typography>

        <Grid2 item xs={12} className='d-flex justify-content-between align-items-center mb-2'>
          <Box className='w-50'>
            <TextField
              fullWidth
              label='Product'
              value={availableCodeData?.product?.product_history[0]?.product_name}
              disabled
            />
          </Box>
          <Box className='w-50' sx={{ ml: 2 }}>
            <TextField
              fullWidth
              label='Batch No.'
              value={availableCodeData?.batch?.batch_no}
              disabled
            />
          </Box>
          <Box className='w-50' sx={{ ml: 2 }}>
            <TextField
              fullWidth
              label='Location'
              value={availableCodeData?.locations?.history[0].location_name}
              disabled
            />
          </Box>
        </Grid2>

        <Grid2 item xs={12} className='d-flex justify-content-between align-items-center mb-2'>
          <Box className='w-50'>
            <TextField
              fullWidth
              label='Mfg. Date'
              value={moment(availableCodeData?.batch?.manufacturing_date).format('DD-MM-YYYY')}
              disabled
            />
          </Box>
          <Box className='w-50' sx={{ ml: 2 }}>
            <TextField
              fullWidth
              label='Expiry Date'
              value={moment(availableCodeData?.batch?.expiry_date).format('DD-MM-YYYY')}
              disabled
            />
          </Box>
          <Box className='w-50' sx={{ ml: 2 }}>
            <TextField
              fullWidth
              label='Batch Quantity'
              value={availableCodeData?.batch?.qty}
              disabled
            />
          </Box>
        </Grid2>

        <Divider sx={{ my: 6, backgroundColor: 'black', width: '90%', mx: 'auto' }} />

        <Grid2 item xs={12} className='d-flex justify-content-between align-items-center mb-2'>
          <Box className='w-75'>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell>Packing Level</TableCell>
                    <TableCell>Total no. Codes</TableCell>
                    <TableCell>Generated Codes</TableCell>
                    <TableCell>Available Codes</TableCell>
                    <TableCell>Generate</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {availableCodeData?.packagingHierarchyData?.map(row => (
                    <TableRow key={row.id}>
                      <Tooltip
                        title={
                          row.selected
                            ? 'Unselect to disable input'
                            : `Select to enable code generation on level ${parseInt(row.level)}`
                        }
                        placement='right'
                        arrow
                      >
                        <TableCell padding='checkbox'>
                          <Checkbox
                            checked={row.selected}
                            onChange={() => handleCheckboxChange(row.id)}
                          />
                        </TableCell>
                      </Tooltip>
                      <TableCell>{parseInt(row.level)}</TableCell>
                      <TableCell>{parseInt(row.batchQty)}</TableCell>
                      <TableCell>{parseInt(row.generatedCodes)}</TableCell>
                      <TableCell>{parseInt(row.availableCodes)}</TableCell>
                      <TableCell onClick={e => e.stopPropagation()}>
                        <TextField
                          value={row.generate}
                          disabled={!row.selected}
                          size='medium'
                          slotProps={{
                            input: {
                              inputMode: 'numeric',
                              pattern: '[0-9]*',
                              onInput: e => {
                                e.target.value = e.target.value.replace(/\D/g, '')
                              }
                            }
                          }}
                          onChange={e => {
                            const value = e.target.value
                            if (/^\d*$/.test(value)) {
                              changeGenereateCode(row.id, value, row.availableCodes)
                            }
                          }}
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
              label='Packaging Hierarchy'
              value={availableCodeData?.product?.product_history[0]?.packagingHierarchy}
              disabled
            />
          </Box>
        </Grid2>

        <FormHelperText error>{errorData.error ? errorData.message : ''}</FormHelperText>

        <Grid2 item xs={12} className='my-3'>
          <Button
            variant='contained'
            sx={{ marginRight: 3.5 }}
            disabled={availableCodeData?.batch?.isBatchEnd || !isCodeAvailable || !hasGenerated}
            onClick={handleSubmit}
          >
            Generate
          </Button>
          <Button variant='outlined' color='error' sx={{ marginLeft: 3.5 }} onClick={onClose}>
            Close
          </Button>
        </Grid2>
      </Box>
    </Modal>
  )
}

CodeReGenerationModal.propTypes = {
  open: PropTypes.any,
  onClose: PropTypes.any,
  availableCodeData: PropTypes.any,
  setAvailableCodeData: PropTypes.any,
  setAuthModalOpen: PropTypes.any,
  config: PropTypes.any,
  handleGenerateCode:PropTypes.any
}

export default CodeReGenerationModal
