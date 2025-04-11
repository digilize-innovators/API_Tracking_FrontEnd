'use-client'
import React, { useState, useEffect } from 'react'
import {
  Grid2,
  Typography,
  Button,
  Box,
  FormControl,
  TextField,
  Autocomplete,
  Checkbox,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper
} from '@mui/material'
import Head from 'next/head'
import { api } from 'src/utils/Rest-API'
import { useLoading } from 'src/@core/hooks/useLoading'
import SnackbarAlert from 'src/components/SnackbarAlert'
import ProtectedRoute from 'src/components/ProtectedRoute'
import { useAuth } from 'src/Context/AuthContext'
import { useRouter } from 'next/router'
import { jwtDecode } from 'jwt-decode'
import ChatbotComponent from 'src/components/ChatbotComponent'
import AccessibilitySettings from 'src/components/AccessibilitySettings'
import Cookies from 'js-cookie'
import { validateToken } from 'src/utils/ValidateToken'
import { useSettings } from 'src/@core/hooks/useSettings'

const Index = () => {
  const [checkboxes, setCheckboxes] = useState([])
  const [allCheckboxes, setAllCheckboxes] = useState([])
  const [filteredDepartments, setFilteredDepartments] = useState([])
  const [departments, setDepartments] = useState([])
  const { setIsLoading } = useLoading()
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [alertData, setAlertData] = useState({ type: '', message: '', variant: 'filled' })
  const [selectedApiName, setSelectedApiName] = useState(null)
  const [selectedDeptValue, setSelectedDeptValue] = useState(null)
  const { removeAuthToken } = useAuth()
  const { settings } = useSettings()

  const router = useRouter()
  useEffect(() => {
    getDesignationDepartmentWise()
    getAPIPrivilige()
    return () => {}
  }, [])
  const getDesignationDepartmentWise = async () => {
    try {
      setIsLoading(true)
      const res = await api('/designation/designationByDeps/', {}, 'get', true)
      if (res.data.success) {
        setDepartments(res.data.data.departments)
        setFilteredDepartments(res.data.data.departments)
      } else if (res.data.code === 401) {
        removeAuthToken()
        router.push('/401')
      } else {
        console.log('Error: Unexpected response', res.data)
      }
      setIsLoading(false)
      console.log('All deps ', res.data.data)
    } catch (error) {
      console.log('Error in get apis ', error)
    }
  }
  const getAPIPrivilige = async () => {
    try {
      setIsLoading(true)
      const res = await api('/feature/api-access/', {}, 'get', true)
      if (res.data.success) {
        setCheckboxes(res.data.data)
        setAllCheckboxes(res.data.data)
      } else if (res.data.code === 401) {
        removeAuthToken()
        router.push('/401')
      } else {
        console.log('Error: Unexpected response', res.data)
      }
      setIsLoading(false)
      console.log('All api-access ', res.data)
    } catch (error) {
      console.log('Error in get api-access ', error)
    }
  }
  const handleCheckboxChange = (masterIndex, innerIndex) => {
    setCheckboxes(prevCheckboxes => {
      const updatedCheckboxes = [...prevCheckboxes]
      updatedCheckboxes[masterIndex].checkboxes[innerIndex].checked =
        !updatedCheckboxes[masterIndex].checkboxes[innerIndex].checked
      return updatedCheckboxes
    })
  }
  const handleSaveChanges = () => {
    console.log('Changes saved!')
    console.log('checkboxes ', allCheckboxes)
    let onlyChecked = []
    allCheckboxes.forEach(item => {
      item.checkboxes.forEach(row => {
        if (row.checked) {
          onlyChecked.push({
            apiId: item.id,
            designationId: row.designation_id,
            departmentId: row.department_id,
            checked: row.checked
          })
        }
      })
    })
    console.log('Checked data ', onlyChecked)
    const apiIdsByDesignation = groupByDesignation(onlyChecked)
    console.log('Final data ', apiIdsByDesignation)
    saveChanges(apiIdsByDesignation)
  }
  const saveChanges = async apiIdsByDesignation => {
    try {
      const token = Cookies.get('token')
      const decodedToken = jwtDecode(token)
      const config = decodedToken.config.audit_logs
      let audit_log
      if (config === true) {
        audit_log = {
          audit_log: true,
          performed_action: 'edit',
          remarks: `API privilege updated`
        }
      } else {
        audit_log = {
          audit_log: false,
          performed_action: 'none',
          remarks: `none`
        }
      }
      setIsLoading(true)
      const res = await api('/feature/api-access/', { audit_log, apiIdsByDesignation }, 'put', true)
      if (res.data.success) {
        setOpenSnackbar(true)
        setAlertData({ ...alertData, type: 'success', message: 'API feature updated successfully' })
      } else if (res.data.code === 401) {
        removeAuthToken()
        router.push('/401')
      } else {
        console.log('Error: Unexpected response', res.data)
      }
      setIsLoading(false)
      console.log('All apis ', res.data)
    } catch (error) {
      setIsLoading(false)
      console.log('Error in get apis ', error)
    }
  }
  const groupByDesignation = items => {
    return items.reduce((acc, item) => {
      const { designationId } = item
      if (!acc[designationId]) {
        acc[designationId] = []
      }
      acc[designationId].push(item.apiId)
      return acc
    }, {})
  }
  const closeSnackbar = () => {
    setOpenSnackbar(false)
  }
  const handleResetFilter = () => {
    setSelectedDeptValue(null)
    setSelectedApiName(null)
    setCheckboxes(allCheckboxes)
    setFilteredDepartments(departments)
  }
  const handleApiName = (event, newValue) => {
    console.log('Selected Value:', newValue)
    if (newValue) {
      setCheckboxes(
        allCheckboxes.filter(checkboxRow =>
          checkboxRow.apiName.toLowerCase().includes(newValue?.apiName?.toLowerCase())
        )
      )
      setSelectedApiName(newValue)
    } else {
      handleResetFilter()
    }
  }
  const handleDeptChange = (event, newValue) => {
    console.log('Selected Value:', newValue)
    if (newValue) {
      setFilteredDepartments(
        departments.filter(dept => dept.department.toLowerCase()==newValue?.department?.toLowerCase())
      )
      setSelectedDeptValue(newValue)
    } else {
      handleResetFilter()
    }
  }
  return (
    <Box padding={4}>
      <Head>
        <title>API Privilege</title>
      </Head>
      <Grid2 item xs={12}>
        <Typography variant='h2'>API Privilege</Typography>
      </Grid2>
      <Grid2 item xs={12}>
        <Grid2 item xs={12}>
          <Box sx={{ backgroundColor: settings.mode === 'dark' ? '#212121' : 'white', borderRadius: 1 }}>
            <Typography variant='h4' className='mx-4 my-2 mx-2' sx={{ paddingTop: '1%' }}>
              Filter
            </Typography>
            <Grid2 item xs={12}>
              <Box className='d-flex  align-items-center'>
                <Box className='mx-2 w-25'>
                  <FormControl className='w-100 mx-3 my-3'>
                    <Autocomplete
                      id='tags-standard'
                      options={departments}
                      getOptionLabel={dept => dept.department}
                      value={selectedDeptValue}
                      onChange={handleDeptChange}
                      placeholder='Search Department'
                      renderInput={params => <TextField {...params} label='Search Department' />}
                    />
                  </FormControl>
                </Box>
                <Box className='mx-2 w-25'>
                  <FormControl className='w-100 mx-3 my-3'>
                    <Autocomplete
                      id='tags-standard'
                      options={allCheckboxes}
                      getOptionLabel={item => item.apiName}
                      value={selectedApiName}
                      onChange={handleApiName}
                      placeholder='Search API'
                      renderInput={params => <TextField {...params} label='Search API' />}
                    />
                  </FormControl>
                </Box>
              </Box>
              <Box className='mx-4'>
                <Button variant='contained' sx={{ display: 'inline-flex' }} onClick={handleResetFilter}>
                  Reset
                </Button>
                <Button
                  variant='contained'
                  sx={{ display: 'inline-flex', ml: 4 }}
                  onClick={handleSaveChanges}
                  role='button'
                >
                  Save Changes
                </Button>
              </Box>
              <Typography variant='h4' className='mx-4 my-5 mt-3 mb-5'>
                API Privilege Data
              </Typography>
              {filteredDepartments?.length === 0 ? (
                <Typography variant='body1' align='center' style={{ marginTop: '20px' }}>
                  No department and designation available
                </Typography>
              ) : (
                <TableContainer component={Paper}>
                  <Table aria-label='checkbox table'>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          style={{
                            borderBottom: '1px solid #fff',
                            position: 'sticky',
                            left: 0,
                            zIndex: 3,
                            backgroundColor: 'white',
                            width: '50px',
                            minWidth: '50px',
                            maxWidth: '50px',
                            height: '56px', // Fixed height for consistent sizing
                            padding: '8px' // Consistent padding
                          }}
                        ></TableCell>
                        <TableCell
                          style={{
                            borderBottom: '1px solid #fff',
                            borderLeft: '1px solid #fff',
                            position: 'sticky',
                            left: '50px',
                            zIndex: 3,
                            backgroundColor: 'white',
                            width: '200px',
                            minWidth: '200px',
                            maxWidth: '200px',
                            height: '56px',
                            padding: '8px'
                          }}
                        ></TableCell>
                        <TableCell
                          style={{
                            borderBottom: '1px solid #fff',
                            height: '56px',
                            padding: '8px'
                          }}
                        ></TableCell>
                        {filteredDepartments?.map(({ department, designations }, rowIndex) => {
                          if (!designations.length) return null

                          return (
                            <TableCell
                              key={`dept-${rowIndex + 1}`}
                              colSpan={designations.length}
                              align='center'
                              sx={{
                                borderBottom: '1px solid rgba(224, 224, 224, 1)',
                                borderLeft: '1px solid rgba(224, 224, 224, 1)',
                                borderRight: '1px solid rgba(224, 224, 224, 1)',

                                
                                height: 56,
                                p: 1,
                              }}
                            >
                              {department}
                            </TableCell>
                          )
                        })}
                      </TableRow>
                      <TableRow>
                        <TableCell
                          style={{
                            borderBottom: '0.5px solid rgba(224, 224, 224, 1)',
                            position: 'sticky',
                            left: 0,
                            zIndex: 3,
                            backgroundColor: 'white',
                            width: '50px',
                            minWidth: '50px',
                            maxWidth: '50px',
                            height: '56px',
                            padding: '8px'
                          }}
                        ></TableCell>
                        <TableCell
                          style={{
                            borderBottom: '0.5px solid rgba(224, 224, 224, 1)',
                            position: 'sticky',
                            left: '50px',
                            zIndex: 3,
                            backgroundColor: 'white',
                            width: '200px',
                            minWidth: '200px',
                            maxWidth: '200px',
                            height: '56px',
                            padding: '8px'
                          }}
                        ></TableCell>
                        <TableCell
                          style={{
                            borderBottom: '0.5px solid rgba(224, 224, 224, 1)',
                            height: '56px',
                            padding: '8px'
                          }}
                        ></TableCell>
                        {filteredDepartments?.map((dept, rowIndex) =>
                          dept.designations.map((designation, colIndex) => (
                            <TableCell
                              key={`${rowIndex}-${colIndex}`}
                              align='center'
                              style={{
                                border: '1px solid rgba(224, 224, 224, 1)',
                                
                                height: '56px',
                                padding: '8px',
                                minWidth: 170,
                              }}
                            >
                              {designation.designation_name}
                            </TableCell>
                          ))
                        )}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {checkboxes.map((checkboxRow, index) => (
                        <TableRow key={`row-${index + 1}`}>
                          <TableCell
                            style={{
                              borderBottom: '1px solid rgba(224, 224, 224, 1)',
                              position: 'sticky',
                              left: 0,
                              zIndex: 2,
                              backgroundColor: 'white',
                              width: '50px',
                              minWidth: '50px',
                              maxWidth: '50px',
                              height: '56px',
                              padding: '8px'
                            }}
                          ></TableCell>
                          <TableCell
                            style={{
                              fontWeight: '600',
                              borderBottom: '1px solid rgba(224, 224, 224, 1)',
                              borderTop: index === 0 ? '1px solid rgba(224, 224, 224, 1)' : 'none',
                              position: 'sticky',
                              left: '50px',
                              zIndex: 2,
                              backgroundColor: 'white',
                              width: '250px',
                              minWidth: '250px',
                              maxWidth: '250px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              // textAlign:'center',
                              height: '56px',
                              padding: '8px',
                              verticalAlign: 'middle' // Center content vertically
                            }}
                          >
                            {checkboxRow.apiName}
                          </TableCell>
                          <TableCell
                            style={{
                              borderBottom: '1px solid rgba(224, 224, 224, 1)',
                              height: '56px',
                              padding: '8px'
                            }}
                          ></TableCell>
                          {checkboxRow.checkboxes.map((checkbox, colIndex) => {
                            const shouldDisplay =
                              selectedDeptValue === null || selectedDeptValue?.department_id == checkbox.department_id
                            return (
                              shouldDisplay && (
                                <TableCell
                                  key={`${index}-${colIndex}`}
                                  align='center'
                                  style={{
                                    borderBottom: '1px solid rgba(224, 224, 224, 1)',
                                    height: '56px',
                                    padding: '8px',
                                    verticalAlign: 'middle'
                                  }}
                                >
                                  <Checkbox
                                    inputProps={{ 'data-testid': `${checkboxRow.apiName}-${checkbox.designation_id}` }}
                                    checked={checkbox.checked}
                                    onChange={() => handleCheckboxChange(index, colIndex)}
                                  />
                                </TableCell>
                              )
                            )
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Grid2>
          </Box>
        </Grid2>
      </Grid2>
      <SnackbarAlert openSnackbar={openSnackbar} closeSnackbar={closeSnackbar} alertData={alertData} />
      <AccessibilitySettings />
      <ChatbotComponent />
    </Box>
  )
}
export async function getServerSideProps(context) {
  return validateToken(context, 'API Privilege')
}
export default ProtectedRoute(Index)