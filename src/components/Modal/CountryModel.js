import React, { useEffect, useState } from 'react'
import { Modal, Box, Typography, Button, FormGroup, FormControlLabel, Checkbox, TextField, Grid2 } from '@mui/material'
import { useAuth } from 'src/Context/AuthContext'
import { useLoading } from 'src/@core/hooks/useLoading'
import { useRouter } from 'next/router'
import { api } from 'src/utils/Rest-API'
import SnackbarAlert from '../SnackbarAlert'

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

const AddCountryModalComponent = ({ openModal, handleCloseModal, editData, setEditData, setOpenModal }) => {
  const { setIsLoading } = useLoading()
  const { removeAuthToken } = useAuth()
  const router = useRouter()
  const [alertData, setAlertData] = useState({ type: '', message: '', variant: 'filled', openSnackbar: false })
  const [country, setCountry] = useState('')
  const [crmURL, setCrmURL] = useState({ value: '', checked: false })
  const [codeStructure, setCodeStructure] = useState([])

  const [errorCountry, setErrorCountry] = useState({ isError: false, message: '' })
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
          label: 'NDC',
          value: 'NDC',
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
    // console.log("click on ", value, outerLabel, label)
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
    console.log(codeStructure)
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
    setCountry('')
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

    // setErrorCodeStructure({ isError: false, message: '' })
    setErrorCountry({ isError: false, message: '' })
    setEditData({})
  }

  useEffect(() => {
    resetForm()
    getCRMURL()
  }, [])

  useEffect(() => {
    if (editData) {
      setCountry(editData?.country)
      const editCodeStructure = editData?.codeStructure?.split(/\s+/)
      updateCheckedValues(editCodeStructure)
      setCodeStructure(editCodeStructure)
    }
  }, [editData])

  const resetEditForm = () => {
    console.log('Reset edit field')
    setCodeStructure('')
    const newURLMakerData = editData?.codeStructure?.split('/')
    console.log(newURLMakerData)

    // Create a Set for quick lookups of valid labels
    const validLabels = new Set(newURLMakerData.slice(newURLMakerData?.length)) // Only store labels after index 1 for efficient lookup

    // Map through the existing data
    const updatedData = urlMakerData.map(el => ({
      ...el,
      options: el?.options?.map(option => ({
        ...option,
        checked: validLabels.has(option.label)
      }))
    }))
    setUrlMakerData(updatedData)

    setCountry(editData?.country)
    setEditData(prev => ({
      ...prev,
      country: prev.country,
      crmurl: prev.crmurl,
      codeStructure: prev.codeStructure
    }))
  }

  const updateCheckedValues = valuesToFind => {
    if (valuesToFind?.includes('CRMURL')) {
      setCrmURL({ value: 'CRMURL', checked: true })
    }

    setUrlMakerData(prevData =>
      prevData.map(group => ({
        ...group,
        options: group?.options?.map(option =>
          valuesToFind?.includes(option.value) ? { ...option, checked: true } : option
        )
      }))
    )
  }

  const getCRMURL = async () => {
    try {
      setIsLoading(true)
      const res = await api('/superadmin-configuration/', {}, 'get', true)
      setIsLoading(false)
      console.log('All superadmin config ', res?.data?.data)
      if (res.data.success) {
        console.log(res.data.data.crm_url)
        console.log(editData)
        setCrmURL({ value: res.data.data[0].crm_url, checked: false })
      } else {
        console.log('Error to get all super admin configuration ', res.data)
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log('Error in get companies ', error)
      setIsLoading(false)
    }
  }

  const validateNotEmpty = (field, value, fieldName, required = true) => {
    if ((required && value?.trim() === '') || (!required && !value)) {
      field({ isError: true, message: `${fieldName} can't be empty` })
    } else {
      field({ isError: false, message: '' })
    }
  }

  const applyValidation = () => {
    validateNotEmpty(setErrorCountry, country, 'Country', true)
    // validateNotEmpty(setErrorCodeStructure, codeStructure, 'url', true)
  }

  const checkValidate = () => {
    let isValid = true
    if (!codeStructure || codeStructure == '') {
      // setErrorCodeStructure({ isError: true, message: 'Code Structure is required' })
      isValid = false
    }
    if (!country || country == '') {
      setErrorCountry({ isError: true, message: 'Country is required' })
      isValid = false
    }
    return isValid
  }

  const handleSubmitForm = async () => {
    applyValidation()
    const validate = checkValidate()
    console.log('Validate ', validate)
    if (!validate) {
      return
    }
    editData?.id ? editCountry() : addCountry()
  }

  const addCountry = async () => {
    try {
      const data = {
        country,
        codeStructure: codeStructure.join(' ')
        // crmURL
      }
      // console.log('Add country data ', data)
      setIsLoading(true)
      const res = await api('/country-master/', data, 'post', true)
      setIsLoading(false)
      console.log('REs of Country ', res.data)
      if (res?.data?.success) {
        console.log('res data of add country', res?.data)
        setAlertData({ ...alertData, type: 'success', message: 'Country added successfully', openSnackbar: true })
        resetForm()
      } else {
        console.log('error to add country ', res.data)
        setAlertData({ ...alertData, type: 'error', message: res.data?.message, openSnackbar: true })
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log('Erorr to add country ', error)
      router.push('/500')
    } finally {
      setOpenModal(false)
      setIsLoading(false)
      resetForm()
    }
  }

  const editCountry = async () => {
    try {
      const data = {
        country,
        codeStructure: codeStructure.join(' ')
      }

      console.log('Edit country data ', data)
      setIsLoading(true)
      const res = await api(`/country-master/${editData.id}`, data, 'put', true)
      setIsLoading(false)
      if (res?.data?.success) {
        console.log('res of edit country ', res?.data)
        setAlertData({ ...alertData, type: 'success', message: 'Country updated successfully', openSnackbar: true })
        resetForm()
      } else {
        console.log('error to edit country ', res.data)

        setAlertData({ ...alertData, type: 'error', message: res.data.message, openSnackbar: true })
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log('Eorrr to edit country ', error)
      router.push('/500')
    } finally {
      setOpenModal(false)
      setIsLoading(false)
      resetForm()
    }
  }

  return (
    <>
      <Modal
        open={openModal}
        onClose={() => {
          resetForm()
          handleCloseModal()
        }}
        data-testid='modal'
        role='dialog'
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
      >
        <Box sx={modalBoxStyle}>
          <Typography variant='h4' className='my-3' sx={{ textAlign: 'center', fontWeight: 'bold' }}>
            {editData?.id ? 'Edit Country URL' : 'Add Country URL'}
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
                <Typography variant='body1'>Enter Country Name :</Typography>
              </Grid2>
              <Grid2 size={7} sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  id='country'
                  onChange={e => {
                    setErrorCountry('')
                    setCountry(e.target.value)
                  }}
                  value={country}
                  required
                  error={errorCountry.isError}
                  helperText={errorCountry.isError ? errorCountry.message : ''}
                />
              </Grid2>
            </Grid2>

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
                  value={codeStructure?.length ? codeStructure?.join('') : ''}
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
              <Grid2 container spacing={2} key={index}>
                <Grid2 size={5} sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant='body1'>{item.label} :</Typography>
                </Grid2>
                <Grid2 size={7}>
                  <FormGroup row>
                    {item?.options?.map((option, idx) => (
                      <Grid2 size='auto' key={idx}>
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
              <Button variant='contained' sx={{ marginRight: 3.5 }} onClick={handleSubmitForm}>
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
                  resetForm()
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
export default AddCountryModalComponent
