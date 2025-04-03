import React, { useState, Fragment, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import Collapse from '@mui/material/Collapse';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { MdModeEdit, MdOutlineDomainVerification } from 'react-icons/md';
import ChevronUp from 'mdi-material-ui/ChevronUp';
import ChevronDown from 'mdi-material-ui/ChevronDown';
import CustomTable from 'src/components/CustomTable';
import { Tooltip } from '@mui/material';
import { statusObj } from 'src/configs/statusConfig';
import { getSortIcon } from 'src/utils/sortUtils';
import { getSerialNumber } from 'src/configs/generalConfig';
import { handleRowToggleHelper } from 'src/utils/rowUtils';
import StatusChip from 'src/components/StatusChip';
import moment from 'moment';
import { useSettings } from 'src/@core/hooks/useSettings'
import { api } from 'src/utils/Rest-API'
import { useAuth } from 'src/Context/AuthContext'
import { useLoading } from 'src/@core/hooks/useLoading'
import { useRouter } from 'next/router'

const Row = ({ row, index,page,rowsPerPage, openRows, handleRowToggle, historyData, config, handleAuthCheck, handleUpdate, apiAccess,
}) => {
  const isOpen = openRows[row.id];
  const serialNumber = getSerialNumber(index, page, rowsPerPage);
  return (
    <Fragment>
      <TableRow sx={{ '& > *': { borderBottom: '1px solid rgba(224, 224, 224, 1)' } }}>
        <TableCell className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          <IconButton align='center' aria-label='expand row' size='small' onClick={() => handleRowToggle(row.id)}>
            {isOpen ? <ChevronUp /> : <ChevronDown />}
          </IconButton>
        </TableCell>
        <TableCell
          align='center'
          component='th'
          scope='row'
          className='p-2'
          sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
        >
          {serialNumber}
        </TableCell>
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} className='p-2'>
          {row.company_id}
        </TableCell>
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} className='p-2'>
          {row.company_name}
        </TableCell>
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} className='p-2'>
          {row.mfg_licence_no}
        </TableCell>
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} className='p-2'>
          {row.email}
        </TableCell>
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} className='p-2'>
          {row.contact}
        </TableCell>
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} className='p-2'>
          {row.address}
        </TableCell>
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} className='p-2'>
          {row.gs1_prefix}
        </TableCell>
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} className='p-2'>
          {row.gs2_prefix}
        </TableCell>
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} className='p-2'>
          {row.gs3_prefix}
        </TableCell>
        {config?.config?.esign_status === true && (
          <StatusChip
            label={row.esign_status}
            color={statusObj[row.esign_status]?.color || 'default'}
          />
        )}
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >
          {moment(row?.created_at).format('DD/MM/YYYY, hh:mm:ss a')}
        </TableCell>
        <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} align='center' className='p-2'>
          {row.esign_status === 'pending' && config?.config?.esign_status === true ? (
            <span>
              <MdOutlineDomainVerification
                data-testid={`auth-check-icon-${row.id}`}
                fontSize={20}
                onClick={() => handleAuthCheck(row)}
              />
            </span>
          ) : (
            <Tooltip title={!apiAccess.editApiAccess ? 'No edit access' : ''}>
              <span>
                <MdModeEdit
                  data-testid={`edit-icon-${index + 1}`}
                  fontSize={20}
                  onClick={apiAccess.editApiAccess ? () => handleUpdate(row) : null}
                  style={{
                    cursor: apiAccess.editApiAccess ? 'pointer' : 'not-allowed',
                    opacity: apiAccess.editApiAccess ? 1 : 0.5,
                  }}
                />
              </span>
            </Tooltip>
          )}
        </TableCell>
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
                          Company ID
                        </TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                          Company Name
                        </TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                          Mfg.Lic
                        </TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                          Email
                        </TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                          Contact No.
                        </TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                          Address
                        </TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                        GS1 Prefix
                        </TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                        GS2 Prefix
                        </TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                        GS3 Prefix
                        </TableCell>
                        {config?.config?.esign_status === true && <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>E-Sign</TableCell>}
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                          Updated At
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {historyData[row.id]?.map((historyRow, idx) => (
                        <TableRow
                          key={historyRow.created_at}
                          align='center'
                          sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
                        >
                          <TableCell component='th' scope='row' align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >
                            {idx + 1}
                          </TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >{historyRow.company_id}</TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >{historyRow.company_name}</TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >{historyRow.mfg_licence_no}</TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >{historyRow.email}</TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >{historyRow.contact}</TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >{historyRow.address}</TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >{historyRow.gs1_prefix}</TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >{historyRow.gs2_prefix}</TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >{historyRow.gs3_prefix}</TableCell>
                          {config?.config?.esign_status === true && (
                            <StatusChip
                              label={historyRow.esign_status}
                              color={statusObj[historyRow.esign_status]?.color || 'default'}
                            />
                          )}
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >
                            {moment(historyRow?.created_at).format('DD/MM/YYYY, hh:mm:ss a')}
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
  );
};
Row.propTypes = {
  row: PropTypes.any,
  index: PropTypes.any,
  page: PropTypes.any,
  rowsPerPage: PropTypes.any,
  openRows: PropTypes.any,
  handleRowToggle: PropTypes.any,
  historyData: PropTypes.any,
  config: PropTypes.any,
  handleAuthCheck: PropTypes.any,
  handleUpdate: PropTypes.any,
  apiAccess: PropTypes.any,
};
const TableCompany = ({
  setCompany,
  pendingAction,
  handleUpdate,
  tableHeaderData,
  apiAccess,
  config,
  handleAuthCheck,
}) => { 
  
  const [sortBy, setSortBy] = useState('');
  const [openRows, setOpenRows] = useState({});
  const [historyData, setHistoryData] = useState({});
  const [page, setPage] = useState(0)
  const { settings } = useSettings()
  const [rowsPerPage, setRowsPerPage] = useState(settings.rowsPerPage)
  const [companyData,setCompanyData] = useState({data:[],total:0})
  const [sortDirection,setSortDirection] = useState('asc')
  const {removeAuthToken} = useAuth()
  const {setIsLoading} = useLoading();
  const router = useRouter();
  
  useEffect(() => {
    getData()
  }, [page, rowsPerPage, tableHeaderData, pendingAction])

  useMemo(()=>{
    setPage(0)
  },[tableHeaderData,rowsPerPage])

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }
  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value))
  }

  const handleSort = (key,child) => {
    const newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc'
    console.log("Code generation data :",companyData.data)
    const data=companyData?.data
    const sorted = [...data].sort((a, b) => {
        if(!child){
            if (a[key] > b[key]) {
            return newSortDirection === 'asc' ? 1 : -1
          }

          if (a[key] < b[key]) {
            return newSortDirection === 'asc' ? -1 : 1
          }
          return 0
        }
        else{
            if (a[key][child] > b[key][child]) {
                return newSortDirection === 'asc' ? 1 : -1
              }
    
              if (a[key][child] < b[key][child]) {
                return newSortDirection === 'asc' ? -1 : 1
              }
              return 0
        }
    })
    setCompanyData({...companyData,data:sorted})
    setSortDirection(newSortDirection)
    setSortBy(key)
  }

    const getData = async (pageNumber, rowsNumber, status, search) => {
     
      try {
        const params = new URLSearchParams({
          page: page + 1,
          limit: rowsPerPage === -1 ? -1 : rowsPerPage,
          search: tableHeaderData.searchVal,
          esign_status: tableHeaderData.esignStatus,
  
        });
        console.log('params', params.toString());
        const res = await api(`/company/?${params.toString()}`, {}, 'get', true)
        console.log('All company ', res.data)

        if (res.data.success) {
          setCompanyData({data:res.data.data.companies , total:res.data.data.totalRecords})
          setCompany(res.data.data.companies)
          console.log("All Company Data",res.data);
        } else {
          console.log('Error to get all company ', res.data)
          if (res.data.code === 401) {
            removeAuthToken()
            router.push('/401')
          }
        }
      } catch (error) {
        console.log('Error in get company ', error)
      }
    }

    const handleRowToggle = async (rowId) => {
      await handleRowToggleHelper(rowId, openRows, setOpenRows, setHistoryData, '/company/history');
    };
    
  return (
    <CustomTable
    data ={companyData.data}
    page={page}
    rowsPerPage={rowsPerPage}
    totalRecords={companyData.total}
    handleChangePage={handleChangePage}
    handleChangeRowsPerPage={handleChangeRowsPerPage}
    >
      <TableHead>
        <TableRow sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} />
          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >Sr.No.</TableCell>
          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSort('company_id')}>
            Company ID
            <IconButton align='center' aria-label='expand row' size='small' data-testid={`sort-icon-${sortBy}`}>
              {getSortIcon(sortBy, 'company_id', sortDirection)}
            </IconButton>
          </TableCell>
          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSort('company_name')}>
            Company Name
            <IconButton align='center' aria-label='expand row' size='small'>
              {getSortIcon(sortBy, 'company_name', sortDirection)}
            </IconButton>
          </TableCell>
          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSort('mfg_licence_no')}>
            Mfg.Lic
            <IconButton align='center' aria-label='expand row' size='small'>
              {getSortIcon(sortBy, 'mfg_licence_no', sortDirection)}
            </IconButton>
          </TableCell>
          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSort('email')}>
            Email
            <IconButton align='center' aria-label='expand row' size='small'>
              {getSortIcon(sortBy, 'email', sortDirection)}
            </IconButton>
          </TableCell>
          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSort('contact')}>
            Contact No.
            <IconButton align='center' aria-label='expand row' size='small'>
              {getSortIcon(sortBy, 'contact', sortDirection)}
            </IconButton>
          </TableCell>
          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSort('address')}>
            Address
            <IconButton align='center' aria-label='expand row' size='small'>
              {getSortIcon(sortBy, 'address', sortDirection)}
            </IconButton>
          </TableCell>
          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSort('gs1_prefix')}>
          GS1 Prefix
            <IconButton align='center' aria-label='expand row' size='small'>
              {getSortIcon(sortBy, 'gs1_prefix', sortDirection)}
            </IconButton>
          </TableCell>
          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSort('gs2_prefix')}>
          GS2 Prefix
            <IconButton align='center' aria-label='expand row' size='small'>
              {getSortIcon(sortBy, 'gs2_prefix', sortDirection)}
            </IconButton>
          </TableCell>
          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSort('gs3_prefix')}>
          GS3 Prefix
            <IconButton align='center' aria-label='expand row' size='small'>
              {getSortIcon(sortBy, 'gs3_prefix', sortDirection)}
            </IconButton>
          </TableCell>
          {config?.config?.esign_status === true && <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >E-Sign</TableCell>}
          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >Created At</TableCell>
          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
            Action
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {companyData?.data?.map((item, index) => (
          <Row
            key={index + 1}
            row={item}
            index={index}
            openRows={openRows}
            handleRowToggle={handleRowToggle}
            page={page}
            rowsPerPage={rowsPerPage}
            historyData={historyData}
            config={config}
            handleAuthCheck={handleAuthCheck}
            handleUpdate={handleUpdate}
            apiAccess={apiAccess}
          />
        ))}
        {companyData?.data?.length === 0 && (
          <TableRow sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
            <TableCell colSpan={12} align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >
              No data
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </CustomTable>
  );
};
TableCompany.propTypes = {
  setCompany:PropTypes.any,
  pendingAction:PropTypes.any,
  handleUpdate: PropTypes.any,
  tableHeaderData:PropTypes.any,
  apiAccess: PropTypes.any,
  config: PropTypes.any,
  handleAuthCheck: PropTypes.any
};
export default TableCompany;