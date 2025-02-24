'use-client'
import React, { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Grid2 from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import { Button, TextField, TableContainer, Paper, FormControlLabel, Checkbox, FormGroup } from '@mui/material'
import Modal from '@mui/material/Modal'
import { IoMdAdd } from 'react-icons/io'
import { api } from 'src/utils/Rest-API'
import SnackbarAlert from 'src/components/SnackbarAlert'
import { useLoading } from 'src/@core/hooks/useLoading'
import Head from 'next/head'
import { useAuth } from 'src/Context/AuthContext'
import { useSettings } from 'src/@core/hooks/useSettings'
import { useRouter } from 'next/router'
import ChatbotComponent from 'src/components/ChatbotComponent'
import AccessibilitySettings from 'src/components/AccessibilitySettings'
import { style } from 'src/configs/generalConfig'
import { decodeAndSetConfig } from '../../utils/tokenUtils'
import TableCountryMaster from 'src/views/tables/TableCountryMaster'

const Index = () => {
  const router = useRouter()
  const { settings } = useSettings()
  const [country, setCountry] = useState('')
  const [crmURL, setCrmURL] = useState({ value: '', checked: false })
  const [codeStructure, setCodeStructure] = useState([])
  const [openModal, setOpenModal] = useState(false)
  const [errorCountry, setErrorCountry] = useState({ isError: false, message: '' })
  // const [errorCodeStructure, setErrorCodeStructure] = useState({ isError: false, message: '' })
  const [editData, setEditData] = useState({})
  const [countryMasterData, setCountryMasterData] = useState([])
  const [sortDirection, setSortDirection] = useState('asc')
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [alertData, setAlertData] = useState({ type: '', message: '', variant: 'filled' })
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(settings.rowsPerPage)
  const [totalRecords, setTotalRecords] = useState(0)
  const { setIsLoading } = useLoading()
  const { removeAuthToken } = useAuth()
  const [config, setConfig] = useState(null)
  const [urlMakerData, setUrlMakerData] = useState([
    {
      label: "Product",
      options: [
        {
          label: "Registration No",
          value: "registrationNo",
          checked: false,
        },
        {
          label: "NDC",
          value: "NDC",
          checked: false,
        },
        {
          label: "GTIN",
          value: "GTIN",
          checked: false,
        }
      ]
    },
    {
      label: "Batch",
      options: [
        {
          label: "Batch No",
          value: "batchNo",
          checked: false,
        },
        {
          label: "Manufacturing Date",
          value: "manufacturingDate",
          checked: false,
        },
        {
          label: "Expiry Date",
          value: "expiryDate",
          checked: false,
        }
      ]
    },
    {
      label: "Unique Code",
      options: [
        {
          label: "Unique Code",
          value: "uniqueCode",
          checked: false,
        },
      ]
    },
    {
      label: "Group Separator",
      options: [
        { label: '00', value: '00', Description: 'GTIN', checked: false, },
        { label: '01', value: '01', Description: 'GTIN (product)', checked: false, },
        { label: '10', value: '10', Description: 'Batch', checked: false, },
        { label: '11', value: '11', Description: 'ProductionDate', checked: false, },
        { label: '12', value: '12', Description: 'Due Date', checked: false, },
        { label: '13', value: '13', Description: 'Packaging Date', checked: false, },
        { label: '15', value: '15', Description: 'Best Before Date', checked: false, },
        { label: '17', value: '17', Description: 'Expiration Date', checked: false, },
        { label: '20', value: '20', Description: 'Product Variant', checked: false, },
        { label: '21', value: '21', Description: 'Serial Number', checked: false, },
        { label: '22', value: '22', Description: 'Consumer Product Code', checked: false, },
        { label: '240', value: '240', Description: 'Secondary Serial Number', checked: false, },
        { label: '30', value: '30', Description: 'Quantity', checked: false, },
        { label: '37', value: '37', Description: 'Quantity of Items ', checked: false, },
        { label: '90', value: '90', Description: 'Internal Identification', checked: false, },
        { label: '91', value: '91', Description: 'Application Identifier', checked: false, },
        { label: '92', value: '92', Description: 'Additional Information', checked: false, },
        { label: '93', value: '93', Description: 'Packaging/Serialization information', checked: false, },
        { label: '94', value: '94', Description: 'Discount Codes', checked: false, },
        { label: '95', value: '95', Description: 'Other Use', checked: false }
      ]
    },
  ]);

  useEffect(() => {
    setTotalRecords(10)
    decodeAndSetConfig(setConfig)

    return () => { }
  }, [])

  useEffect(() => {
    getCountryMasterData()

  }, [openModal])

  const closeSnackbar = () => {
    setOpenSnackbar(false)
  }

  const handleOpenModal = async () => {
    resetForm()
    await getCRMURL()
    setOpenModal(true)
  }

  const handleCloseModal = () => {
    resetForm()
    setOpenModal(false)
  }

  const resetForm = () => {
    setCodeStructure([])
    setCrmURL({ value: 'CRM', checked: false })
    setCountry('')
    const updatedData = urlMakerData.map((el) => {
      return {
        ...el,
        options: el.options.map((option) => {
          return {
            ...option,
            checked: false,
          }
        })
      }
    });
    setUrlMakerData(updatedData)

    // setErrorCodeStructure({ isError: false, message: '' })
    setErrorCountry({ isError: false, message: '' })
    setEditData({})
  }

  const validateNotEmpty = (field, value, fieldName, required = true) => {
    if ((required && value.trim() === '') || (!required && !value)) {
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
  console.log(crmURL)
  const getCountryMasterData = async () => {
    try {
      setIsLoading(true)
      const res = await api('/country-master/', {}, 'get', true)
      setIsLoading(false)
      console.log('All Country Master Data : ', res?.data?.data)
      if (res.data.success) {
        // console.log(res.data.data[0].crm_url)
        setCountryMasterData(res.data.data.countryMaster)
      } else {
        console.log('Error to get all country master ', res.data)
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log('Error in get country master ', error)
      setIsLoading(false)
    }
  }
  const getCRMURL = async () => {
    try {
      setIsLoading(true)
      const res = await api('/superadmin-configuration/', {}, 'get', true)
      setIsLoading(false)
      console.log('All superadmin config ', res?.data?.data)
      if (res.data.success) {
        console.log(res.data.data[0].crm_url)
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
        setOpenSnackbar(true)
        setAlertData({ ...alertData, type: 'success', message: 'Country added successfully' })
        resetForm()
      } else {
        console.log('error to add country ', res.data)
        setOpenSnackbar(true)
        setAlertData({ ...alertData, type: 'error', message: res.data?.message })
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
    }
  }

  const editCountry = async () => {
    try {
      const data = {
        country,
        codeStructure: codeStructure.join(' '),

      }

      console.log('Edit country data ', data)
      setIsLoading(true)
      const res = await api(`/country-master/${editData.id}`, data, 'put', true)
      setIsLoading(false)
      if (res?.data?.success) {
        console.log('res of edit country ', res?.data)
        setOpenSnackbar(true)
        setAlertData({ ...alertData, type: 'success', message: 'Country updated successfully' })
        resetForm()
      } else {
        console.log('error to edit country ', res.data)
        setOpenSnackbar(true)
        setAlertData({ ...alertData, type: 'error', message: res.data.message })
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
    }
  }

  const resetEditForm = () => {
    console.log('Reset edit field')
    setCodeStructure('')
    setCountry('')
    setEditData(prev => ({
      ...prev,
      country: '',
      crmurl: '',
      codeStructure: ''
    }))
  }

  const updateCheckedValues = (valuesToFind) => {
    if (valuesToFind.includes("CRMURL")) {
      setCrmURL({ value: "CRMURL", checked: true })
    }


    setUrlMakerData((prevData) =>
      prevData.map((group) => ({
        ...group,
        options: group.options.map((option) =>
          valuesToFind.includes(option.value)
            ? { ...option, checked: true }
            : option
        ),
      }))
    );

  };



  const handleUpdate = async item => {
    resetForm()
    setOpenModal(true)
    setEditData(item)
    console.log('edit country', item)

    setCountry(item.country)
    const editCodeStructure = item.codeStructure.split(/\s+/)
    updateCheckedValues(editCodeStructure)

    setCodeStructure(editCodeStructure)

  }

  const handleSort = key => {
    const newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc'
    const sorted = [...countryMasterData].sort((a, b) => {
      if (a[key] > b[key]) {
        return newSortDirection === 'asc' ? 1 : -1
      }
      if (a[key] < b[key]) {
        return newSortDirection === 'asc' ? -1 : 1
      }
      return 0
    })
    setCountryMasterData(sorted)
    setSortDirection(newSortDirection)
  }
  const handleSortByCodeStructure = () => handleSort('codeStructure')
  const handleSortByCountry = () => handleSort('country')

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = event => {
    const newRowsPerPage = parseInt(event.target.value, 10)
    setRowsPerPage(newRowsPerPage)
    setPage(0)
  }

  const handleCheckboxChange = (value, outerLabel, label, check) => {
    // console.log("click on ", value, outerLabel, label)
    let checked = !check;
    const updatedData = urlMakerData.map((el) => {
      if (el.label === outerLabel) {
        return {
          ...el,
          options: el.options.map((el2) =>
            el2.label === label
              ? { ...el2, checked: !el2.checked } // Create a new object with updated `checked`
              : el2 // Return the original object for unchanged items
          ),
        };
      }
      return el; // Return the original object for unmatched labels
    });
    setUrlMakerData(updatedData);

    if (checked) {
      const updatedCodeStructure = [...codeStructure];
      updatedCodeStructure.push(value);
      setCodeStructure(updatedCodeStructure);
    } else {
      let updatedCodeStructure = [...codeStructure];
      updatedCodeStructure.splice(updatedCodeStructure.indexOf(value), 1);
      setCodeStructure(updatedCodeStructure);
    }
  }

  const handleCRMURLChange = (e) => {
    setCrmURL({ ...crmURL, checked: !crmURL.checked });
    const updatedCodeStructure = [...codeStructure]
    if (e.target.checked) {
      setCodeStructure([...codeStructure, e.target.value])
    } else {
      updatedCodeStructure.splice(updatedCodeStructure.indexOf("CRMURL"), 1);
      setCodeStructure([...updatedCodeStructure])
    }
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
                      role='button'
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
                <TableCountryMaster
                  countryMasterData={countryMasterData}
                  handleUpdate={handleUpdate}
                  sortDirection={sortDirection}
                  handleSortCountry={handleSortByCountry}
                  handleSortByCodeStructure={handleSortByCodeStructure}
                  totalRecords={totalRecords}
                  rowsPerPage={rowsPerPage}
                  page={page}

                  apiAccess={{ editApiAccess: true }}
                  handleChangePage={handleChangePage}
                  handleChangeRowsPerPage={handleChangeRowsPerPage}
                  config={config}
                />
              </TableContainer>
            </Grid2>
          </Box>
        </Grid2>
      </Grid2>
      <SnackbarAlert openSnackbar={openSnackbar} closeSnackbar={closeSnackbar} alertData={alertData} />
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        data-testid='modal'
        role='dialog'
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
      >
        <Box sx={{ ...style, width: '50%' }}>
          <Typography variant='h4' className='my-2'>
            {editData?.id ? 'Edit Country URL' : 'Add Country URL'}
          </Typography>
          <Grid2 container spacing={2}>
            <Grid2 size={5}>
              <Box sx={{ display: 'flex', justifyContent: 'space-evenly' }}>
                <Typography variant='p' className='my-2'>
                  Enter Country Name :
                </Typography>
              </Box>
            </Grid2>
            <Grid2 size={7}>
              <TextField
                fullWidth
                id='country'
                placeholder=''
                onChange={e => setCountry(e.target.value)}
                value={country}
                required={true}
                error={errorCountry.isError}
                helperText={errorCountry.isError ? errorCountry.message : ''}
              />
            </Grid2>
          </Grid2>
          <Grid2 container spacing={2}>
            <Grid2 size={5}>
              <Box sx={{ display: 'flex', justifyContent: 'space-evenly' }}>
                <Typography variant='p'>Code Structure :</Typography>
              </Box>
            </Grid2>
            <Grid2 size={7}>
              <TextField
                fullWidth
                id='url'
                multiline
                placeholder=''
                value={codeStructure.length > 0 && codeStructure.join('') || ''}
                required={true}
                disabled={true}
              />
            </Grid2>
          </Grid2>
          {
            urlMakerData.map((item, index) => (
              <Grid2 container spacing={2} key={index}>
                <Grid2 size={5}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-evenly' }}>
                    <Typography variant='p' className='my-2'>
                      {item.label} :
                    </Typography>
                  </Box>
                </Grid2>
                <Grid2 size={7}>
                  <FormGroup row={true}>
                    {console.log(codeStructure)}
                    {
                      item.options.map((option, index) => (
                        <Grid2 size={'auto'} key={index}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                value={option.value}
                                checked={option.checked}
                                onChange={(e) => handleCheckboxChange(e.target.value, item.label, option.label, option.checked)}
                                name={option.label}
                              />
                            }
                            label={option.label}
                          />
                        </Grid2>
                      ))
                    }

                  </FormGroup>
                </Grid2>
              </Grid2>
            ))
          }

          <Grid2 container spacing={2}>
            <Grid2 size={5}>
              <Box sx={{ display: 'flex', justifyContent: 'space-evenly' }}>
                <Typography variant='p'>Separator :</Typography>
              </Box>
            </Grid2>
            <Grid2 container size={7}>
              <Grid2>
                <Button onClick={() => setCodeStructure([...codeStructure, '/'])}>{'/'}</Button>
              </Grid2>
            </Grid2>
          </Grid2>
          <Grid2 container spacing={2}>
            <Grid2 size={5}>
              <Box sx={{ display: 'flex', justifyContent: 'space-evenly' }}>
                <Typography variant='p'>Special Character :</Typography>
              </Box>
            </Grid2>
            <Grid2 container size={7}>
              <Grid2>
                <Button onClick={() => setCodeStructure([...codeStructure, '<FNC>'])}>{'<FNC>'}</Button>
              </Grid2>
            </Grid2>
          </Grid2>
          {console.log(crmURL)}
          {crmURL.value != '' && <Grid2 container spacing={2}>
            <Grid2 size={5}>
              <Box sx={{ display: 'flex', justifyContent: 'space-evenly' }}>
                <Typography variant='p'>CRM URL :</Typography>
              </Box>
            </Grid2>

            <Grid2 container size={7}>
              <FormGroup row={true}>
                <Grid2 size={'auto'} >
                  <FormControlLabel
                    control={
                      <Checkbox
                        value={"CRMURL"}
                        checked={crmURL.checked}
                        onChange={handleCRMURLChange}
                        name={"CRM URL"}
                      />
                    }
                    label={"CRMURL"}
                  />
                </Grid2>
              </FormGroup>
            </Grid2>
          </Grid2>}


          <Grid2 item xs={12} className='my-3 '>
            <Button variant='contained' sx={{ marginRight: 3.5 }} onClick={handleSubmitForm}>
              Save Changes
            </Button>
            <Button type='reset' variant='outlined' color='primary' onClick={editData?.id ? resetEditForm : resetForm}>
              Reset
            </Button>
            <Button variant='outlined' color='error' sx={{ marginLeft: 3.5 }} onClick={() => handleCloseModal()}>
              Close
            </Button>
          </Grid2>
        </Box>
      </Modal>
      <AccessibilitySettings />
      <ChatbotComponent />
    </Box>
  )
}

export default Index
