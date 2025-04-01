'use-client'
import React, { useState, useEffect, useCallback } from 'react'
import Checkbox from '@mui/material/Checkbox'
import TableContainer from '@mui/material/TableContainer'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import Paper from '@mui/material/Paper'
import { Grid2, Typography, Button, Box, FormControl, TextField, Autocomplete } from '@mui/material'
import Head from 'next/head'
import { api } from 'src/utils/Rest-API'
import { useLoading } from 'src/@core/hooks/useLoading'
import SnackbarAlert from 'src/components/SnackbarAlert'
import ProtectedRoute from '../../components/ProtectedRoute'
import { useRouter } from 'next/router'
import { useAuth } from 'src/Context/AuthContext'
import { jwtDecode } from 'jwt-decode'
import ChatbotComponent from 'src/components/ChatbotComponent'
import AccessibilitySettings from 'src/components/AccessibilitySettings'
import Cookies from 'js-cookie'
import { validateToken } from 'src/utils/ValidateToken'
import { useSettings } from 'src/@core/hooks/useSettings'

const Index = () => {
  const router = useRouter()
  const [checkboxes, setCheckboxes] = useState([])
  const [allCheckboxes, setAllCheckboxes] = useState([])
  const [filteredDepartments, setFilteredDepartments] = useState([])
  const [departments, setDepartments] = useState([])
  const { setIsLoading } = useLoading()
  const [alertData, setAlertData] = useState({ type: '', message: '', variant: 'filled',openSnackbar:false })
  const [selectScreenName, setSelectScreenName] = useState(null)
  const [selectedDeptValue, setSelectedDeptValue] = useState(null)
  const { removeAuthToken } = useAuth()
  const { settings } = useSettings()

  useEffect(() => {
    getDesignationDepartmentWise()
    getScreenPrivilige()
    return () => {}
  }, [])
  const getDesignationDepartmentWise = async () => {
    try {
      setIsLoading(true)
      const res = await api('/designation/designationByDeps/', {}, 'get', true)
      console.log('All deps ', res.data.data)
      if (res.data.success) {
        setDepartments(res.data.data.departments)
        setFilteredDepartments(res.data.data.departments)
      } else if (res.data.code === 401) {
        removeAuthToken()
        router.push('/401')
      }
      setIsLoading(false)
    } catch (error) {
      console.log('Error in get screens ', error)
    }
  }
  const getScreenPrivilige = async () => {
    try {
      setIsLoading(true)
      const res = await api('/feature/screen-access/', {}, 'get', true)
      setIsLoading(false)
      console.log('All screen-access ', res.data)
      if (res.data.success) {
        const data = res.data.data.filter(
          item =>
            ![
              'Super Admin',
              'API Privilege',
              'Screen Privilege',
              'API-Screen Relation',
              'SuperAdmin Configuration'
            ].includes(item.screenName)
        )
        setCheckboxes(data)
        setAllCheckboxes(data)
      } else if (res.data.code === 401) {
        removeAuthToken()
        router.push('/401')
      }
    } catch (error) {
      console.log('Error in get screen-access ', error)
    }
  }
  const handleCheckboxChange = useCallback((groupIndex, checkboxIndex) => {
    setCheckboxes(prevGroups => {
      const updatedGroups = [...prevGroups]
      const currentGroup = updatedGroups[groupIndex]
      const updatedCheckboxes = currentGroup.checkboxes.map((checkbox, index) =>
        index === checkboxIndex ? { ...checkbox, checked: !checkbox.checked } : checkbox
      )

      // Only update selectAll if the checkboxes have changed
      const allChecked = updatedCheckboxes.every(cb => cb.checked)

      if (currentGroup.selectAll !== allChecked) {
        updatedGroups[groupIndex] = {
          ...currentGroup,
          checkboxes: updatedCheckboxes,
          selectAll: allChecked
        }
      } else {
        updatedGroups[groupIndex] = { ...currentGroup, checkboxes: updatedCheckboxes }
      }

      return updatedGroups
    })
  }, [])
  const handleSaveChanges = () => {
    console.log('Changes saved!')
    console.log('checkboxes ', allCheckboxes)
    let onlyChecked = []
    checkboxes.forEach(item => {
      item.checkboxes.forEach(row => {
        if (row.checked) {
          onlyChecked.push({
            screenId: item.id,
            designationId: row.designation_id,
            departmentId: row.department_id,
            checked: row.checked
          })
        }
      })
    })
    console.log('Checked data ', onlyChecked)
    const screenIdsByDesignation = groupByDesignation(onlyChecked)
    console.log('Final data ', screenIdsByDesignation)
    saveChanges(screenIdsByDesignation)
  }
  const saveChanges = async screenIdsByDesignation => {
    try {
      const token = Cookies.get('token')
      const decodedToken = jwtDecode(token)
      const config = decodedToken.config.audit_logs
      let audit_log
      if (config === true) {
        audit_log = {
          audit_log: true,
          performed_action: 'edit',
          remarks: `Screen privilege updated`
        }
      } else {
        audit_log = {
          audit_log: false,
          performed_action: 'none',
          remarks: `none`
        }
      }
      setIsLoading(true)
      const res = await api('/feature/screen-access/', { audit_log, screenIdsByDesignation }, 'put', true)
      setIsLoading(false)
      console.log('All screens after update ', res.data)
      if (res.data.success) {
        setAlertData({ ...alertData, type: 'success', message: 'Screen feature updated successfully',openSnackbar:true })
      } else if (res.data.code === 401) {
        removeAuthToken()
        router.push('/401')
      }
    } catch (error) {
      setIsLoading(false)
      console.log('Error in get screens ', error)
    }
  }
  const groupByDesignation = items => {
    return items.reduce((acc, item) => {
      const { designationId } = item
      if (!acc[designationId]) {
        acc[designationId] = []
      }
      acc[designationId].push(item.screenId)
      return acc
    }, {})
  }
  const closeSnackbar = () => {
    setAlertData({type: '', message: '', variant: 'filled',openSnackbar:false})
  }
  const handleResetFilter = () => {
    setSelectScreenName(null)
    setSelectedDeptValue(null)
    setCheckboxes(allCheckboxes)
    setFilteredDepartments(departments)
  }
  const handleScreenName = (event, newValue) => {
    console.log('Selected Value:', newValue)
    if (newValue) {
      setCheckboxes(
        allCheckboxes.filter(checkboxRow =>
          checkboxRow.screenName.toLowerCase().includes(newValue.screenName.toLowerCase())
        )
      )
      setSelectScreenName(newValue)
    } else {
      handleResetFilter()
    }
  }
  const handleDeptChange = (event, newValue) => {
    console.log('Selected Value:', newValue)
    if (newValue) {
      setFilteredDepartments(
        departments.filter(dept => dept.department.toLowerCase().includes(newValue.department.toLowerCase()))
      )
      setSelectedDeptValue(newValue)
    } else {
      handleResetFilter()
    }
  }
  return (
    <Box padding={4}>
      <Head>
        <title>Screen Privilege</title>
      </Head>
      <Grid2 item xs={12}>
        <Typography variant='h2'>Screen Privilege</Typography>
      </Grid2>
      <Grid2 item xs={12}>
        <Grid2 item xs={12}>
          <Box sx={{ backgroundColor: settings.mode === 'dark' ? '#212121' : 'white', borderRadius: 1 }}>
            <Typography variant='h4' className='mx-4 my-2 mx-2' sx={{ paddingTop: '1%' }}>
              Filter
            </Typography>
            <Grid2 item xs={12}>
              <Box className='d-flex  align-items-center '>
                <Box className='mx-2 w-25'>
                  <FormControl className='w-100 mx-3 my-3'>
                    <Autocomplete
                      id='tags-standard'
                      options={departments}
                      getOptionLabel={dept => dept.department}
                      value={selectedDeptValue}
                      onChange={handleDeptChange}
                      renderInput={params => <TextField {...params} label='Search Department' />}
                      placeholder='Search Department'
                    />
                  </FormControl>
                </Box>
                <Box className='mx-2 w-25'>
                  <FormControl className='w-100 mx-3 my-3'>
                    <Autocomplete
                      id='tags-standard'
                      options={allCheckboxes}
                      getOptionLabel={item => item.screenName}
                      value={selectScreenName}
                      onChange={handleScreenName}
                      renderInput={params => <TextField {...params} label='Search Screen' />}
                      placeholder='Search Screen'
                    />
                  </FormControl>
                </Box>
              </Box>
              <Box className='mx-4'>
                <Button variant='contained' sx={{ display: 'inline-flex' }} onClick={handleResetFilter}>
                  Reset
                </Button>
                <Button variant='contained' sx={{ display: 'inline-flex', ml: 4 }} onClick={handleSaveChanges}>
                  Save Changes
                </Button>
              </Box>
              <Typography variant='h4' className='mx-4 my-5 mt-3 mb-5'>
                Screen Privilege Data
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
                        <TableCell style={{ borderBottom: '1px solid #fff' }}></TableCell>
                        <TableCell style={{ borderBottom: '1px solid #fff' }}></TableCell>
                        <TableCell style={{ borderBottom: '1px solid #fff' }}></TableCell>
                        {filteredDepartments?.map((dept, rowIndex) => (
                          <TableCell
                            key={`dept-${rowIndex + 1}`}
                            colSpan={dept.designations.length}
                            align='center'
                            style={{
                              borderBottom: '1px solid rgba(224, 224, 224, 1)'
                            }}
                          >
                            {dept.department}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell style={{ borderBottom: '0.5px solid rgba(224, 224, 224, 1)' }}></TableCell>
                        <TableCell style={{ borderBottom: '0.5px solid rgba(224, 224, 224, 1)' }}></TableCell>
                        <TableCell style={{ borderBottom: '0.5px solid rgba(224, 224, 224, 1)' }}></TableCell>
                        {filteredDepartments?.map((dept, rowIndex) =>
                          dept.designations.map((designation, colIndex) => (
                            <TableCell
                              key={`${rowIndex}-${colIndex}`}
                              align='center'
                              style={{
                                borderBottom: '1px solid rgba(224, 224, 224, 1)'
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
                              borderBottom: '1px solid rgba(224, 224, 224, 1)'
                            }}
                          ></TableCell>
                          <TableCell
                            style={{
                              fontWeight: '600',
                              borderBottom: '1px solid rgba(224, 224, 224, 1)',
                              borderTop: '1px solid rgba(224, 224, 224, 1)',
                              position: 'sticky',
                              left: 0,
                              top: '80px',
                              zIndex: 2
                            }}
                          >
                            {checkboxRow.screenName}
                          </TableCell>
                          <TableCell
                            style={{
                              borderBottom: '1px solid rgba(224, 224, 224, 1)'
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
                                  style={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
                                >
                                  <Checkbox
                                    role='checkbox'
                                    aria-checked={checkbox.checked}
                                    data-testid={`${checkboxRow.screenName}-${checkbox.designation_id}`}
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
      <SnackbarAlert openSnackbar={alertData.openSnackbar} closeSnackbar={closeSnackbar} alertData={alertData} />
      <AccessibilitySettings />
      <ChatbotComponent />
    </Box>
  )
}
export async function getServerSideProps(context) {
  return validateToken(context, 'Screen Privilege')
}
export default ProtectedRoute(Index)
