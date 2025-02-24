import React, { useState, Fragment, useEffect } from 'react';
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
import { decodeAndSetConfig } from '../../utils/tokenUtils';
import { handleRowToggleHelper } from 'src/utils/rowUtils';
import StatusChip from 'src/components/StatusChip';

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
const Row = ({ row, index, isOpen, handleRowToggle, page, rowsPerPage, handleAuthCheck, handleUpdate, designationData, apiAccess, config_dept, handleSortById, handleSortByName, sortDirection, setOpenSnackbar, setAlertData, alertData, getDesignations, departmentData, historyData,
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
  const [approveAPIName, setApproveAPIName] = useState('');
  const [approveAPImethod, setApproveAPImethod] = useState('');
  const [approveAPIEndPoint, setApproveAPIEndPoint] = useState('');
  const [eSignStatusId, setESignStatusId] = useState('');
  const [auditLogMark, setAuditLogMark] = useState('');
  const [esignDownloadPdf, setEsignDownloadPdf] = useState(false);
  const [openModalApprove, setOpenModalApprove] = useState(false);
  useEffect(() => {
    const data = getUserData();
    setUserDataPdf(data);
    decodeAndSetConfig(setConfig);
  }, [openModalDes]);

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
      setApproveAPIName('');
      setApproveAPImethod('');
      setApproveAPIEndPoint('');
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
        downloadPdf();
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
      setAlertData({ type: 'error', message: 'Authentication failed, Please try again.' });
      setOpenSnackbar(true);
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
    setApproveAPIName("designation-approve");
    setApproveAPImethod("PATCH");
    setApproveAPIEndPoint("/api/v1/designation");
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
    setDesignationId('')
    setDesignationName('')
    setErrorDesignationId({ isError: false, message: '' })
    setErrorDesignationName({ isError: false, message: '' })
    setEditData({})
  }
  const resetEditFormDes = () => {
    console.log('REset edit field')
    setDesignationName('')
    setErrorDesignationId({ isError: false, message: '' })
    setErrorDesignationName({ isError: false, message: '' })
    setEditData(prev => ({
      ...prev,
      designation_name: '',
      department_name: '',
      department_id: ''
    }))
  }
  const handleOpenModalDes = () => {
    setApproveAPIName("designation-create");
    setApproveAPImethod("POST");
    setApproveAPIEndPoint("/api/v1/designation");
    resetFormDes()
    setOpenModalDes(true)
  }
  const handleCloseModalDes = () => {
    resetFormDes()
    setOpenModalDes(false)
  }
  const applyValidation = () => {
    if (designationId.length > 20) {
      setErrorDesignationId({ isError: true, message: 'Designation ID length should be <= 20' })
    } else if (designationId.trim() === '') {
      setErrorDesignationId({ isError: true, message: "Designation ID can't be empty" })
    } 
       else if(!(/^[a-zA-Z0-9]+\s*$/.test(designationId))){
        setErrorDesignationId({ isError: true, message: "Designation ID cannot contain any special symbols" 

        })
      }

    else {
      setErrorDesignationId({ isError: false, message: '' })
    }
    if (designationName.length > 50) {
      setErrorDesignationName({ isError: true, message: 'Designation Name length should be <= 50' })
    } else if (designationName.trim() === '') {
      setErrorDesignationName({ isError: true, message: "Designation Name can't be empty" })
    } 
    
       else if(!(/^[a-zA-Z0-9]+\s*(?:[a-zA-Z0-9]+\s*)*$/.test(designationName))){
        setErrorDesignationName({ isError: true, message: "Designation Name cannot contain any special symbols" 

        })
      }
    else {
      setErrorDesignationName({ isError: false, message: '' })
    }
  }
  const checkValidate = () => {
    return !(designationId === '' || designationId.length > 20 || designationName === '' ||!(/^[a-zA-Z0-9]+\s*$/.test(designationId))||!(/^[a-zA-Z0-9]+\s*(?:[a-zA-Z0-9]+\s*)*$/.test(designationName))|| designationName.length > 50);
  };
  const handleSubmitFormDes = async () => {
    if (editData?.id) {
      setApproveAPIName("designation-update");
      setApproveAPImethod("PUT");
      setApproveAPIEndPoint("/api/v1/designation");
    } else {
      setApproveAPIName("designation-create");
      setApproveAPImethod("POST");
      setApproveAPIEndPoint("/api/v1/designation");
    }
    applyValidation()
    const validate = checkValidate()
    if (!validate) {
      return true
    }
    if (config?.config?.esign_status) {
      setAuthModalOpen(true);
      return;
    }
    const esign_status = "approved";
    editData?.id ? editDesignation() : addDesignation(esign_status);
  }
  const addDesignation = async (esign_status, remarks) => {
    try {
      const data = { designationId, designationName, departmentId: depData.id }
      console.log('Add designation data ', data)
      const auditlogRemark = remarks;
      const audit_log = config?.config?.audit_logs ? {
        "audit_log": true,
        "performed_action": "add",
        "remarks": auditlogRemark?.length > 0 ? auditlogRemark : `Designation added - ${designationId}`,
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
        setOpenSnackbar(true)
        setAlertData({ ...alertData, type: 'success', message: 'Designation added successfully' })
        getDesignations()
        resetFormDes()
      } else {
        console.log('error to add designation ', res.data)
        setOpenSnackbar(true)
        setAlertData({ ...alertData, type: 'error', message: res.data?.message })
      }
    } catch (error) {
      console.log('Erorr to add designation ', error)
      setOpenSnackbar(true)
      setAlertData({ ...alertData, type: 'error', message: 'Something went wrong' })
    } finally {
      setOpenModalDes(false)
      setIsLoading(false)
      setApproveAPIName('');
      setApproveAPImethod('');
      setApproveAPIEndPoint('');
    }
  }
  const editDesignation = async (esign_status, remarks) => {
    try {
      const data = { designationName, departmentId: depData.id }
      const auditlogRemark = remarks;
      let audit_log;
      if (config?.config?.audit_logs) {
        audit_log = {
          "audit_log": true,
          "performed_action": "edit",
          "remarks": auditlogRemark > 0 ? auditlogRemark : `Designation edited - ${designationName}`,
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
        setOpenSnackbar(true)
        setAlertData({ ...alertData, type: 'success', message: 'Designation updated successfully' })
        resetFormDes()
        getDesignations()
      } else {
        console.log('error to edit designation ', res.data)
        setOpenSnackbar(true)
        setAlertData({ ...alertData, type: 'error', message: res.data.message })
      }
    } catch (error) {
      console.log('Erorr to edit designation ', error)
      setOpenSnackbar(true)
      setAlertData({ ...alertData, type: 'error', message: 'Something went wrong' })
    } finally {
      setOpenModalDes(false)
      setIsLoading(false)
      setApproveAPIName('');
      setApproveAPImethod('');
      setApproveAPIEndPoint('');
    }
  }
  const handleUpdateDes = item => {
    resetFormDes()
    setOpenModalDes(true)
    setEditData(item)
    setDesignationId(item.designation_id)
    setDesignationName(item.designation_name)
  }
  const downloadPdf = () => {
    console.log('clicked on download btn')
    const doc = new jsPDF()
    const headerContent = () => {
      const img = new Image()
      img.src = '/images/brand.png'
      const logoWidth = 45
      const logoHeight = 28
      const logoX = doc.internal.pageSize.width - logoWidth - 12
      const logoY = 8
      doc.addImage(img, 'PNG', logoX, logoY, logoWidth, logoHeight)
      doc.setFontSize(16).setFont(undefined, 'bold').text('Designation Report', 70, 14)
      doc.setFontSize(12)
      doc.text('Designation Data', 15, 55)
    }
    const bodyContent = () => {
      let currentPage = 1
      let dataIndex = 0
      const totalPages = Math.ceil(arrayDesignation.length / 25)
      headerContent()
      while (dataIndex < arrayDesignation.length) {
        if (currentPage > 1) {
          doc.addPage()
        }
        footerContent(currentPage, totalPages)
        const body = arrayDesignation
          .slice(dataIndex, dataIndex + 25)
          .map((item, index) => [dataIndex + index + 1, item.designation_id, item.designation_name, item.esign_status]);
        autoTable(doc, {
          startY: currentPage === 1 ? 60 : 40,
          styles: { halign: 'center' },
          headStyles: {
            fontSize: 8,
            fillColor: [80, 189, 160]
          },
          alternateRowStyles: { fillColor: [249, 250, 252] },
          tableLineColor: [80, 189, 160],
          tableLineWidth: 0.1,
          head: [['Sr.No.', 'Id', 'Designation Name', 'E-Sign']],
          body: body,
          columnWidth: 'wrap'
        })
        dataIndex += 25
        currentPage++
      }
    }
    const footerContent = (pageNumber, totalPages) => {
      const currentDate = new Date()
      const formattedDate = currentDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      })
      const formattedTime = currentDate.toLocaleTimeString('en-US', { hour12: false })
      const dateTimeString = 'Generated on: \n' + formattedDate + ' at ' + formattedTime
      const userInfo = 'User: ' + userDataPdf?.userName + '\nDepartment: ' + userDataPdf?.departmentName
      doc.setFontSize(10)
      doc.text(userInfo, 20, doc.internal.pageSize.height - 15)
      doc.text(dateTimeString, 160, doc.internal.pageSize.height - 15)
      doc.text(
        `Page ${pageNumber} of ${totalPages}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      )
    }
    bodyContent()
    const currentDate = new Date()
    const formattedDate = currentDate
      .toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
      .replace(/\//g, '-')
    const formattedTime = currentDate.toLocaleTimeString('en-US', { hour12: false }).replace(/:/g, '-')
    const fileName = `Designation_${formattedDate}_${formattedTime}.pdf`
    doc.save(fileName)
  }
  const handleAuthModalOpen = () => {
    console.log("OPen auth model");
    setApproveAPIName("designation-approve");
    setApproveAPImethod("PATCH");
    setApproveAPIEndPoint("/api/v1/designation");
    setAuthModalOpen(true);
  };
  const handleDownloadPdf = () => {
    setApproveAPIName("designation-create");
    setApproveAPImethod("POST");
    setApproveAPIEndPoint("/api/v1/designation");
    if (config?.config?.esign_status) {
      console.log("Esign enabled for download pdf");
      setEsignDownloadPdf(true);
      setAuthModalOpen(true);
      return;
    }
    downloadPdf();
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
        approveAPIName={approveAPIName}
        approveAPImethod={approveAPImethod}
        approveAPIEndPoint={approveAPIEndPoint}
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
        <Modal
          open={openModalDes}
          onClose={handleCloseModalDes}
          aria-labelledby='modal-modal-title'
          aria-describedby='modal-modal-description'
        >
          <Box sx={style}>
            <Typography variant='h4' className='my-2'>
              {editData?.id ? 'Edit Designation' : 'Add Designation'}
            </Typography>
            <Grid2 container spacing={2} sx={{ margin: "0.5rem 0rem" }}>
              <Grid2 size={6}>
                <TextField
                  fullWidth
                  id='outlined-controlled'
                  label='Designation ID'
                  placeholder='Designation ID'
                  value={designationId}
                  onChange={e => {
                    setDesignationId(e.target.value)
                    e.target.value && setErrorDesignationId({ isError: false, message: '' })
                  }}
                  required={true}
                  disabled={!!editData?.id}
                  error={errorDesignationId.isError}
                  helperText={errorDesignationId.isError ? errorDesignationId.message : ''}
                />
              </Grid2>
              <Grid2 size={6}>
                <TextField
                  fullWidth
                  id='outlined-controlled'
                  label='Designation Name'
                  placeholder='Designation Name'
                  value={designationName}
                  onChange={e => {
                    setDesignationName(e.target.value)
                    e.target.value && setErrorDesignationName({ isError: false, message: '' })
                  }}
                  required={true}
                  error={errorDesignationName.isError}
                  helperText={errorDesignationName.isError ? errorDesignationName.message : ''}
                />
              </Grid2>
            </Grid2>
            <Grid2 container spacing={2} sx={{ margin: "0.5rem 0rem" }}>
              <Grid2 size={6}>


                <FormControl fullWidth>
                  <InputLabel id='label-department'>Department</InputLabel>
                  <Select
                    labelId='lable-department'
                    id='department'
                    label='Department'
                    value={depData.id}
                    disabled={!!depData.id}
                  >
                    {departmentData?.map(item => {
                      return (
                        <MenuItem key={item?.id} value={item?.id} selected={depData.id == item.id}>
                          {item?.department_name}
                        </MenuItem>
                      )
                    })}
                  </Select>
                </FormControl>
              </Grid2>
            </Grid2>

            <Grid2 item xs={12} className='my-3 '>
              <Button variant='contained' sx={{ marginRight: 3.5 }} onClick={handleSubmitFormDes}>
                Save Changes
              </Button>
              <Button
                type='reset'
                variant='outlined'
                color='primary'
                onClick={editData?.id ? resetEditFormDes : resetFormDes}
              >
                Reset
              </Button>
              <Button variant='outlined' color='error' sx={{ marginLeft: 3.5 }} onClick={() => handleCloseModalDes()}
              >
                Close
              </Button>
            </Grid2>
          </Box>
        </Modal >
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
  setOpenSnackbar: PropTypes.any,
  setAlertData: PropTypes.any,
  alertData: PropTypes.any,
  getDesignations: PropTypes.any,
  departmentData: PropTypes.any,
  historyData: PropTypes.any,
};
// Now define your TableDepartment component
const TableDepartment = ({
  setOpenSnackbar,
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
                setOpenSnackbar={setOpenSnackbar}
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
  setOpenSnackbar: PropTypes.any,
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