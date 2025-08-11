
'use-client'
import {
  Button,
  Box,
  Grid2,
  Modal,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Checkbox,
  ListItemText,
  OutlinedInput
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useLoading } from 'src/@core/hooks/useLoading'
import SnackbarAlert from 'src/components/SnackbarAlert'
import { api } from 'src/utils/Rest-API'
import { useAuth } from 'src/Context/AuthContext'
import { useRouter } from 'next/router'
import { style } from 'src/configs/generalConfig'
import { getTokenValues } from 'src/utils/tokenUtils'
import AuthModal from 'src/components/authModal'
import PropTypes from 'prop-types'


const ProjectSettings = ({ openModal, setOpenModal, projectSettingData, apiAccess, ip }) => {
  const { setIsLoading } = useLoading()
  const [alertData, setAlertData] = useState({ openSnackbar: false, type: '', message: '', variant: 'filled' })
  const [editId, setEditId] = useState(null)
  const { removeAuthToken } = useAuth()
  const router = useRouter()
  const [labels, setLabels] = useState([])
  const [settingData, setSettingData] = useState({
    label: '',
    dateFormat: '',
    noOfGroups: '',
    printPerGroup: '',
    selectedVariables: [],
    variables: [
      {
        label: 'MRP',
        value: 'MRP',
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
      },
      {
        label: 'Batch No',
        value: 'BatchNo',
        checked: false
      },
      {
        label: 'Manufacturing Date',
        value: 'ManufacturingDate',
        checked: false
      },
      {
        label: 'Expiry Date',
        value: 'ExpiryDate',
        checked: false
      },
      {
        label: 'Batch Size',
        value: 'BatchSize',
        checked: false
      },
      {
        label: 'USP',
        value: 'USP',
        checked: false
      },
      {
        label: 'Unique Code',
        value: 'UniqueCode',
        checked: false
      },
      {
        label: 'Country Code',
        value: 'CountryCode',
        checked: false
      }
    ]
  })
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [openModalApprove, setOpenModalApprove] = useState(false)
  const [approveAPI, setApproveAPI] = useState({
    approveAPIName: '',
    approveAPImethod: '',
    approveAPIEndPoint: '',
    session: '',
    authUser: {}
  })
  const [config, setConfig] = useState(null)

  useEffect(() => {
    getPrintlineSetting()
    const decodedToken = getTokenValues()
    setConfig(decodedToken)
    return () => {}
  }, [])

  const getPrintlineSetting = async () => {
    try {
      setIsLoading(true)
      const res = await api(`/printLineSetting/${projectSettingData.lineId}`, {}, 'get', true,ip,true)
      if (res.data.success && res.data.data) {
        setEditId(res.data.data.id)
        setSettingData({
          label: res.data.data.label,
          dateFormat: res.data.data.date_format,
          noOfGroups: res.data.data.no_of_groups,
          printPerGroup: res.data.data.print_per_group,
          selectedVariables: res.data.data.variables,
          variables: settingData.variables?.map(item => {
            return {
              ...item,
              checked: res.data.data.variables?.includes(item.value)
            }
          })
        })
      } else {
        setSettingData({
          ...settingData
        })
      }
      setIsLoading(false)
    } catch (error) {
      console.log('Error to get printline setting ', error)
      setIsLoading(false)
    }
  }

  const addSetting = async () => {
    const data = {
      printerLineId: projectSettingData.lineId,
      label: settingData.label,
      dateFormat: settingData.dateFormat,
      noOfGroups: settingData.noOfGroups.toString(),
      printPerGroup: settingData.printPerGroup.toString(),
      variables: settingData.selectedVariables
    }


    try {
      setIsLoading(true)
      const res = await api('/printLineSetting/', data, 'post', true,ip,true)
      if (res.data.success) {
        setAlertData({
          openSnackbar: true,
          type: 'success',
          message: 'Printline setting added successfully',
          variant: 'filled'
        })
      } else if (res.data.code === 401) {
        removeAuthToken()
        router.push('/401')
      } else {
        setAlertData({ openSnackbar: true, type: 'error', message: res.data.error.details.message, variant: 'filled' })
      }
    } catch (error) {
      console.error('Error applying settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const editSetting = async () => {
    const data = {
      printerLineId: projectSettingData.lineId,
      label: settingData.label,
      dateFormat: settingData.dateFormat,
      noOfGroups: settingData.noOfGroups.toString(),
      printPerGroup: settingData.printPerGroup.toString(),
      variables: settingData.selectedVariables
    }

    try {
      setIsLoading(true)
      const res = await api('/printLineSetting/', data, 'put', true,ip,true)
      if (res.data.success) {
        setAlertData({
          openSnackbar: true,
          type: 'success',
          message: 'Printline setting updated successfully',
          variant: 'filled'
        })
      }
    } catch (error) {
      console.error('Error applying settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const applySettings = async () => {
    if (config?.config?.esign_status) {
      setApproveAPI({
        approveAPIName: 'batch-printing-create',
        approveAPImethod: 'POST',
        approveAPIEndPoint: '/api/v1/batch-printing',
        session: 'start',
        authUser: {}
      })
      setAuthModalOpen(true)
    } else {
      editId ? await editSetting() : await addSetting()
    }
  }

  const closeModal = () => {
    setOpenModal(false)
  }

  const handleInput = e => {
    setSettingData(prevSetting => ({
      ...prevSetting,
      [e.target.name]: e.target.value
    }))
  }

  const closeSnackbar = () => {
    setAlertData({ ...alertData, openSnackbar: false })
  }

  const getLabels = async () => {
    try {
      setIsLoading(true)
      setTimeout(() => {
        setIsLoading(false)
      }, 5000)
      const res = await api(
        `/batchprinting/getPrinterLabels/${projectSettingData.printerId}`,
        {},
        'get',
        true,
        ip,
        true
      )
      setIsLoading(false)
      if (res?.data.success) {
        setLabels(res.data?.data?.projectNames)
      }
    } catch (error) {
      console.log("getting while fetching label",error)
      console.error('Error to get print line setting')
      setIsLoading(false)
    }
  }

  const handleAuthModalClose = () => {
    setAuthModalOpen(false)
    setOpenModalApprove(false)
  }

  const handleAuthModalOpen = user => {
    setApproveAPI({
      ...approveAPI,
      approveAPIName: 'batch-printing-approve',
      approveAPImethod: 'PATCH',
      approveAPIEndPoint: '/api/v1/batch-printing',
      authUser: user
    })
    setAuthModalOpen(true)
  }

  const handleAuthResult = async (isAuthenticated, user, isApprover, esignStatus, remarks) => {
    const resetState = () => {
      setApproveAPI({ approveAPIName: '', approveAPImethod: '', approveAPIEndPoint: '', session: '', authUser: {} })
      setAuthModalOpen(false)
    }
    if (!isAuthenticated) {
      setAlertData({ type: 'error', message: 'Authentication failed, Please try again.', openSnackbar: true })
      return
    }
    const prepareData = () => ({
      esignStatus: esignStatus,
      audit_log: config?.config?.audit_logs
        ? {
            user_id: user.userId,
            user_name: user.userName,
            performed_action: 'approved',
            remarks: remarks.length > 0 ? remarks : `Batch printing session start approved`
          }
        : {}
    })
    const handleEsignApproved = async () => {
      const data = {
        esignStatus: 'approved',
        audit_log: config?.config?.audit_logs
          ? {
              user_id: user.userId,
              user_name: user.userName,
              performed_action: 'approved',
              remarks: remarks.length > 0 ? remarks : `Batch printing session start requested`
            }
          : {}
      }
      await api('/esign-status/double-esign', data, 'patch', true)
      handleAuthModalOpen(user)
    }
    const handleApproverActions = async () => {
      const data = prepareData()
      await api('/esign-status/double-esign', data, 'patch', true)
    }
    if (isApprover && esignStatus === 'approved') {
      await handleApproverActions()
      if (approveAPI.authUser.userId === user.userId) {
        setAlertData({ ...alertData, openSnackbar: true, message: 'Same user cannot Approved', type: 'error' })
        return
      }
      editId ? await editSetting() : await addSetting()
    } else if (esignStatus === 'rejected') {
        setAuthModalOpen(false)
        setOpenModalApprove(false)
      } else if (esignStatus === 'approved') {
        handleEsignApproved()
      }
    
    resetState()
  }

  return (
    <>
      <Modal open={openModal} onClose={closeModal}>
        <Box sx={{ ...style, width: '40%' }}>
          <Typography variant='h4' gutterBottom>
            Project Settings
          </Typography>
          <Typography variant='h6'>Adjust the settings to customize.</Typography>
          <Grid2 container spacing={2} margin={'1rem 0rem'}>
            <Grid2 size={6}>
              <FormControl fullWidth>
                <InputLabel id='label'>Label</InputLabel>
                <Select
                  labelId='label'
                  id='label'
                  label='Label'
                  fullWidth
                  onChange={handleInput}
                  name='label'
                  value={settingData.label}
                  onOpen={getLabels}
                >
                  {labels?.map((item, index) => (
                    <MenuItem key={item} value={item}>
                      {item}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid2>

            <Grid2 size={6}>
              <FormControl fullWidth>
                <InputLabel id='date'>Date Format</InputLabel>
                <Select
                  labelId='date'
                  id='date'
                  label='DateFormat'
                  fullWidth
                  onChange={handleInput}
                  name='dateFormat'
                  value={settingData.dateFormat}
                >
                  <MenuItem value='DD/MM/YYYY'>DD/MM/YYYY</MenuItem>
                  <MenuItem value='MM-DD-YY'>MM-DD-YY</MenuItem>
                  <MenuItem value='DD-MM-YY'>DD-MM-YY</MenuItem>
                  <MenuItem value='DD/MM/YY'>DD/MM/YY</MenuItem>
                  <MenuItem value='MM/YYYY'>MM/YYYY</MenuItem>
                  <MenuItem value='MM-YYYY'>MM-YYYY</MenuItem>
                  <MenuItem value='MMM.YYYY'>MMM.YYYY</MenuItem>
                </Select>
              </FormControl>
            </Grid2>
          </Grid2>

          <Grid2 container spacing={3} sx={{ marginTop: '1rem' }}>
            <Grid2 size={6}>
              <FormControl fullWidth>
                <InputLabel id='no_of_groups_lbl'>No. of Groups</InputLabel>
                <Select
                  labelId='no_of_groups_lbl'
                  id='no_of_groups'
                  label='No. of Groups'
                  fullWidth
                  onChange={handleInput}
                  name='noOfGroups'
                  value={settingData.noOfGroups}
                >
                  <MenuItem value='1'>1</MenuItem>
                  <MenuItem value='2'>2</MenuItem>
                  <MenuItem value='3'>3</MenuItem>
                  <MenuItem value='4'>4</MenuItem>
                </Select>
              </FormControl>
            </Grid2>
            <Grid2 size={6}>
              <FormControl fullWidth>
                <InputLabel id='group_prnt_lbl'>Print per group</InputLabel>
                <Select
                  labelId='group_prnt_lbl'
                  id='group_prnt'
                  label='Print per group'
                  fullWidth
                  onChange={handleInput}
                  name='printPerGroup'
                  value={settingData.printPerGroup}
                >
                  <MenuItem value='1'>1</MenuItem>
                  <MenuItem value='2'>2</MenuItem>
                  <MenuItem value='3'>3</MenuItem>
                  <MenuItem value='4'>4</MenuItem>
                  <MenuItem value='5'>5</MenuItem>
                  <MenuItem value='6'>6</MenuItem>
                </Select>
              </FormControl>
            </Grid2>
          </Grid2>

          <Grid2 container spacing={1} sx={{ marginTop: '1rem' }}>
            <Grid2 size={12}>
              <FormControl sx={{ width: '100%' }}>
                <InputLabel id='no-of-variable'>No of Variable</InputLabel>
                <Select
                  labelId='no-of-variable'
                  id='no-of-variable'
                  multiple
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 48 * 4.5 + 8,
                        width: 250
                      }
                    }
                  }}
                  // onChange={handleInput} name='noOfGroups'
                  value={settingData.selectedVariables}
                  renderValue={selected => selected.join(', ')}
                  onChange={e => {
                    // const value = ...e.target.value;
                    setSettingData(prevData => {
                      const data = { ...prevData }
                      data.variables.forEach(i => {
                        if (e.target.value.includes(i.value)) {
                          i.checked = true
                        } else {
                          i.checked = false
                        }
                       
                      })
                      data.selectedVariables = e.target.value
                      return data
                    })
                  }}
                  input={<OutlinedInput label='None' />}
                >
                  {settingData.variables?.map((item, index) => (
                    <MenuItem key={item.value} value={item.value}>
                      <Checkbox checked={item.checked} />
                      <ListItemText primary={item.label} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid2>
          </Grid2>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            {apiAccess.addApiAccess && (
              <Button variant='contained' onClick={applySettings} sx={{ minWidth: 100 }}>
                Apply
              </Button>
            )}
            <Button
              variant='outlined'
              color='error'
              onClick={() => {
                setOpenModal(!openModal)
              }}
              sx={{ minWidth: 100 }}
            >
              Close
            </Button>
          </Box>
        </Box>
      </Modal>
      <SnackbarAlert openSnackbar={alertData.openSnackbar} closeSnackbar={closeSnackbar} alertData={alertData} />
      <AuthModal
        open={authModalOpen}
        handleClose={handleAuthModalClose}
        approveAPI={{
           approveAPIName: approveAPI.approveAPIName,
            approveAPImethod: approveAPI.approveAPImethod,
            approveAPIEndPoint: approveAPI.approveAPIEndPoint,
        }}
        handleAuthResult={handleAuthResult}
        config={config}
        handleAuthModalOpen={handleAuthModalOpen}
        openModalApprove={openModalApprove}
      />
    </>
  )
}

ProjectSettings.propTypes={
   openModal:PropTypes.any,
    setOpenModal:PropTypes.any,
     projectSettingData:PropTypes.any, 
     apiAccess:PropTypes.any,
      ip:PropTypes.any
}
export default ProjectSettings
