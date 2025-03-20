import React, { useState, Fragment, useEffect, useMemo, useLayoutEffect } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  TextField,
  MenuItem,
  Tooltip,
  Modal,
} from '@mui/material';
import { MdModeEdit, MdOutlineDomainVerification } from 'react-icons/md';
import ChevronUp from 'mdi-material-ui/ChevronUp';
import ChevronDown from 'mdi-material-ui/ChevronDown';
import CustomTable from 'src/components/CustomTable';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import { api } from 'src/utils/Rest-API';
import { IoIosAdd, IoMdAdd } from 'react-icons/io';
import Grid2 from '@mui/material/Grid2'
import { useLoading } from 'src/@core/hooks/useLoading';
import { CiExport } from 'react-icons/ci';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAuth } from 'src/Context/AuthContext';
import moment from 'moment';
import TableDesignation from './TableDesignation';
import AuthModal from 'src/components/authModal';
import PropTypes from 'prop-types';
import { statusObj } from 'src/configs/statusConfig';
import { getSortIcon } from 'src/utils/sortUtils';
import { decodeAndSetConfig, getTokenValues } from '../../utils/tokenUtils';
import { handleRowToggleHelper } from 'src/utils/rowUtils';
import StatusChip from 'src/components/StatusChip';
import DesignationModal from 'src/components/Modal/DesignationModal';
import downloadPdf from 'src/utils/DownloadPdf';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '50%',
  bgcolor: 'background.paper',
  borderRadius: '10px',
  border: 0,
  outline: 0,
  boxShadow: 24,
  p: 4
};
const ChevronIcon = ({ isOpen }) => (
  isOpen ? <ChevronUp /> : <ChevronDown />
);
ChevronIcon.propTypes = {
  isOpen: PropTypes.any
}
const Row = ({ row, index, isOpen, handleRowToggle, page, rowsPerPage, handleAuthCheck, handleUpdate, designationData, apiAccess, config_dept, handleSortById, handleSortByName, sortDirection, setAlertData, alertData, getDesignations, departmentData, historyData,
}) => {
  const [state, setState] = useState({ addDrawer: false });
  const [openModalDes, setOpenModalDes] = useState(false);
  const [designationId, setDesignationId] = useState('');
  const [designationName, setDesignationName] = useState('');
  const [errorDesignationId, setErrorDesignationId] = useState({ isError: false, message: '' });
  const [errorDesignationName, setErrorDesignationName] = useState({ isError: false, message: '' });
  const { setIsLoading } = useLoading();
  const [editData, setEditData] = useState({});
  const [arrayDesignation, setArrayDesignation] = useState([]);
  const [depData, setDepData] = useState('');
  const [userDataPdf, setUserDataPdf] = useState();
  const { getUserData } = useAuth();
  const [config, setConfig] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [approveAPI, setApproveAPI] = useState({ approveAPIName: '', approveAPImethod: '', approveAPIEndPoint: '' })
  const [eSignStatusId, setESignStatusId] = useState('');
  const [auditLogMark, setAuditLogMark] = useState('');
  const [esignDownloadPdf, setEsignDownloadPdf] = useState(false);
  const [openModalApprove, setOpenModalApprove] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [formData, setFormData] = useState({})

  useLayoutEffect(() => {
    let data = getUserData();
    const decodedToken = getTokenValues();
    setConfig(decodedToken);
    setUserDataPdf(data);
    return () => { }
  }, [openModalDes])

  useEffect(() => {
    if (formData && pendingAction) {
      const esign_status = "approved";
      if (pendingAction === "edit") {
        editDesignation()
      }
      else {
        addDesignation(esign_status)
      }
      setPendingAction(null);
    }
  }, [formData, pendingAction]);

  const tableBody = arrayDesignation.map((item, index) =>
    [index + 1, item.designation_id, item.designation_name, item.esign_status]);

  const tableData = useMemo(() => ({
    tableHeader: ['Sr.No.', 'Id', 'Designation Name', 'E-Sign'],
    tableHeaderText: 'Designation Report',
    tableBodyText: 'Designation Data',
    filename: 'Designation'
  }), []);

  useEffect(() => {
    const filteredData = designationData?.filter(data => data.department_id === row.id)
    setArrayDesignation(filteredData)
  }, [designationData])

  const toggleDrawer = (anchor, open) => event => {
    console.log("open drawer", open);
    if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return
    }
    setState({ ...state, [anchor]: open })
  }
  const handleAuthModalClose = () => {
    setAuthModalOpen(false);
    setOpenModalApprove(false);
  };
  const handleAuthResult = async (isAuthenticated, user, isApprover, esignStatus, remarks) => {
    console.log("handleAuthResult 01", isAuthenticated, isApprover, esignStatus, user);
    console.log("handleAuthResult 02", config.userId, user.user_id);
    const resetState = () => {

      setApproveAPI({
        approveAPIName: "",
        approveAPImethod: "",
        approveAPIEndPoint: ""
      })
      setAuthModalOpen(false);
    };
    const createAuditLog = (action) => config?.config?.audit_logs ? {
      "user_id": user.userId,
      "user_name": user.userName,
      "performed_action": action,
      "remarks": remarks.length > 0 ? remarks : `designation ${action} - ${auditLogMark}`,
    } : {};
    const handleApproverActions = async () => {
      const data = {
        modelName: "designation",
        esignStatus,
        id: eSignStatusId,
        audit_log: createAuditLog('approved'),
      };
      if (esignStatus === "approved" && esignDownloadPdf) {
        console.log("esign is approved for approver");
        setOpenModalApprove(false);
        resetState();
        downloadPdf(tableData, null, tableBody, arrayDesignation, userDataPdf);
        return;
      }
      const res = await api('/esign-status/update-esign-status', data, 'patch', true);
      console.log("esign status update", res?.data);
      if (esignStatus === "rejected" && esignDownloadPdf) {
        console.log("approver rejected");
        setOpenModalApprove(false);
        resetState();
        return 0;
      }
    };
    const handleNonApproverActions = () => {
      if (esignStatus === "rejected") {
        setAuthModalOpen(false);
        setOpenModalApprove(false);
      } else if (esignStatus === "approved") {
        if (esignDownloadPdf) {
          console.log("esign is approved for creator to download");
          setOpenModalApprove(true);
        } else {
          console.log("esign is approved for creator");
          const esign_status = "pending";
          editData?.id ? editDesignation(esign_status, remarks) : addDesignation(esign_status, remarks);
        }
      }
    };

    const handleUnauthenticated = () => {
      setAlertData({ openSnackbar: true, type: 'error', message: 'Authentication failed, Please try again.' });
    };
    if (!isAuthenticated) {
      handleUnauthenticated();
    }
    else if (isApprover) {
      await handleApproverActions();
    }
    else {
      handleNonApproverActions();
    }
    resetState();
    getDesignations();
  };
  const handleDesigAuthCheck = async (row) => {
    console.log("handleDesigAuthCheck", row)

    setApproveAPI({
      approveAPIName: "designation-approve",
      approveAPImethod: "PATCH",
      approveAPIEndPoint: "/api/v1/designation"
    })
    setAuthModalOpen(true);
    setESignStatusId(row.id);
    setAuditLogMark(row.designation_id)
    console.log("row", row)
  }
  const handleDesignationDrawerOpen = row => {
    console.log('data', row)
    setDepData(row)
    // const filteredData = designationData?.filter(data => data.department_id === row.id)
    // setArrayDesignation(filteredData)
    // console.log('Filtered data based on department_id:', filteredData)
  }
  const resetFormDes = () => {

    setEditData({})
  }

  const handleOpenModalDes = () => {

    setApproveAPI({
      approveAPIName: "designation-create",
      approveAPImethod: "POST",
      approveAPIEndPoint: "/api/v1/designation"
    })
    resetFormDes()
    setOpenModalDes(true)
  }
  const handleCloseModalDes = () => {
    resetFormDes()
    setOpenModalDes(false)
  }

  const handleSubmitFormDes = async (data) => {
    console.log("data", data)
    setFormData(data)
    if (editData?.id) {

      setApproveAPI({
        approveAPIName: "designation-update",
        approveAPImethod: "PUT",
        approveAPIEndPoint: "/api/v1/designation"
      })
    } else {
      setApproveAPI({
        approveAPIName: "designation-create",
        approveAPImethod: "POST",
        approveAPIEndPoint: "/api/v1/designation"
      })
    }

    if (config?.config?.esign_status) {
      setAuthModalOpen(true);
      return;
    }
    setPendingAction(editData?.id ? "edit" : "add");
  }
  const addDesignation = async (esign_status, remarks) => {
    try {
      const data = { ...formData }
      console.log('Add designation data ', data)
      const auditlogRemark = remarks;
      const audit_log = config?.config?.audit_logs ? {
        "audit_log": true,
        "performed_action": "add",
        "remarks": auditlogRemark?.length > 0 ? auditlogRemark : `Designation added - ${formData.designationId}`,
      } : {
        "audit_log": false,
        "performed_action": "none",
        "remarks": `none`,
      };
      data.audit_log = audit_log;
      data.esign_status = esign_status;
      setIsLoading(true)
      const res = await api('/designation/', data, 'post', true)
      setIsLoading(false)
      if (res?.data?.success) {
        console.log('res data of add designation', res?.data)
        setAlertData({ ...alertData, openSnackbar: true, type: 'success', message: 'Designation added successfully' })
        getDesignations()
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
        approveAPIName: "",
        approveAPImethod: "",
        approveAPIEndPoint: ""
      })
    }
  }
  const editDesignation = async (esign_status, remarks) => {
    try {
      const data = { ...formData }
      delete data.designationId
      const auditlogRemark = remarks;
      let audit_log;
      if (config?.config?.audit_logs) {
        audit_log = {
          "audit_log": true,
          "performed_action": "edit",
          "remarks": auditlogRemark > 0 ? auditlogRemark : `Designation edited - ${formData.designationName}`,
        };
      } else {
        audit_log = {
          "audit_log": false,
          "performed_action": "none",
          "remarks": `none`,
        };
      }
      data.audit_log = audit_log;
      data.esign_status = esign_status;
      setIsLoading(true)
      const res = await api(`/designation/${editData.id}`, data, 'put', true)
      setIsLoading(false)
      if (res.data.success) {
        console.log('res of edit designation ', res.data)
        setAlertData({ ...alertData, openSnackbar: true, type: 'success', message: 'Designation updated successfully' })
        resetFormDes()
        getDesignations()
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
        approveAPIName: "",
        approveAPImethod: "",
        approveAPIEndPoint: ""
      })
    }
  }
  const handleUpdateDes = item => {
    resetFormDes()
    setOpenModalDes(true)
    setEditData(item)
    setDesignationId(item.designation_id)
    setDesignationName(item.designation_name)
  }

  const handleAuthModalOpen = () => {
    console.log("OPen auth model");

    setApproveAPI({
      approveAPIName: "designation-approve",
      approveAPImethod: "PATCH",
      approveAPIEndPoint: "/api/v1/designation"
    })
    setAuthModalOpen(true);
  };
  const handleDownloadPdf = () => {
    setApproveAPI({
      approveAPIName: "designation-create",
      approveAPImethod: "POST",
      approveAPIEndPoint: "/api/v1/designation"
    })
    if (config?.config?.esign_status) {
      console.log("Esign enabled for download pdf");
      setEsignDownloadPdf(true);
      setAuthModalOpen(true);
      return;
    }
    downloadPdf(tableData, null, tableBody, arrayDesignation, userDataPdf);

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
              <Button
                variant='contained'
                className='py-2'
                onClick={handleOpenModalDes}
                sx={{ marginRight: 4 }}
              >
                <span>
                  <IoMdAdd />
                </span>
                <span>Add</span>
              </Button>
            )}
            <Button
              variant='contained'
              style={{ display: 'inline-flex' }}
              onClick={handleDownloadPdf}
            >
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
          arrayDesignation={arrayDesignation}
          handleUpdateDes={handleUpdateDes}
          handleUpdate={handleUpdate}
          handleSortById={handleSortById}
          handleSortByName={handleSortByName}
          sortDirection={sortDirection}
          handleAuthCheck={handleDesigAuthCheck}
          apiAccess={apiAccess}
          config_dept={config_dept}
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
  const isPendingEsign = row.esign_status === 'pending' && config_dept?.config?.esign_status;
  const hasEditAccess = apiAccess.editApiAccess;
  const editIconStyle = {
    cursor: hasEditAccess ? 'pointer' : 'not-allowed',
    opacity: hasEditAccess ? 1 : 0.5,
    marginRight: 20,
  };
  const renderAuthIcon = () => (
    <MdOutlineDomainVerification
      fontSize={20}
      data-testid={`auth-check-icon-${row.id}`}
      onClick={() => handleAuthCheck(row)}
      style={{ marginRight: 20 }}
    />
  );
  const renderEditIcon = () => (
    <Tooltip title={!hasEditAccess ? 'No edit access' : ''}>
      <MdModeEdit
        fontSize={20}
        data-testid={`edit-department-${row.id}`}
        onClick={hasEditAccess ? () => handleUpdate(row) : null}
        style={editIconStyle}
      />
    </Tooltip>
  );
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
          {
            config?.config?.esign_status === true &&
            <StatusChip
              label={row.esign_status}
              color={statusObj[row.esign_status]?.color || 'default'}
            />
          }
          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >{moment(row.created_at).format('DD/MM/YYYY, hh:mm:ss a')}</TableCell>
          <TableCell
            sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
            align='center'
            className='p-2'
          >
            {
              isPendingEsign ? renderAuthIcon() : renderEditIcon()
            }
            <Button onClick={toggleDrawer('addDrawer', true)}>
              <IoIosAdd
                fontSize={30}
                onClick={() => {
                  console.log("Add button clicked");
                  handleDesignationDrawerOpen(row);
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
                          {
                            config?.config?.esign_status === true &&
                            <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                              E-Sign
                            </TableCell>

                          }

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
                            {
                              config?.config?.esign_status === true &&
                              <StatusChip
                                label={historyRow.esign_status}
                                color={statusObj[historyRow.esign_status]?.color || 'default'}
                              />

                            }

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

        <DesignationModal open={openModalDes}
          onClose={handleCloseModalDes}
          editData={editData}
          handleSubmitForm={handleSubmitFormDes} departmentData={departmentData}
          depData={depData}

        />

      )}
    </>
  );
};
Row.propTypes = {
  row: PropTypes.any,
  index: PropTypes.any,
  isOpen: PropTypes.any,
  handleRowToggle: PropTypes.any,
  page: PropTypes.any,
  rowsPerPage: PropTypes.any,
  handleAuthCheck: PropTypes.any,
  handleUpdate: PropTypes.any,
  designationData: PropTypes.any,
  apiAccess: PropTypes.any,
  config_dept: PropTypes.any,
  handleSortById: PropTypes.any,
  handleSortByName: PropTypes.any,
  sortDirection: PropTypes.any,
  setAlertData: PropTypes.any,
  alertData: PropTypes.any,
  getDesignations: PropTypes.any,
  departmentData: PropTypes.any,
  historyData: PropTypes.any,
};
// Now define your TableDepartment component
const TableDepartment = ({
  alertData,
  setAlertData,
  getDesignations,
  designationData,
  departmentData,
  handleUpdate,
  handleSortByLocation,
  handleSortById,
  handleSortByName,
  sortDirection,
  page,
  rowsPerPage,
  totalRecords,
  handleChangePage,
  handleChangeRowsPerPage,
  apiAccess,
  config_dept,
  handleAuthCheck
}) => {
  const [sortBy, setSortBy] = useState('');
  const [openRows, setOpenRows] = useState({});
  const [historyData, setHistoryData] = useState({});
  const handleRowToggle = async (rowId) => {
    await handleRowToggleHelper(rowId, openRows, setOpenRows, setHistoryData, '/department/history');
  };
  const handleSortBy = (value) => {
    if (value === 'Name') {
      handleSortByName();
      setSortBy('Name');
    } else if (value === 'ID') {
      handleSortById();
      setSortBy('ID');
    } else if (value === 'Location') {
      handleSortByLocation();
      setSortBy('Location');
    }
  };
  return (
    <CustomTable
      data={departmentData}
      page={page}
      rowsPerPage={rowsPerPage}
      totalRecords={totalRecords}
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
                onClick={() => handleSortBy('ID')}
              >
                Department ID
                <IconButton align='center' aria-label='expand row' size='small'>
                  {getSortIcon(sortBy, 'ID', sortDirection)}
                </IconButton>
              </TableCell>
              <TableCell
                align='center'
                sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
                style={{ cursor: 'pointer' }}
                onClick={() => handleSortBy('Name')}
              >
                Department Name
                <IconButton align='center' aria-label='expand row' size='small'>
                  {getSortIcon(sortBy, 'Name', sortDirection)}
                </IconButton>
              </TableCell>
              <TableCell
                align='center'
                sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
                style={{ cursor: 'pointer' }}
                onClick={() => handleSortBy('Location')}
              >
                Location Required
                <IconButton align='center' aria-label='expand row' size='small'>
                  {getSortIcon(sortBy, 'Location', sortDirection)}
                </IconButton>
              </TableCell>
              {config_dept?.config?.esign_status === true && <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >E-Sign</TableCell>}
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                Created At
              </TableCell>
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {departmentData?.map((item, index) => (
              <Row
                key={item.id}
                row={item}
                index={index}
                isOpen={openRows[item.id]}
                handleRowToggle={handleRowToggle}
                page={page}
                rowsPerPage={rowsPerPage}
                handleAuthCheck={handleAuthCheck}
                handleUpdate={handleUpdate}
                designationData={designationData}
                apiAccess={apiAccess}
                config_dept={config_dept}
                handleSortById={handleSortById}
                handleSortByName={handleSortByName}
                sortDirection={sortDirection}
                setAlertData={setAlertData}
                alertData={alertData}
                getDesignations={getDesignations}
                departmentData={departmentData}
                historyData={historyData}
              />
            ))}
            {departmentData?.length === 0 && (
              <TableRow sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                <TableCell colSpan={12} align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >
                  No data
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
    </CustomTable>
  );
};
TableDepartment.propTypes = {
  alertData: PropTypes.any,
  setAlertData: PropTypes.any,
  getDesignations: PropTypes.any,
  designationData: PropTypes.any,
  departmentData: PropTypes.any,
  handleUpdate: PropTypes.any,
  handleSortByLocation: PropTypes.any,
  handleSortById: PropTypes.any,
  handleSortByName: PropTypes.any,
  sortDirection: PropTypes.any,
  page: PropTypes.any,
  rowsPerPage: PropTypes.any,
  totalRecords: PropTypes.any,
  handleChangePage: PropTypes.any,
  handleChangeRowsPerPage: PropTypes.any,
  apiAccess: PropTypes.any,
  config_dept: PropTypes.any,
  handleAuthCheck: PropTypes.any
};
export default TableDepartment;