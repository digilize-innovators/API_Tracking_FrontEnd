import React, { useState, Fragment, useEffect, useMemo, useLayoutEffect } from 'react'
import {
  Box,
  Table,
  Collapse,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Typography,
  IconButton,
  Button,
  Tooltip
} from '@mui/material'
import { MdModeEdit, MdOutlineDomainVerification } from 'react-icons/md'
import { ChevronDown, ChevronUp } from 'mdi-material-ui'
import CustomTable from 'src/components/CustomTable'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import { api } from 'src/utils/Rest-API'
import { IoIosAdd, IoMdAdd } from 'react-icons/io'
import Grid2 from '@mui/material/Grid2'
import { useLoading } from 'src/@core/hooks/useLoading'
import { CiExport } from 'react-icons/ci'
import { useAuth } from 'src/Context/AuthContext'
import moment from 'moment'
import TableDesignation from './TableDesignation'
import AuthModal from 'src/components/authModal'
import PropTypes from 'prop-types'
import { statusObj } from 'src/configs/statusConfig'
import { getSortIcon } from 'src/utils/sortUtils'
import { getTokenValues } from '../../utils/tokenUtils'
import { handleRowToggleHelper } from 'src/utils/rowUtils'
import StatusChip from 'src/components/StatusChip'
import DesignationModal from 'src/components/Modal/DesignationModal'
import downloadPdf from 'src/utils/DownloadPdf'
import { useSettings } from 'src/@core/hooks/useSettings'
import { useRouter } from 'next/router'
import { sortData } from 'src/utils/sortData'

const ChevronIcon = ({ isOpen }) => (isOpen ? <ChevronUp /> : <ChevronDown />)
ChevronIcon.propTypes = {
  isOpen: PropTypes.any
}
const Row = ({
  row,
  index,
  isOpen,
  handleRowToggle,
  page,
  rowsPerPage,
  handleAuthCheck,
  handleUpdate,
  apiAccess,
  config_dept,
  setAlertData,
  alertData,
  historyData
}) => {
  const [state, setState] = useState({ addDrawer: false })
  const [openModalDes, setOpenModalDes] = useState(false)
  const { setIsLoading } = useLoading()
  const [editData, setEditData] = useState({})
  const [arrayDesignation, setArrayDesignation] = useState([])
  const [depData, setDepData] = useState('')
  const [userDataPdf, setUserDataPdf] = useState()
  const { getUserData } = useAuth()
  const [config, setConfig] = useState(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [approveAPI, setApproveAPI] = useState({ approveAPIName: '', approveAPImethod: '', approveAPIEndPoint: '' })
  const [eSignStatusId, setESignStatusId] = useState('')
  const [auditLogMark, setAuditLogMark] = useState('')
  const [esignDownloadPdf, setEsignDownloadPdf] = useState(false)
  const [openModalApprove, setOpenModalApprove] = useState(false)
  const [pendingAction, setPendingAction] = useState(null)
  const [formData, setFormData] = useState({})
  const [authUser, setAuthUser] = useState({})
  const [esignRemark, setEsignRemark] = useState('')
  const { removeAuthToken } = useAuth()
  const router = useRouter()

  useLayoutEffect(() => {
    let data = getUserData()
    const decodedToken = getTokenValues()
    setConfig(decodedToken)
    setUserDataPdf(data)
    return () => {}
  }, [openModalDes])

  useEffect(() => {
    const handleUserAction = async () => {
      if (formData && pendingAction) {
        const esign_status = config?.config?.esign_status && config?.role !== 'admin' ? 'pending' : 'approved'
        if (pendingAction === 'edit') {
          await editDesignation(esign_status)
        } else if (pendingAction === 'add') {
          await addDesignation(esign_status)
        }
        setPendingAction(null)
      }
    }

    handleUserAction()
  }, [formData, pendingAction])

  const tableBody = arrayDesignation.map((item, index) => [
    index + 1,
    item.designation_id,
    item.designation_name,
    item.esign_status
  ])

  const tableData = useMemo(
    () => ({
      tableHeader: ['Sr.No.', 'Id', 'Designation Name', 'E-Sign'],
      tableHeaderText: 'Designation Report',
      tableBodyText: 'Designation Data',
      filename: 'Designation'
    }),
    []
  )

  const toggleDrawer = (anchor, open) => event => {
    if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return
    }
    setState({ ...state, [anchor]: open })
  }
  const handleAuthModalClose = () => {
    setEsignDownloadPdf(false)
    setAuthModalOpen(false)
    setOpenModalApprove(false)
  }

  const handleAuthResult = async (isAuthenticated, user, isApprover, esignStatus, remarks) => {
    if (!isAuthenticated) {
      setAlertData({
        type: 'error',
        openSnackbar: true,
        message: 'Authentication failed, Please try again.'
      })
      resetState()
      return
    }

    if (isApprover) {
      await handleApproverActions(user, esignStatus, remarks)
    } else {
      handleCreatorActions(user, esignStatus, remarks, isApprover)
    }

    resetState()
  }

  const resetState = () => {
    setApproveAPI({ approveAPIName: '', approveAPIEndPoint: '', approveAPImethod: '' })
    setEsignDownloadPdf(false)
    setAuthModalOpen(false)
  }

  const buildAuditLog = (user, remarks, action) => {
    return config?.config?.audit_logs
      ? {
          user_id: user.userId,
          user_name: user.userName,
          remarks: remarks?.length > 0 ? remarks : `designation ${action} - ${auditLogMark}`,
          authUser: user.user_id
        }
      : {}
  }

  const handleApproverActions = async (user, esignStatus, remarks) => {
    const payload = {
      modelName: 'designation',
      esignStatus,
      id: eSignStatusId,
      name: auditLogMark,
      audit_log: buildAuditLog(user, remarks, esignStatus)
    }

    if (esignStatus === 'approved' && esignDownloadPdf) {
      setOpenModalApprove(false)
      downloadPdf(tableData, null, tableBody, arrayDesignation, user)
      if (config?.config?.audit_logs) {
        const auditPayload = {
          audit_log: {
            audit_log: true,
            performed_action: `Export report of designation of department=${depData?.department_name} `,
            remarks:
              remarks?.length > 0 ? remarks : `Designation of Department=${depData?.department_name} export report`,
            authUser: user
          }
        }
        await api('/auditlog/', auditPayload, 'post', true)
      }
      return
    }

    const res = await api('/esign-status/update-esign-status', payload, 'patch', true)

    if (res?.data) {
      setAlertData({
        ...alertData,
        openSnackbar: true,
        type: res.data.code === 200 ? 'success' : 'error',
        message: res?.data?.message || `Error during user approval.`
      })
    }
    setPendingAction(true)
    if (esignStatus === 'rejected' && esignDownloadPdf) {
      setOpenModalApprove(false)
    }
  }

  const handleCreatorActions = (user, esignStatus, remarks, isApprover) => {
    if (esignStatus === 'rejected') {
      setAuthModalOpen(false)
      setOpenModalApprove(false)
      setAlertData({
        ...alertData,
        openSnackbar: true,
        type: 'error',
        message: 'Access denied for this user.'
      })
      return
    }

    if (!isApprover && esignDownloadPdf) {
      setAlertData({
        ...alertData,
        openSnackbar: true,
        type: 'error',
        message: 'Access denied: Download pdf disabled for this user.'
      })
      resetState()
      return
    }

    if (esignStatus === 'approved') {

      if (esignDownloadPdf) {
        setEsignDownloadPdf(false)
        setOpenModalApprove(true)
      } else {
        setAuthUser(user)
        setEsignRemark(remarks)
        setPendingAction(editData?.id ? 'edit' : 'add')
      }
    }
  }

  const handleDesigAuthCheck = async row => {
    setApproveAPI({
      approveAPIName: 'designation-approve',
      approveAPImethod: 'PATCH',
      approveAPIEndPoint: '/api/v1/designation'
    })
    setAuthModalOpen(true)
    setESignStatusId(row.id)
    setAuditLogMark(row.designation_id)
  }

  const getDepartmentsHistory = async rowId => {
    try {
      setIsLoading(true)
      const res = await api(`/department/history/${rowId}`, null, 'get', true)
      if (res.data.success) {
        return res.data.data
      } else if (res.data.code === 401) {
        removeAuthToken()
        router.push('/401')
      }
      return null
    } catch (error) {
      setAlertData({ ...alertData, type: 'error', message: error?.message, openSnackbar: true })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDesignationDrawerOpen = async row => {
    const tempData = await getDepartmentsHistory(row?.id)
    if (Array.isArray(tempData)) {
      const approvedRecord = tempData.filter(el => el.esign_status === 'approved')

      if (approvedRecord?.length < 1) {
        setAlertData({
          ...alertData,
          type: 'error',
          message: `Department ${tempData[0].esign_status == 'pending' ? 'approval is pending!' : 'is Rejected!'}`,
          openSnackbar: true
        })
      } else {
        setDepData({ ...approvedRecord[0], id: approvedRecord[0].department_uuid })
      }
    }
  }

  const resetFormDes = () => {
    setEditData({})
  }

  const handleOpenModalDes = () => {
    setApproveAPI({
      approveAPIName: 'designation-create',
      approveAPImethod: 'POST',
      approveAPIEndPoint: '/api/v1/designation'
    })
    resetFormDes()
    setOpenModalDes(true)
  }

  const handleCloseModalDes = () => {
    resetFormDes()
    setOpenModalDes(false)
  }

  const handleSubmitFormDes = async data => {
    setFormData(data)
    if (editData?.id) {
      setApproveAPI({
        approveAPIName: 'designation-update',
        approveAPImethod: 'PUT',
        approveAPIEndPoint: '/api/v1/designation'
      })
    } else {
      setApproveAPI({
        approveAPIName: 'designation-create',
        approveAPImethod: 'POST',
        approveAPIEndPoint: '/api/v1/designation'
      })
    }

    if (config?.config?.esign_status && config?.role !== 'admin') {
      setAuthModalOpen(true)
      return
    }
    setPendingAction(editData?.id ? 'edit' : 'add')
  }

  const addDesignation = async esign_status => {
    try {
      const data = { ...formData }
      if (config?.config?.audit_logs) {
        data.audit_log = {
          audit_log: true,
          remarks: esignRemark?.length > 0 ? esignRemark : `Designation added - ${formData.designationId}`,
          authUser,
          department: depData?.department_name
        }
      }
      data.esign_status = esign_status
      setIsLoading(true)
      const res = await api('/designation/', data, 'post', true)
      setIsLoading(false)
      if (res?.data?.success) {
        setAlertData({ ...alertData, openSnackbar: true, type: 'success', message: 'Designation added successfully' })
        resetFormDes()
        setOpenModalDes(false)
      } else {
        console.log('error to add designation ', res.data)
        setAlertData({ ...alertData, openSnackbar: true, type: 'error', message: res.data?.message })
      }
    } catch (error) {
      console.log('Erorr to add designation ', error)
      setAlertData({ ...alertData, openSnackbar: true, type: 'error', message: 'Something went wrong' })
      setOpenModalDes(false)
    } finally {
      setIsLoading(false)

      setApproveAPI({
        approveAPIName: '',
        approveAPImethod: '',
        approveAPIEndPoint: ''
      })
    }
  }

  const editDesignation = async esign_status => {
    try {
      const data = { ...formData }
      delete data.designationId
      if (config?.config?.audit_logs) {
        data.audit_log = {
          audit_log: true,
          remarks: esignRemark > 0 ? esignRemark : `Designation edited - ${formData.designationName}`,
          authUser,
          department: depData?.department_name
        }
      }
      data.esign_status = esign_status
      setIsLoading(true)
      const res = await api(`/designation/${editData.id}`, data, 'put', true)
      setIsLoading(false)
      if (res.data.success) {
        setAlertData({ ...alertData, openSnackbar: true, type: 'success', message: 'Designation updated successfully' })
        resetFormDes()
        setOpenModalDes(false)
      } else {
        console.log('error to edit designation ', res.data)
        setAlertData({ ...alertData, openSnackbar: true, type: 'error', message: res.data.message })
      }
    } catch (error) {
      console.log('Erorr to edit designation ', error)
      setAlertData({ ...alertData, openSnackbar: true, type: 'error', message: 'Something went wrong' })
      setOpenModalDes(false)
    } finally {
      setIsLoading(false)
      setApproveAPI({
        approveAPIName: '',
        approveAPImethod: '',
        approveAPIEndPoint: ''
      })
    }
  }

  const handleUpdateDes = item => {
    resetFormDes()
    setOpenModalDes(true)
    setEditData(item)
  }

  const handleAuthModalOpen = () => {
    setApproveAPI({
      approveAPIName: 'designation-approve',
      approveAPImethod: 'PATCH',
      approveAPIEndPoint: '/api/v1/designation'
    })
    setAuthModalOpen(true)
  }

  const handleDownloadPdf = () => {
    setApproveAPI({
      approveAPIName: 'designation-approve',
      approveAPImethod: 'PATCH',
      approveAPIEndPoint: '/api/v1/designation'
    })
    if (config?.config?.esign_status && config?.role !== 'admin') {
      setEsignDownloadPdf(true)
      setAuthModalOpen(true)
      return
    }
    downloadPdf(tableData, null, tableBody, arrayDesignation, userDataPdf)
  }

  const list = anchor => (
    <Box sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : 800 }}>
      <Grid2 item xs={12}>
        <Typography variant='h2' className='my-3 mx-2' sx={{ fontWeight: 'bold', paddingLeft: 8 }}>
          Add Designation For: {depData?.department_name}
        </Typography>
        <Box className='d-flex flex-direction-row justify-content-between' sx={{}}>
          <Typography variant='h4' className='mx-3' sx={{ fontWeight: 'bold', paddingLeft: 8 }}>
            Designation Data
          </Typography>
          <Box className='mx-5 d-flex align-items-center'>
            {apiAccess.addDesignationApiAccess && (
              <Button variant='contained' className='py-2' onClick={handleOpenModalDes} sx={{ marginRight: 4 }}>
                <span>
                  <IoMdAdd />
                </span>
                <span>Add</span>
              </Button>
            )}
            <Button variant='contained' style={{ display: 'inline-flex' }} onClick={handleDownloadPdf}>
              <Box style={{ display: 'flex', alignItems: 'baseline' }}>
                <span>
                  <CiExport fontSize={20} />
                </span>
                <span style={{ marginLeft: 8 }}>Export</span>
              </Box>
            </Button>
          </Box>
        </Box>
      </Grid2>
      <Grid2 item xs={12}>
        <TableDesignation
          departmentId={depData?.id}
          handleAuthCheck={handleDesigAuthCheck}
          handleUpdateDes={handleUpdateDes}
          apiAccess={apiAccess}
          config_dept={config_dept}
          pendingAction={pendingAction}
          setArrayDesignation={setArrayDesignation}
        />
      </Grid2>
      <AuthModal
        open={authModalOpen}
        handleClose={handleAuthModalClose}
        approveAPIName={approveAPI.approveAPIName}
        approveAPImethod={approveAPI.approveAPImethod}
        approveAPIEndPoint={approveAPI.approveAPIEndPoint}
        handleAuthResult={handleAuthResult}
        config={config}
        handleAuthModalOpen={handleAuthModalOpen}
        openModalApprove={openModalApprove}
      />
    </Box>
  )
  const isPendingEsign = row.esign_status === 'pending' && config_dept?.config?.esign_status
  const hasEditAccess = apiAccess.editApiAccess
  const editIconStyle = {
    cursor: hasEditAccess ? 'pointer' : 'not-allowed',
    opacity: hasEditAccess ? 1 : 0.5,
    marginRight: 20
  }
  const renderAuthIcon = () => (
    <MdOutlineDomainVerification
      fontSize={20}
      data-testid={`auth-check-icon-${row.id}`}
      onClick={() => handleAuthCheck(row)}
      style={{ marginRight: 20 }}
    />
  )
  const renderEditIcon = () => (
    <Tooltip title={!hasEditAccess ? 'No edit access' : ''}>
      <MdModeEdit
        fontSize={20}
        data-testid={`edit-department-${row.id}`}
        onClick={hasEditAccess ? () => handleUpdate(row) : null}
        style={editIconStyle}
      />
    </Tooltip>
  )
  return (
    <>
      <Fragment>
        <TableRow sx={{ '& > *': { borderBottom: '1px solid rgba(224, 224, 224, 1)' } }}>
          <TableCell className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
            <IconButton align='center' aria-label='expand row' size='small' onClick={() => handleRowToggle(row.id)}>
              <ChevronIcon isOpen={isOpen} />
            </IconButton>
          </TableCell>
          <TableCell
            align='center'
            component='th'
            scope='row'
            className='p-2'
            sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
          >
            {index + 1 + page * rowsPerPage}
          </TableCell>
          <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} align='center' className='p-2'>
            {row.department_id}
          </TableCell>
          <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} align='center' className='p-2'>
            {row.department_name}
          </TableCell>
          <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} align='center' className='p-2'>
            {row.is_location_required ? 'True' : 'False'}
          </TableCell>
          {config?.config?.esign_status === true && config?.role !== 'admin' && (
            <TableCell align="center">
              <StatusChip label={row.esign_status} color={statusObj[row.esign_status]?.color || 'default'} />
            </TableCell>
          )}
          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
            {moment(row.updated_at).format('DD/MM/YYYY, hh:mm:ss a')}
          </TableCell>
          <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} align='center' className='p-2'>
            {isPendingEsign && config_dept?.role != 'admin' ? renderAuthIcon() : renderEditIcon()}
            <Button onClick={toggleDrawer('addDrawer', true)}>
              <IoIosAdd
                fontSize={30}
                onClick={() => {
                  handleDesignationDrawerOpen(row)
                }}
                style={{ cursor: 'pointer' }}
              />
            </Button>
          </TableCell>
          {depData.id && depData.esign_status == 'approved' && (
            <SwipeableDrawer
              anchor={'right'}
              open={state['addDrawer']}
              onClose={toggleDrawer('addDrawer', false)}
              onOpen={toggleDrawer('addDrawer', true)}
            >
              {list('addDrawer')}
            </SwipeableDrawer>
          )}
        </TableRow>
        {isOpen && (
          <TableRow sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
            <TableCell colSpan={12} sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
              <Collapse in={isOpen} timeout='auto' unmountOnExit>
                <Box sx={{ mx: 2 }}>
                  <Typography variant='h6' gutterBottom component='div'>
                    History
                  </Typography>
                  <Box style={{ display: 'flex', justifyContent: 'center' }}>
                    <Table size='small' aria-label='purchases'>
                      <TableHead>
                        <TableRow>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                            Sr.No.
                          </TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                            Department ID
                          </TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                            Department Name
                          </TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                            Location Required
                          </TableCell>
                          {config?.config?.esign_status === true && config?.role !== 'admin' && (
                            <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                              E-Sign
                            </TableCell>
                          )}

                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                            Created At
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {historyData[row.id]?.map((historyRow, idx) => (
                          <TableRow
                            key={historyRow.id}
                            align='center'
                            sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
                          >
                            <TableCell component='th' scope='row' align='center'>
                              {idx + 1}
                            </TableCell>
                            <TableCell component='th' scope='row' align='center'>
                              {historyRow.department_id}
                            </TableCell>
                            <TableCell component='th' scope='row' align='center'>
                              {historyRow.department_name}
                            </TableCell>
                            <TableCell component='th' scope='row' align='center'>
                              {historyRow.is_location_required ? 'True' : 'False'}
                            </TableCell>
                            {config?.config?.esign_status === true && config?.role !== 'admin' && (
                              <TableCell align="center">
                                <StatusChip
                                  label={historyRow.esign_status}
                                  color={statusObj[historyRow.esign_status]?.color || 'default'}
                                />
                              </TableCell>
                            )}

                            <TableCell align='center'>
                              {moment(historyRow.created_at).format('DD/MM/YYYY, hh:mm:ss a')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                </Box>
              </Collapse>
            </TableCell>
          </TableRow>
        )}
      </Fragment>
      {openModalDes && (
        <DesignationModal
          open={openModalDes}
          onClose={handleCloseModalDes}
          editData={editData}
          handleSubmitForm={handleSubmitFormDes}
          depData={depData}
        />
      )}
    </>
  )
}
Row.propTypes = {
  row: PropTypes.any,
  index: PropTypes.any,
  isOpen: PropTypes.any,
  handleRowToggle: PropTypes.any,
  page: PropTypes.any,
  rowsPerPage: PropTypes.any,
  handleAuthCheck: PropTypes.any,
  handleUpdate: PropTypes.any,
  apiAccess: PropTypes.any,
  config_dept: PropTypes.any,
  setAlertData: PropTypes.any,
  alertData: PropTypes.any,
  departmentData: PropTypes.any,
  historyData: PropTypes.any
}

const TableDepartment = ({
  pendingAction,
  alertData,
  setAlertData,
  setDepartment,
  handleUpdate,
  apiAccess,
  config_dept,
  handleAuthCheck,
  tableHeaderData
}) => {
  const { settings } = useSettings()
  const [sortBy, setSortBy] = useState('')
  const [openRows, setOpenRows] = useState({})
  const [historyData, setHistoryData] = useState({})
  const [sortDirection, setSortDirection] = useState('asc')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(settings.rowsPerPage)
  const [departmentData, setDepartmentData] = useState({ data: [], total: 0 })
  const router = useRouter()
  const { setIsLoading } = useLoading()
  const { removeAuthToken } = useAuth()

  const handleRowToggle = async rowId => {
    await handleRowToggleHelper(rowId, openRows, setOpenRows, setHistoryData, '/department/history')
  }

  useMemo(() => {
    setPage(0)
  }, [tableHeaderData, rowsPerPage])
  useEffect(() => {
    getDepartments()
  }, [page, rowsPerPage, tableHeaderData, pendingAction])

  const getDepartments = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage === -1 ? -1 : rowsPerPage,
        search: tableHeaderData.searchVal,
        esign_status: tableHeaderData.esignStatus
      })
      const res = await api(`/department/?${params.toString()}`, {}, 'get', true)
      setIsLoading(false)
      if (res.data.success) {
        setDepartmentData({ data: res.data.data.departments, total: res.data.data.total })
        setDepartment({ data: res.data.data.departments, index: res.data.data.offset })
      } else if (res.data.code === 401) {
        removeAuthToken()
        router.push('/401')
      }
    } catch (error) {
      console.log('error whilt get api of department', error)
      setIsLoading(false)
    }
  }

  const handleSort = path => {
    const newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc'
    const data = departmentData?.data || []
    const sortedData = sortData(data, path, newSortDirection)
    setDepartmentData(prev => ({ ...prev, data: sortedData }))
    setSortDirection(newSortDirection)
    setSortBy(path)
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  return (
    <CustomTable
      data={departmentData.data}
      page={page}
      rowsPerPage={rowsPerPage}
      totalRecords={departmentData.total}
      handleChangePage={handleChangePage}
      handleChangeRowsPerPage={handleChangeRowsPerPage}
    >
      <Box sx={{ position: 'relative', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
        <Table stickyHeader>
          <TableHead style={{ backgroundColor: '#fff' }}>
            <TableRow sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
              <TableCell className='p-0 m-0' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} />
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                Sr.No.
              </TableCell>
              <TableCell
                align='center'
                sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
                style={{ cursor: 'pointer' }}
                onClick={() => handleSort('department_id')}
              >
                Department ID
                <IconButton align='center' aria-label='expand row' size='small'>
                  {getSortIcon(sortBy, 'department_id', sortDirection)}
                </IconButton>
              </TableCell>
              <TableCell
                align='center'
                sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
                style={{ cursor: 'pointer' }}
                onClick={() => handleSort('department_name')}
              >
                Department Name
                <IconButton align='center' aria-label='expand row' size='small'>
                  {getSortIcon(sortBy, 'department_name', sortDirection)}
                </IconButton>
              </TableCell>
              <TableCell
                align='center'
                sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
                style={{ cursor: 'pointer' }}
                onClick={() => handleSort('is_location_required')}
              >
                Location Required
                <IconButton align='center' aria-label='expand row' size='small'>
                  {getSortIcon(sortBy, 'is_location_required', sortDirection)}
                </IconButton>
              </TableCell>
              {config_dept?.config?.esign_status === true && config_dept?.role !== 'admin' && (
                <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                  E-Sign
                </TableCell>
              )}
              <TableCell
                align='center'
                sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
                style={{ cursor: 'pointer' }}
                onClick={() => handleSort('updated_at')}
              >
                Updated At
                <IconButton align='center' aria-label='expand row' size='small'>
                  {getSortIcon(sortBy, 'updated_at', sortDirection)}
                </IconButton>
              </TableCell>
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {departmentData?.data?.map((item, index) => (
              <Row
                key={item.id}
                row={item}
                index={index}
                isOpen={openRows[item.id]}
                handleRowToggle={handleRowToggle}
                handleAuthCheck={handleAuthCheck}
                handleUpdate={handleUpdate}
                apiAccess={apiAccess}
                config_dept={config_dept}
                setAlertData={setAlertData}
                alertData={alertData}
                departmentData={departmentData.data}
                historyData={historyData}
                page={page}
                rowsPerPage={rowsPerPage}
              />
            ))}
            {departmentData?.length === 0 && (
              <TableRow sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                <TableCell colSpan={12} align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                  No data
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
    </CustomTable>
  )
}
TableDepartment.propTypes = {
  tableHeaderData: PropTypes.any,
  alertData: PropTypes.any,
  setAlertData: PropTypes.any,
  pendingAction: PropTypes.any,
  handleUpdate: PropTypes.any,
  setDepartment: PropTypes.any,
  apiAccess: PropTypes.any,
  config_dept: PropTypes.any,
  handleAuthCheck: PropTypes.any
}
export default TableDepartment
