import React, { useState, Fragment, useEffect, useMemo } from 'react';
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
import PropTypes from 'prop-types';
import { statusObj } from 'src/configs/statusConfig';
import { getSortIcon } from 'src/utils/sortUtils';
import { handleRowToggleHelper } from 'src/utils/rowUtils';
import StatusChip from 'src/components/StatusChip';
import moment from 'moment';
import { useLoading } from 'src/@core/hooks/useLoading';
import { useSettings } from 'src/@core/hooks/useSettings';
import { api } from 'src/utils/Rest-API';

const Row = ({ row, index, page, rowsPerPage, openRows, handleRowToggle, historyData, config, handleAuthCheck, handleUpdate, apiAccess }) => {
  const isOpen = openRows[row.id];
  return (
    <Fragment>
      <TableRow sx={{ '& > *': { borderBottom: '1px solid rgba(224, 224, 224, 1)' } }}>
        <TableCell className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          <IconButton align='center' aria-label='expand row' size='small' onClick={() => handleRowToggle(row.id)}>
            {isOpen ? <ChevronUp /> : <ChevronDown />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} align='center' component='th' scope='row' className='p-2'>
          {index + 1 + page * rowsPerPage}
        </TableCell>
        <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} align='center' className='p-2'>
          {row.location_id}
        </TableCell>
        <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} align='center' className='p-2'>
          {row.location_name}
        </TableCell>
        <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} align='center' className='p-2'>
          {row.mfg_licence_no}
        </TableCell>
        <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} align='center' className='p-2'>
          {row.mfg_name}
        </TableCell>
        <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} align='center' className='p-2'>
          {row.address}
        </TableCell>

        {config?.config?.esign_status === true && config?.role!=='admin' && (
          <StatusChip
            label={row.esign_status}
            color={statusObj[row.esign_status]?.color || 'default'}
          />
        )}
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >
          {moment(row?.created_at).format('DD/MM/YYYY, hh:mm:ss a')}
        </TableCell>
        <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} align='center' className='p-2'>
          {row.esign_status === 'pending' && config?.config?.esign_status === true && config?.role!=='admin' ? (
            <span>
              <MdOutlineDomainVerification
                fontSize={20}
                data-testid={`auth-check-icon-${row.id}`}
                onClick={() => handleAuthCheck(row)}
              />
            </span>
          ) : (
            <Tooltip title={!apiAccess.editApiAccess ? 'No edit access' : ''}>
              <span>
                <MdModeEdit
                  fontSize={20}
                  data-testid={`edit-icon-${index + 1}`}
                  onClick={apiAccess.editApiAccess ? () => handleUpdate(row) : null}
                  style={{ cursor: apiAccess.editApiAccess ? 'pointer' : 'not-allowed', opacity: apiAccess.editApiAccess ? 1 : 0.5 }}
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
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <Table size='small' aria-label='purchases'>
                    <TableHead>
                      <TableRow>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Sr.No.</TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Location ID</TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Location Name</TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Mfg. Licence No.</TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Mfg. Name</TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Address</TableCell>
                        {config?.config?.esign_status === true  && config?.role!=='admin' && <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>E-Sign</TableCell>}
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Updated At</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {historyData[row.id]?.map((historyRow, idx) => (
                        <TableRow key={historyRow.created_at} align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                          <TableCell component='th' scope='row' align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >
                            {idx + 1}
                          </TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >{historyRow.location_id}</TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >{historyRow.location_name}</TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >{historyRow.mfg_licence_no}</TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >{historyRow.mfg_name}</TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >{historyRow.address}</TableCell>
                          {config?.config?.esign_status === true && config?.role!=='admin' && (
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
                </div>
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
const TableCollapsiblelocation = ({
  handleUpdate,
  apiAccess,
  config,
  handleAuthCheck,
  setLocation,
  pendingAction,
  tableHeaderData,
}) => {
  const [sortBy, setSortBy] = useState('');
  const [openRows, setOpenRows] = useState({});
  const [historyData, setHistoryData] = useState({});

   const { settings } = useSettings();
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(settings.rowsPerPage)
    const [locationData, setLocationData] = useState({ data: [], total: 0 })  //all Data
    const [sortDirection, setSortDirection] = useState('asc')
    const { setIsLoading } = useLoading()

  const handleRowToggle = async (rowId) => {
    await handleRowToggleHelper(rowId, openRows, setOpenRows, setHistoryData, '/location/history');
  };

   useMemo(()=>{
      setPage(0);
      console.log("tableHeaderData.searchVal",tableHeaderData.searchVal)
    
    },[tableHeaderData]);

  const handleSort = key => {
    const newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc'
    const sorted = [...locationData?.data].sort((a, b) => {
      if (a[key] > b[key]) {
        return newSortDirection === 'asc' ? 1 : -1
      }
      if (a[key] < b[key]) {
        return newSortDirection === 'asc' ? -1 : 1
      }
      return 0
    })
    setLocationData({ ...locationData, data: sorted })
    setSortDirection(newSortDirection)
    setSortBy(key)
    console.log("locationData :-> ", locationData);
    
  }

  useEffect(() => {
    getData()
    
  }, [tableHeaderData,pendingAction, page, rowsPerPage])

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }
  const handleChangeRowsPerPage = event => {
    const newRowsPerPage = parseInt(event.target.value, 10)
    setRowsPerPage(newRowsPerPage)
    setPage(0)
  }
  
  const getData = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage === -1 ? -1 : rowsPerPage,
        search: tableHeaderData.searchVal,
        esign_status: tableHeaderData.esignStatus
      })
      console.log(params.toString())
      const response = await api(`/location/?${params.toString()}`, {}, 'get', true)
      console.log('GET Location data response :- ', response.data)
      if (response?.data?.success) {
        setLocationData({data: response.data.data.locations, total:response.data.data.total})
        setLocation(response.data.data.locations)
      } else {
        console.log('Error to get all locations ', response.data)
        if (response.data.code === 401) {
          removeAuthToken();
          router.push('/401');
        }
      }
    } catch (error) {
      console.log(error)
      console.log('Error in get locations ', error)
    } finally {
      setIsLoading(false)
    }
  }

  // const handleSortBy = (value) => {
  //   if (value === 'ID') {
  //     handleSortByID();
  //     setSortBy('ID');
  //   } else if (value === 'Name') {
  //     handleSortByName();
  //     setSortBy('Name');
  //   } else if (value === 'Mfg') {
  //     handleSortByMfgLicNo();
  //     setSortBy('Mfg');
  //   } else if (value === 'MfgName') {
  //     handleSortByMfgName();
  //     setSortBy('MfgName');
  //   } else if (value === 'Address') {
  //     handleSortByAddress();
  //     setSortBy('Address');
  //   }
  // };

  return (
    <CustomTable
      locationData={locationData?.data}
      totalRecords={locationData?.total}
      page={page}
      rowsPerPage={rowsPerPage}
      handleChangePage={handleChangePage}
      handleChangeRowsPerPage={handleChangeRowsPerPage}
    >
      <Box sx={{ position: 'relative', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
        <Table stickyHeader>
          <TableHead style={{ backgroundColor: '#fff' }}>
            <TableRow sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
              <TableCell className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} />
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >Sr.No.</TableCell>
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSort('location_id')}>
                Location ID
                <IconButton align='center' aria-label='expand row' size='small' data-testid={`sort-icon-${sortBy}`}>
                  {getSortIcon(sortBy, 'location_id', sortDirection)}
                </IconButton>
              </TableCell>
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSort('location_name')}>
                Location Name
                <IconButton align='center' aria-label='expand row' size='small'>
                  {getSortIcon(sortBy, 'location_name', sortDirection)}
                </IconButton>
              </TableCell>
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSort('mfg_licence_no')}>
                Mfg. Licence No.
                <IconButton align='center' aria-label='expand row' size='small'>
                  {getSortIcon(sortBy, 'mfg_licence_no', sortDirection)}
                </IconButton>
              </TableCell>
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSort('mfg_name')}>
                Mfg. Name
                <IconButton align='center' aria-label='expand row' size='small'>
                  {getSortIcon(sortBy, 'mfg_name', sortDirection)}
                </IconButton>
              </TableCell>
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSort('address')}>
                Address
                <IconButton align='center' aria-label='expand row' size='small'>
                  {getSortIcon(sortBy, 'address', sortDirection)}
                </IconButton>
              </TableCell>
              {config?.config?.esign_status === true && config?.role!=='admin' && <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >E-Sign</TableCell>}
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >Created At</TableCell>
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {locationData?.data?.map((item, index) => (
              <Row
                key={index + 1}
                row={item}
                index={index}
                page={page}
                rowsPerPage={rowsPerPage}
                openRows={openRows}
                handleRowToggle={handleRowToggle}
                historyData={historyData}
                config={config}
                handleAuthCheck={handleAuthCheck}
                handleUpdate={handleUpdate}
                apiAccess={apiAccess}
              />
            ))}
            {locationData?.data?.length === 0 && (
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
TableCollapsiblelocation.propTypes = {
  setLocation: PropTypes.any,  
  tableHeaderData: PropTypes.any,
  handleUpdate: PropTypes.any,
  apiAccess: PropTypes.any,
  config: PropTypes.any,
  handleAuthCheck: PropTypes.any,
  pendingAction:PropTypes.any

};

export default TableCollapsiblelocation;