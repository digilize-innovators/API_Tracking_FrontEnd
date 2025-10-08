import React, { useEffect, useState } from 'react'
import { Modal, Box, Typography, Button, FormGroup, FormControlLabel, Checkbox, TextField, Grid2 } from '@mui/material'
import { useAuth } from 'src/Context/AuthContext'
import { useLoading } from 'src/@core/hooks/useLoading'
import { useRouter } from 'next/router'
import { api } from 'src/utils/Rest-API'
import SnackbarAlert from '../SnackbarAlert'
import PropTypes from 'prop-types'
 
const modalBoxStyle = {
  width: '50vw', // 70% of viewport width
  maxHeight: '70vh', // 70% of viewport height
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)', // Perfect centering

  // Styling
  backgroundColor: '#fff',
  borderRadius: 1,
  padding: 4
}

const VendorcountryModal = ({ openModal, handleCloseModal, editData,codeStructure,setCodeStructure }) => {
  const { setIsLoading } = useLoading()
  const { removeAuthToken } = useAuth()
  const router = useRouter()
  const [alertData, setAlertData] = useState({ type: '', message: '', variant: 'filled', openSnackbar: false })
  const [crmURL, setCrmURL] = useState({ value: '', checked: false })
//   const [codeStructure, setCodeStructure] = useState([])
  const [urlMakerData, setUrlMakerData] = useState([
    {
      label: 'Product',
      options: [
        {
          label: 'Registration No',
          value: 'registrationNo',
          checked: false
        },
        {
          label: 'GTIN',
          value: 'GTIN',
          checked: false
        }
      ]
    },
    {
      label: 'Batch',
      options: [
        {
          label: 'Batch No',
          value: 'batchNo',
          checked: false
        },
        {
          label: 'Manufacturing Date',
          value: 'manufacturingDate',
          checked: false
        },
        {
          label: 'Expiry Date',
          value: 'expiryDate',
          checked: false
        }
      ]
    },
    {
      label: 'Unique Code',
      options: [
        {
          label: 'Unique Code',
          value: 'uniqueCode',
          checked: false
        }
      ]
    },
    {
      label: 'Group Separator',
      options: [
        { label: '00', value: '00', Description: 'GTIN', checked: false },
        { label: '01', value: '01', Description: 'GTIN (product)', checked: false },
        { label: '10', value: '10', Description: 'Batch', checked: false },
        { label: '11', value: '11', Description: 'ProductionDate', checked: false },
        { label: '12', value: '12', Description: 'Due Date', checked: false },
        { label: '13', value: '13', Description: 'Packaging Date', checked: false },
        { label: '15', value: '15', Description: 'Best Before Date', checked: false },
        { label: '17', value: '17', Description: 'Expiration Date', checked: false },
        { label: '20', value: '20', Description: 'Product Variant', checked: false },
        { label: '21', value: '21', Description: 'Serial Number', checked: false },
        { label: '22', value: '22', Description: 'Consumer Product Code', checked: false },
        { label: '240', value: '240', Description: 'Secondary Serial Number', checked: false },
        { label: '30', value: '30', Description: 'Quantity', checked: false },
        { label: '37', value: '37', Description: 'Quantity of Items ', checked: false },
        { label: '90', value: '90', Description: 'Internal Identification', checked: false },
        { label: '91', value: '91', Description: 'Application Identifier', checked: false },
        { label: '92', value: '92', Description: 'Additional Information', checked: false },
        { label: '93', value: '93', Description: 'Packaging/Serialization information', checked: false },
        { label: '94', value: '94', Description: 'Discount Codes', checked: false },
        { label: '95', value: '95', Description: 'Other Use', checked: false }
      ]
    }
  ])
  const closeSnackbar = () => {
    setAlertData({ ...alertData, openSnackbar: false })
  }

  const handleSave = () => {
    
    handleCloseModal()
}
  const undoCodeStructureValue = () => {
    let updatedCodeStructure = [...codeStructure]
    const lastValue = updatedCodeStructure.pop()
    setCodeStructure(updatedCodeStructure)
    const updatedUrlMarker = urlMakerData?.map(item => ({
      ...item,
      options: item?.options?.map(op => (op.value === lastValue ? { ...op, checked: false } : op))
    }))
    setUrlMakerData(updatedUrlMarker)
  }

  const handleCheckboxChange = (value, outerLabel, label, check) => {
    let checked = !check
    const updatedData = urlMakerData.map(el => {
      if (el.label === outerLabel) {
        return {
          ...el,
          options: el.options.map(
            el2 =>
              el2.label === label
                ? { ...el2, checked: !el2.checked } // Create a new object with updated `checked`
                : el2 // Return the original object for unchanged items
          )
        }
      }
      return el // Return the original object for unmatched labels
    })
    setUrlMakerData(updatedData)

    if (checked) {
      const updatedCodeStructure = codeStructure?.length > 0 ? [...codeStructure] : []
      updatedCodeStructure.push(value)
      setCodeStructure(updatedCodeStructure)
    } else {
      let updatedCodeStructure = codeStructure?.length > 0 ? [...codeStructure] : []
      updatedCodeStructure.splice(updatedCodeStructure.indexOf(value), 1)
      setCodeStructure(updatedCodeStructure)
    }
  }

  const handleCRMURLChange = e => {
    setCrmURL({ ...crmURL, checked: !crmURL.checked })
    if (codeStructure?.length) {
      const updatedCodeStructure = []
      if (e.target.checked) {
        setCodeStructure([...codeStructure, e.target.value])
      } else {
        updatedCodeStructure.splice(updatedCodeStructure.indexOf('CRMURL'), 1)
        setCodeStructure([...codeStructure, ...updatedCodeStructure])
      }
    }
  }

  const resetForm = () => {
    setCodeStructure([])
    setCrmURL({ ...crmURL, checked: false })
   
    const updatedData = urlMakerData.map(el => {
      return {
        ...el,
        options: el?.options?.map(option => {
          return {
            ...option,
            checked: false
          }
        })
      }
    })
    setUrlMakerData(updatedData)

   
  }

  useEffect(() => {
    resetForm()
  }, [])

  useEffect(() => {
    if (editData) {
      const rawCodeStructure = editData?.code_structure || editData?.codeStructure || ''
      const editCodeStructure = Array.isArray(rawCodeStructure)
        ? rawCodeStructure
        : (rawCodeStructure || '')
            .toString()
            .trim()
            .split(/\s+/)
            .filter(Boolean)

      updateCheckedValues(editCodeStructure)
      setCodeStructure(editCodeStructure)
    }
  }, [editData])

  useEffect(() => {
    const values = Array.isArray(codeStructure)
      ? codeStructure
      : (codeStructure || '')
          .toString()
          .trim()
          .split(/\s+/)
          .filter(Boolean)
    setCrmURL(prev => ({ value: prev.value, checked: values.includes('CRMURL') }))
    setUrlMakerData(prevData =>
      prevData.map(group => ({
        ...group,
        options: group.options.map(option => ({
          ...option,
          checked: values.includes(option.value)
        }))
      }))
    )
  }, [codeStructure])

  const resetEditForm = () => {
    const raw = editData?.code_structure || editData?.codeStructure || ''
    const values = Array.isArray(raw)
      ? raw
      : (raw || '')
          .toString()
          .trim()
          .split(/\s+/)
          .filter(Boolean)
    setCodeStructure(values)

  
    setCrmURL(prev => ({ value: prev.value, checked: values.includes('CRMURL') }))
    setUrlMakerData(prevData =>
      prevData.map(group => ({
        ...group,
        options: group.options.map(option => ({
          ...option,
          checked: values.includes(option.value)
        }))
      }))
    )
  }

  const updateCheckedValues = valuesToFind => {
    if (valuesToFind?.includes('CRMURL')) {
      setCrmURL({ value: 'CRMURL', checked: true })
    }

     const updateGroupOptions = group => {
    const updatedOptions = group?.options?.map(option => {
      if (valuesToFind?.includes(option.value)) {
        return { ...option, checked: true };
      }
      return option;
    });

    return { ...group, options: updatedOptions };
  };

  setUrlMakerData(prevData => prevData.map(updateGroupOptions))
  }

 
 

  return (
    <>
      <Modal
        open={openModal}
        onClose={() => {
          resetEditForm()
          handleCloseModal()
        }}
        data-testid='modal'
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
      >
        <Box sx={modalBoxStyle}>
          <Typography variant='h4' className='my-3' sx={{ textAlign: 'center', fontWeight: 'bold' }}>
            {editData?.id ? 'Edit CodeStructure' : 'Add CodeStructure'}
          </Typography>
          <Grid2
            sx={{
              maxHeight: '50vh', // or any height you need
              overflowY: 'auto',
              paddingRight: 2 // optional: add padding to avoid scrollbar overlap
            }}
          >

            <Grid2 container spacing={2}>
              <Grid2 size={5} sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant='body1'>Code Structure :</Typography>
              </Grid2>
              <Grid2 size={5}>
                <TextField
                  fullWidth
                  id='url'
                  multiline
                  rows={3}
                  value={codeStructure?.length ? codeStructure?.join(' ') : ''}
                  required
                  disabled
                  style={{ backgroundColor: '#dde1e7', borderRadius: 5 }}
                />
              </Grid2>
              <Grid2 size={2}>
                <Button
                  variant='outlined'
                  fullWidth
                  color='primary'
                  sx={{ marginTop: 2 }}
                  onClick={undoCodeStructureValue}
                >
                  Undo
                </Button>
              </Grid2>
            </Grid2>

            {urlMakerData.map((item, index) => (
              <Grid2 container spacing={2} key={item.label}>
                <Grid2 size={5} sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant='body1'>{item.label} :</Typography>
                </Grid2>
                <Grid2 size={7}>
                  <FormGroup row>
                    {item?.options?.map((option, idx) => (
                      <Grid2 size='auto' key={option.value}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              value={option.value}
                              checked={option.checked}
                              onChange={e =>
                                handleCheckboxChange(e.target.value, item.label, option.label, option.checked)
                              }
                            />
                          }
                          label={option.label}
                        />
                      </Grid2>
                    ))}
                  </FormGroup>
                </Grid2>                                                                                      
              </Grid2>
            ))}

            <Grid2 container spacing={2}>
              <Grid2 size={5} sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant='body1'>Separator :</Typography>
              </Grid2>
              <Grid2 size={7}>
                <Button onClick={() => setCodeStructure([...codeStructure, '/'])}>/</Button>
              </Grid2>
            </Grid2>

            <Grid2 container spacing={2}>
              <Grid2 size={5} sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant='body1'>Special Character :</Typography>
              </Grid2>
              <Grid2 size={7}>
                <Button onClick={() => setCodeStructure([...codeStructure, '<FNC>'])}>{'<FNC>'}</Button>
              </Grid2>
            </Grid2>

            {crmURL.value && (
              <Grid2 container spacing={2}>
                <Grid2 size={5} sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant='body1'>CRM URL :</Typography>
                </Grid2>
                <Grid2 size={7}>
                  <FormGroup row>
                    <FormControlLabel
                      control={<Checkbox value={'CRMURL'} checked={crmURL.checked} onChange={handleCRMURLChange} />}
                      label={'CRMURL'}
                    />
                  </FormGroup>
                </Grid2>
              </Grid2>
            )}

            <Grid2 container spacing={2} className='mt-2'>
              <Button variant='contained' sx={{ marginRight: 3.5 }} onClick={handleSave}>
                Save Changes
              </Button>
              <Button variant='outlined' color='primary' onClick={editData?.id ? resetEditForm : resetForm}>
                Reset
              </Button>
              <Button
                variant='outlined'
                color='error'
                sx={{ marginLeft: 3.5 }}
                onClick={() => {
                  resetEditForm()
                  handleCloseModal()
                }}
              >
                Close
              </Button>
            </Grid2>
          </Grid2>
        </Box>
      </Modal>
      <SnackbarAlert alertData={alertData} closeSnackbar={closeSnackbar} openSnackbar={alertData.openSnackbar} />
    </>
  )
}
VendorcountryModal.propTypes={
  openModal:PropTypes.any,
   handleCloseModal:PropTypes.any,
    editData:PropTypes.any, 
    //  setOpenModal:PropTypes.any
}
export default VendorcountryModal
