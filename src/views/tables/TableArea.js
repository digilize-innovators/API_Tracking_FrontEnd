import React, { useState, Fragment, useEffect, useMemo } from 'react';
import { Box,Table,Collapse,TableRow,TableHead,TableBody,TableCell,Typography,IconButton,Tooltip} from '@mui/material';
import { MdModeEdit, MdOutlineDomainVerification } from 'react-icons/md';
import {ChevronUp,ChevronDown} from 'mdi-material-ui';
import CustomTable from 'src/components/CustomTable';
import PropTypes from 'prop-types';
import { statusObj } from 'src/configs/statusConfig';
import { getSortIcon } from 'src/utils/sortUtils';
import { handleRowToggleHelper } from 'src/utils/rowUtils';
import StatusChip from 'src/components/StatusChip';
import moment from 'moment';
import { useSettings } from 'src/@core/hooks/useSettings';
import { api } from 'src/utils/Rest-API';
import { useLoading } from 'src/@core/hooks/useLoading';
import { useAuth } from 'src/Context/AuthContext';
import { useRouter } from 'next/router';

const Row = ({ row, index, openRows, handleRowToggle, page, rowsPerPage, historyData, config, handleAuthCheck, handleUpdate, apiAccess }) => {
  const isOpen = openRows[row.id]
  return (
    <Fragment>
      <TableRow sx={{ '& > *': { borderBottom: '1px solid rgba(224, 224, 224, 1)' } }}>
        <TableCell className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          <IconButton align='center' aria-label='expand row' size='small' onClick={() => handleRowToggle(row?.id)}>
            {isOpen ? <ChevronUp /> : <ChevronDown />}
          </IconButton>
        </TableCell>
        <TableCell align='center' component='th' scope='row' className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          {index + 1 + page * rowsPerPage}
        </TableCell>

        <TableCell align='center' className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          {row?.area_id}
        </TableCell>

        <TableCell align='center' className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          {row?.area_name}
        </TableCell>
        <TableCell align='center' className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          {row.area_category.history[0].area_category_name}
          
        </TableCell>
        <TableCell align='center' className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          {row.location.history[0].location_name}
        </TableCell>

        {config?.config?.esign_status === true && (
          <StatusChip
            label={row?.esign_status}
            color={statusObj[row?.esign_status]?.color || 'default'}
          />
        )}

        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          {moment(row?.created_at).format('DD/MM/YYYY, hh:mm:ss a')}
        </TableCell>

        <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} align='center' className='p-2'>
          {row?.esign_status === 'pending' && config?.config?.esign_status === true ? (
            <span>
              <MdOutlineDomainVerification fontSize={20} onClick={() => handleAuthCheck(row)}/>
            </span>
          ) : (
            <Tooltip title={!apiAccess.editApiAccess ? 'No edit access' : ''}>
              <span>
                <MdModeEdit
                  data-testid={`edit-icon-${index + 1}`}
                  fontSize={20}
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
                <Box style={{ display: 'flex', justifyContent: 'center' }}>
                  <Table size='small' aria-label='purchases'>
                    <TableHead>
                      <TableRow>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Sr.No.</TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Area ID</TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Area Name</TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Area Category</TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Location Name</TableCell>

                        {config?.config?.esign_status === true && <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>E-Sign</TableCell>}
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Updated At</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {historyData[row?.id]?.map((historyRow, idx) => (
                        <TableRow key={historyRow.created_at} align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                          <TableCell component='th' scope='row' align='center'>
                            {idx + 1}
                          </TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>{historyRow.area_id}</TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>{historyRow.area_name}</TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>{historyRow.area_category?.history[0].area_category_name}</TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>{historyRow.location.history[0].location_name}</TableCell>

                          {config?.config?.esign_status === true && (
                            <StatusChip
                              label={historyRow.esign_status}
                              color={statusObj[historyRow.esign_status]?.color || 'default'}
                            />
                          )}
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
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
  apiAccess: PropTypes.any
};

const TableArea = ({
  pendingAction,
  handleUpdate,
  setArea,
  apiAccess,
  config,
  handleAuthCheck,
  tableHeaderData

}) => {
  const [sortBy, setSortBy] = useState('');
  const [openRows, setOpenRows] = useState({});
  const [historyData, setHistoryData] = useState({});
  const [page, setPage] = useState(0)
  const { settings } = useSettings()
  const [sortDirection, setSortDirection] = useState('asc')
  const [rowsPerPage, setRowsPerPage] = useState(settings.rowsPerPage)
  const { setIsLoading } = useLoading()
  const { removeAuthToken } = useAuth()
  const router=useRouter()
  const [areaData, setAreaData] = useState({data:[],total:0})


  const handleRowToggle = async (rowId) => {
    await handleRowToggleHelper(rowId, openRows, setOpenRows, setHistoryData, '/area/history');
  };

  useMemo(()=>{
    setPage(0)
  },[tableHeaderData,rowsPerPage])

  const getData = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage === -1 ? -1 : rowsPerPage,
        search: tableHeaderData.searchVal,
        esign_status: tableHeaderData.esignStatus
      })
      const response = await api(`/area/?${params.toString()}`, {}, 'get', true)
      if (response.data.success) {
        console.log("Res of area ",response.data.data.areas)
        setAreaData({data:response.data.data.areas,total:response.data.data.total})
        setArea(response.data.data.areas)
      }
      else {
        console.log('Error to get all areas ', response.data)
        if (response.data.code === 401) {
          removeAuthToken();
          router.push('/401');
        }
      }
    } catch (error) {
      console.log('Error in get areas ', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getData();
  }, [tableHeaderData,page,rowsPerPage,pendingAction])

  const handleSort = (key,child) => {
    const newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    const data=areaData?.data

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
    setAreaData({...areaData,data:sorted});
  setSortDirection(newSortDirection);
  setSortBy(key);
};
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  return (
    <CustomTable
      data={areaData?.data}
      totalRecords={areaData?.total}
      page={page}
      rowsPerPage={rowsPerPage}
      setPage={setPage}
      setRowsPerPage={setRowsPerPage}
      handleChangePage={handleChangePage}
      handleChangeRowsPerPage={handleChangeRowsPerPage}
    >
      <Box sx={{ position: 'relative', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
        <Table stickyHeader >
          <TableHead style={{ backgroundColor: '#fff', height: '60px' }}>
            <TableRow sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
              <TableCell className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} />
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Sr.No.</TableCell>
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} onClick={() => handleSort('area_id')}>
                Area ID
                <IconButton align='center' aria-label='expand row' size='small' data-testid={`sort-icon-${sortBy}`}>
                  {getSortIcon(sortBy, 'area_id', sortDirection)}
                </IconButton>
              </TableCell>
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} onClick={() => handleSort('area_name')}>
                Area Name
                <IconButton align='center' aria-label='expand row' size='small'>
                  {getSortIcon(sortBy, 'area_name', sortDirection)}
                </IconButton>
              </TableCell>
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} onClick={() => handleSort("area_category",'area_category_name')}>
                Area Category
                <IconButton align='center' aria-label='expand row' size='small'>
                  {getSortIcon(sortBy, 'area_category', sortDirection)}
                </IconButton>
              </TableCell>
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} onClick={() => handleSort('location','location_name')}>
                Location Name
                <IconButton align='center' aria-label='expand row' size='small'>
                  {getSortIcon(sortBy, 'location', sortDirection)}
                </IconButton>
              </TableCell>
              {config?.config?.esign_status === true && <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>E-Sign</TableCell>}
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Created At</TableCell>
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {areaData.data?.map((item, index) => (
              <Row
                key={item.id}
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
            {areaData?.length === 0 && (
              <TableRow sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                <TableCell colSpan={12} align='center'>
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
TableArea.propTypes = {
  handleUpdate: PropTypes.any,
  tableHeaderData:PropTypes.any,
  setArea:PropTypes.any,
  pendingAction:PropTypes.any,
  apiAccess: PropTypes.any,
  config: PropTypes.any,
  handleAuthCheck: PropTypes.any
};
export default TableArea;