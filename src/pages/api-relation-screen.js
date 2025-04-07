/* eslint-disable no-undef */
'use-client'
import React, { useState, useEffect, useCallback, useMemo } from 'react'
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
  const [apis, setApis] = useState([])
  const [allApis, setAllApis] = useState([])
  const [screens, setScreens] = useState([])
  const [allScreens, setAllScreens] = useState([])
  const [filterApiVal, setFilterApiVal] = useState('')
  const [filterScreenVal, setFilterScreenVal] = useState('')
  const [relations, setRelations] = useState([])
  const [allRelation, setAllRelation] = useState([])
  const { setIsLoading } = useLoading()
  const [alertData, setAlertData] = useState({ type: '', message: '', variant: 'filled', openSnackbar: false })
  const [selectedValue, setSelectedValue] = useState(null)
  const [selectedScreenValue, setSelectedScreenValue] = useState(null)
  const { removeAuthToken } = useAuth()
  const { settings } = useSettings()

  const router = useRouter()
  useEffect(() => {
    getAPIsList()
    getScreensList()
    getApiScreenRelation()
    return () => {}
  }, [])
  useMemo(() => {
    const filteredScreen = allScreens.filter(screen =>
      screen.screen_name.toLowerCase().includes(filterScreenVal.toLowerCase())
    )
    console.log('Filtered screen ', filteredScreen, filterScreenVal)
    setScreens(filteredScreen)
    return () => {}
  }, [filterScreenVal])
  useMemo(() => {
    const filteredApis = allApis.filter(api => api.name.toLowerCase().includes(filterApiVal.toLowerCase()))
    setApis(filteredApis)
    return () => {}
  }, [filterApiVal])
  const getScreensList = async () => {
    try {
      setIsLoading(true)
      const res = await api('/register-screen', {}, 'get', true)
      if (res.data.success) {
        setScreens(res.data.data)
        setAllScreens(res.data.data)
      } else if (res.data.code === 401) {
        removeAuthToken()
        router.push('/401')
      } else {
        console.log('Error: Unexpected response', res.data)
      }
      setIsLoading(false)
      console.log('All screens ', res.data)
    } catch (error) {
      console.log('Error in get screens ', error)
    }
  }
  const getAPIsList = async () => {
    try {
      setIsLoading(true)
      const res = await api('/register-api', {}, 'get', true)
      if (res.data.success) {
        setApis(res.data.data)
        setAllApis(res.data.data)
      } else if (res.data.code === 401) {
        removeAuthToken()
        router.push('/401')
      } else {
        console.log('Error: Unexpected response', res.data)
      }
      setIsLoading(false)
      console.log('All apis ', res.data)
    } catch (error) {
      console.log('Error in get apis ', error)
    }
  }
  const getApiScreenRelation = async () => {
    try {
      setIsLoading(true)
      const res = await api('/api-screen-relations', {}, 'get', true)
      if (res.data.success) {
        setRelations(res.data.data)
        setAllRelation(res.data.data)
      } else if (res.data.code === 401) {
        removeAuthToken()
        router.push('/401')
      } else {
        console.log('Error: Unexpected response', res.data)
      }
      setIsLoading(false)
      console.log('All api-screen relation', res.data)
    } catch (error) {
      console.log('Error in get api screen relation ', error)
    }
  }
  const handleCheckboxChange = useCallback((apiId, screenId) => {
    setRelations(prevRelations => {
      const exists = prevRelations.some(rel => rel.api_id === apiId && rel.screen_id === screenId)

      if (exists) {
        return prevRelations.filter(rel => !(rel.api_id === apiId && rel.screen_id === screenId))
      } else {
        return [...prevRelations, { api_id: apiId, screen_id: screenId }]
      }
    })
  }, [])
  const handleSaveChanges = async () => {
    console.log('Changes saved!')
    const getKey = r => `${r.api_id}|${r.screen_id}`

    // Create a Set of keys from allRelation for fast lookup
    const allRelationKeys = new Set(allRelation.map(getKey))
    const relationsKeys = new Set(relations.map(getKey))

    const result = {
      checked: relations.filter(r => !allRelationKeys.has(getKey(r))),
      unchecked: allRelation.filter(r => !relationsKeys.has(getKey(r)))
    }
    console.log('Unchecked array ', result)
    try {
      const token = Cookies.get('token')
      const decodedToken = jwtDecode(token)
      const config = decodedToken.config.audit_logs
      let audit_log
      if (config === true) {
        audit_log = {
          audit_log: true,
          performed_action: 'edit',
          remarks: `API - Screen privilege updated`
        }
      } else {
        audit_log = {
          audit_log: false,
          performed_action: 'none',
          remarks: `none`
        }
      }
      const res = await api(
        '/api-screen-relations',
        { audit_log, checked: result.checked, unChecked: result.unchecked },
        'post',
        true
      )
      console.log('Res of api screen relation ', res.data)
      if (res.data.success) {
        console.log('res ', res.data)
        setAlertData({
          ...alertData,
          type: 'success',
          message: 'API-Screen relation updated successfully',
          openSnackbar: true
        })
      } else if (res.data.code === 401) {
        removeAuthToken()
        router.push('/401')
      } else {
        console.log('Error: Unexpected response', res.data)
      }
    } catch (error) {
      console.log('Error in save changes ', error)
    }
  }
  const handleResetFilter = () => {
    setFilterScreenVal('')
    setFilterApiVal('')
    setScreens(allScreens)
    setApis(allApis)
    setSelectedValue(null)
    setSelectedScreenValue(null)
  }
  const closeSnackbar = () => {
    setAlertData({ ...alertData, openSnackbar: false })
  }
  const handleChange = (event, newValue) => {
    console.log('Selected Value:', newValue)
    if (newValue) {
      setSelectedValue(newValue)
      const filteredApis = allApis.filter(api => api.name.toLowerCase().includes(newValue.name.toLowerCase()))
      setApis(filteredApis)
    } else {
      handleResetFilter()
    }
  }
  const handleScreenChange = (event, newValue) => {
    console.log('Selected Value:', newValue)
    if (newValue) {
      setSelectedScreenValue(newValue)
      const filteredScreen = allScreens.filter(screen =>
        screen.screen_name.toLowerCase().includes(newValue.screen_name.toLowerCase())
      )
      setScreens(filteredScreen)
    } else {
      handleResetFilter()
    }
  }
  return (
    <Box padding={4}>
      <Head>
        <title> API - Screen Relation </title>
      </Head>
      <Grid2 item xs={12}>
        <Typography variant='h2'>API Relation Screen</Typography>
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
                      options={allScreens}
                      getOptionLabel={screen => screen.screen_name}
                      value={selectedScreenValue}
                      onChange={handleScreenChange}
                      renderInput={params => <TextField {...params} label='Search Screen' />}
                    />
                  </FormControl>
                </Box>
                <Box className='mx-2 w-25'>
                  <FormControl className='w-100 mx-3 my-3'>
                    <Autocomplete
                      id='tags-standard'
                      options={allApis}
                      getOptionLabel={api => api.name}
                      value={selectedValue}
                      onChange={handleChange}
                      renderInput={params => <TextField {...params} label='Search API' />}
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
                API-Screen Relation Data
              </Typography>
              {screens.length === 0 ? (
                <Typography variant='body1' align='center' style={{ marginTop: '20px' }}>
                  No data available
                </Typography>
              ) : (
                <TableContainer component={Paper} style={{ maxHeight: '800px', overflowY: 'auto' }}>
                  <Table aria-label='checkbox table'>
                    <TableHead style={{ position: 'sticky', top: 0, zIndex: 3 }}>
                      <TableRow>
                        <TableCell
                          style={{
                            position: 'sticky',
                            left: 0,
                            top: 0,
                            zIndex: 3,
                            borderBottom: '1px solid #fff',
                            backgroundColor: '#fff'
                          }}
                        ></TableCell>
                        {screens.map((screen, index) => (
                          <TableCell
                            key={`master-${index + 1}`}
                            align='center'
                            style={{
                              borderBottom: '1px solid rgba(224, 224, 224, 1)',
                              backgroundColor: '#fff',
                              zIndex: 2
                            }}
                          >
                            {screen.screen_name}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {apis.map((api, apiIndex) => (
                        <TableRow key={`row-${apiIndex + 1}`}>
                          <TableCell
                            style={{
                              position: 'sticky',
                              left: 0,
                              overflow: 'hidden',
                              background: '#fff',
                              zIndex: 1,
                              fontWeight: 600,
                              borderBottom: '1px solid rgba(224, 224, 224, 1)'
                            }}
                          >
                            {api.name}
                          </TableCell>
                          {screens.map((screen, screenIndex) => (
                            <TableCell
                              key={`${apiIndex}-${screenIndex}`}
                              align='center'
                              style={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
                            >
                              <Checkbox
                                key={`${apiIndex}-${screenIndex}`}
                                checked={
                                  relations.findIndex(item => item.api_id === api.id && item.screen_id === screen.id) >
                                  -1
                                }
                                onChange={() => handleCheckboxChange(api.id, screen.id)}
                              />
                            </TableCell>
                          ))}
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
      <SnackbarAlert openSnackbar={alertData?.openSnackbar} closeSnackbar={closeSnackbar} alertData={alertData} />
      <AccessibilitySettings />
      <ChatbotComponent />
    </Box>
  )
}
export async function getServerSideProps(context) {
  return validateToken(context, 'API-Screen Relation')
}
export default ProtectedRoute(Index)
