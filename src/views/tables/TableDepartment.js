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
import ChevronUp from 'mdi-material-ui/ChevronUp'
import ChevronDown from 'mdi-material-ui/ChevronDown'
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
  departmentData,
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
    setAuthModalOpen(false)
    setOpenModalApprove(false)
  }
  const handleAuthResult = async (isAuthenticated, user, isApprover, esignStatus, remarks) => {
    console.log('handleAuthResult 01', isAuthenticated, isApprover, esignStatus, user)
    console.log('handleAuthResult 02', config.userId, user.user_id)
    const resetState = () => {
      setApproveAPI({
        approveAPIName: '',
        approveAPImethod: '',
        approveAPIEndPoint: ''
      })
      setEsignDownloadPdf(false)
      setAuthModalOpen(false)
    }

    const handleApproverActions = async () => {
      const data = {
        modelName: 'designation',
        esignStatus,
        id: eSignStatusId,
        audit_log: config?.config?.audit_logs
          ? {
              user_id: user.userId,
              user_name: user.userName,
              remarks: remarks.length > 0 ? remarks : `designation approved - ${auditLogMark}`,
              authUser: user.user_id
            }
          : {}
      }

      if (!esignDownloadPdf && isApprover && approveAPI.approveAPIName !== 'designation-approve') {
        setAlertData({
          ...alertData,
          openSnackbar: true,
          type: 'error',
          message: 'Access denied for this user.'
        })
        resetState()
        return
      } else {
        if (!esignDownloadPdf) {
          const res = await api('/esign-status/update-esign-status', data, 'patch', true)
          if (res.data) {
            setAlertData({
              ...alertData,
              openSnackbar: true,
              type: res.data.code === 200 ? 'success' : 'error',
              message: res.data.message
            })
          }
          setPendingAction(true)
        }

        if (esignDownloadPdf) {
          if (esignStatus === 'approved' && esignDownloadPdf) {
            setOpenModalApprove(false)
            resetState()
            downloadPdf(tableData, null, tableBody, arrayDesignation, userDataPdf)
            return
          }
          if (esignStatus === 'rejected' && esignDownloadPdf) {
            setOpenModalApprove(false)
            resetState()
            return 0
          }
        } else if (approveAPI.approveAPIName === 'department-approve') {
          if (esignStatus === 'approved') {
            setOpenModalApprove(false)
            setPendingAction(true)
            resetState()
            return
          }
          if (esignStatus === 'rejected') {
            setOpenModalApprove(false)
            resetState()
          }
        }
      }
    }
    const handleCreatorActions = async () => {
      if (esignStatus === 'rejected') {
        setAuthModalOpen(false)
        setOpenModalApprove(false)
        setAlertData({
          ...alertData,
          openSnackbar: true,
          type: 'error',
          message: 'Access denied for this user.'
        })
      } else {
        setAuthUser(user)
        setEsignRemark(remarks)
        setPendingAction(editData?.id ? 'edit' : 'add')
      }
    }

    const handleUnauthenticated = async () => {
      setAlertData({ openSnackbar: true, type: 'error', message: 'Authentication failed, Please try again.' })
    }
    if (!isAuthenticated) {
      handleUnauthenticated()
    } else if (isApprover) {
      await handleApproverActions()
    } else {
      await handleCreatorActions()
    }
    resetState()
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
  const handleDesignationDrawerOpen = row => {
    setDepData(row)
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
          authUser
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
          authUser
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
    <Box sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : 800 }} role='presentation'>
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
            <StatusChip label={row.esign_status} color={statusObj[row.esign_status]?.color || 'default'} />
          )}
          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
            {moment(row.created_at).format('DD/MM/YYYY, hh:mm:ss a')}
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
          {depData.id && (
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
                            Updated At
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
                              <StatusChip
                                label={historyRow.esign_status}
                                color={statusObj[historyRow.esign_status]?.color || 'default'}
                              />
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
          departmentData={departmentData}
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
  handleSortById: PropTypes.any,
  handleSortByName: PropTypes.any,
  sortDirection: PropTypes.any,
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
        setDepartment(res.data.data.departments)
      } else if (res.data.code === 401) {
        removeAuthToken()
        router.push('/401')
      }
    } catch (error) {
      setIsLoading(false)
    }
  }
  const handleSort = (key, isBoolean = false) => {
    const newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc'
    const booleanSort = (a, b) => {
      if (a[key] === b[key]) return 0
      let comparison = a[key] ? 1 : -1
      if (newSortDirection !== 'asc') {
        comparison = a[key] ? -1 : 1
      }
      return comparison
    }
    const regularSort = (a, b) => {
      if (a[key] === b[key]) return 0
      let comparison = a[key] > b[key] ? 1 : -1
      if (newSortDirection !== 'asc') {
        comparison = a[key] > b[key] ? -1 : 1
      }
      return comparison
    }
    const sorted = [...departmentData.data].sort(isBoolean ? booleanSort : regularSort)
    setDepartmentData({ ...departmentData, data: sorted })
    setSortDirection(newSortDirection)
    setSortBy(key)
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
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                Created At
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
