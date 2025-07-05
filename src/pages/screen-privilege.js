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
import ProtectedRoute from '../components/ProtectedRoute'
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
  const [alertData, setAlertData] = useState({ type: '', message: '', variant: 'filled', openSnackbar: false })
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
        setAlertData({
          ...alertData,
          type: 'success',
          message: 'Screen feature updated successfully',
          openSnackbar: true
        })
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
    setAlertData({ type: '', message: '', variant: 'filled', openSnackbar: false })
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
        departments.filter(dept => dept.department.toLowerCase() === newValue.department.toLowerCase())
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
                <TableContainer
                  component={Paper}
                  style={{
                    maxHeight: '800px', // Original height
                    overflowY: 'auto',
                    backgroundColor: 'inherit'
                  }}
                >
                  <Table
                    aria-label='checkbox table'
                    style={{
                      borderCollapse: 'separate' // Crucial for distinct borders with sticky elements, keep this.
                    }}
                  >
                    <TableHead
                      style={{
                        backgroundColor: 'white', // Must be solid to cover content underneath
                        position: 'sticky',
                        top: 0,
                        zIndex: 4, // Ensures header is on top
                        // Subtler box-shadow for visual separation without being too prominent
                        boxShadow:
                          '0px 1px 2px -1px rgba(0,0,0,0.1), 0px 2px 3px 0px rgba(0,0,0,0.01), 0px 0.5px 5px 0px rgba(0,0,0,0.01)'
                      }}
                    >
                      <TableRow>
                        {/* First Sticky Cell (Checkbox Column) - Header Row 1 */}
                        <TableCell
                          style={{
                            // borderBottom: '1px solid rgba(224, 224, 224, 1)',
                            position: 'sticky',
                            left: 0,
                            zIndex: 3,
                            backgroundColor: 'white',
                            width: '40px', // Reduced from 50px
                            minWidth: '40px', // Reduced from 50px
                            maxWidth: '40px', // Reduced from 50px
                            height: '50px',
                            padding: '3px' // Reduced padding
                          }}
                        ></TableCell>
                        {/* Second sticky cell (apiName column) */}
                        <TableCell
                          style={{
                            // borderBottom: '1px solid rgba(224, 224, 224, 1)',
                            // borderLeft: '1px solid rgba(224, 224, 224, 1)',
                            position: 'sticky',
                            left: '30px',
                            zIndex: 3,
                            backgroundColor: 'white',
                            width: '150px', // Reduced from 200px
                            minWidth: '150px', // Reduced from 200px
                            maxWidth: '200px', // Allow a bit more if needed, but prefer smaller
                            height: '56px',
                            padding: '4px 8px',
                            fontSize: '14px', // Reduced horizontal padding
                            textAlign: 'center',
                            right: '15px'
                          }}
                        ></TableCell>
                        {/* Third non-sticky cell in header (empty) */}
                        <TableCell
                          style={{
                            borderBottom: '1px solid rgba(224, 224, 224, 1)',
                            height: '56px',
                            padding: '3px', // Reduced padding
                            width: '10px', // Give it a minimal width
                            minWidth: '10px',
                            maxWidth: '10px'
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
                                p: '4px 8px', // Reduced padding, Material-UI's p prop is for padding
                                minWidth: '100px' // Reduced from 170, adjust as needed
                              }}
                            >
                              {department}
                            </TableCell>
                          )
                        })}
                      </TableRow>

                      {/* First Sticky Cell (Checkbox Column) - Header Row 2 */}
                      <TableRow>
                        {/* First sticky cell in second header row */}
                        <TableCell
                          style={{
                            borderBottom: '0.5px solid rgba(224, 224, 224, 1)',
                            position: 'sticky',
                            left: 0,
                            zIndex: 3,
                            backgroundColor: 'white',
                            width: '30px', // Consistent with above
                            minWidth: '30px', // Consistent with above
                            maxWidth: '30px', // Consistent with above
                            height: '56px',
                            padding: '4px' // Reduced padding
                          }}
                        ></TableCell>
                        {/* Second sticky cell in second header row */}
                        <TableCell
                          style={{
                            borderBottom: '0.5px solid rgba(224, 224, 224, 1)',
                            position: 'sticky',
                            left: '30px', // Adjusted left position
                            zIndex: 3,
                            backgroundColor: 'white',
                            width: '150px', // Consistent with above
                            minWidth: '150px', // Consistent with above
                            maxWidth: '200px', // Consistent with above
                            height: '56px',
                            padding: '4px 8px', // Reduced padding
                            alignContent: 'center',
                            fontSize: '14px'
                          }}
                        ></TableCell>
                        {/* Third non-sticky cell in second header row */}
                        <TableCell
                          style={{
                            borderBottom: '0.5px solid rgba(224, 224, 224, 1)',
                            height: '56px',
                            padding: '4px', // Reduced padding
                            width: '10px', // Consistent with above
                            minWidth: '10px',
                            maxWidth: '10px'
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
                                padding: '4px 8px', // Reduced padding
                                minWidth: '100px', // Significantly reduced for individual designation cells
                                maxWidth: '100px', // Added maxWidth to constrain
                                whiteSpace: 'nowrap', // Keep text on one line
                                overflow: 'hidden', // Hide overflowing text
                                textOverflow: 'ellipsis' // Show ellipsis for truncated text
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
                        <TableRow
                          key={`row-${index + 1}`}
                          style={{
                            backgroundColor: 'inherit' // Ensures row itself doesn't obscure
                          }}
                        >
                          {/* First Sticky Cell (Checkbox Column) - Body */}
                          <TableCell
                            style={{
                              borderBottom: '1px solid rgba(224, 224, 224, 1)',
                              position: 'sticky',
                              left: 0,
                              zIndex: 2,
                              backgroundColor: 'white',
                              width: '40px', // Consistent with header
                              minWidth: '40px', // Consistent with header
                              maxWidth: '40px', // Consistent with header
                              height: '50px',
                              padding: '3px' // Reduced padding
                            }}
                          ></TableCell>
                          {/* Sticky second column cell (apiName) */}
                          <TableCell
                            style={{
                              fontWeight: '600',
                              borderBottom: '1px solid rgba(224, 224, 224, 1)',
                              borderTop: index === 0 ? '1px solid rgba(224, 224, 224, 1)' : 'none',
                              position: 'sticky',
                              left: '30px', // Adjusted left position
                              zIndex: 2,
                              backgroundColor: 'white',
                              width: '150px', // Consistent with header
                              minWidth: '150px', // Consistent with header
                              maxWidth: '200px', // Consistent with header
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              height: '56px',
                              padding: '2px 8px', // Reduced padding
                              verticalAlign: 'middle'
                            }}
                          >
                            {checkboxRow.screenName}
                          </TableCell>
                          {/* Third Cell (Empty Spacer) - Body */}
                          <TableCell
                            style={{
                              borderBottom: '1px solid rgba(224, 224, 224, 1)',
                              height: '56px',
                              padding: '4px', // Reduced padding
                              width: '10px', // Consistent with header
                              minWidth: '10px',
                              maxWidth: '10px'
                            }}
                          ></TableCell>
                          {/* Dynamic Checkbox Cells - Body */}
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
                                    borderLeft: '1px solid rgba(224, 224, 224, 1)',
                                    height: '40px',
                                    padding: '2px 8px', // Reduced padding
                                    minWidth: '70px', // Consistent with header
                                    maxWidth: '100px', // Consistent with header
                                    verticalAlign: 'middle',
                                    backgroundColor: 'white'
                                  }}
                                >
                                  <Checkbox
                                    
                                    aria-checked={checkbox.checked}
                                    data-testid={`<span class="math-inline">checkboxRow.screenName-</span>{checkbox.designation_id}`}
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
