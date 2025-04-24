import React, { useState, Fragment, useEffect, useMemo } from 'react';
import {Box,Table,TableRow,TableHead,TableBody,TableCell,Typography,IconButton,Tooltip, Button, SwipeableDrawer, Grid2} from '@mui/material'
import { MdModeEdit } from 'react-icons/md';
import CustomTable from 'src/components/CustomTable';
import PropTypes from 'prop-types';
import { getSortIcon } from 'src/utils/sortUtils';
import moment from 'moment';
import { useLoading } from 'src/@core/hooks/useLoading';
import { useSettings } from 'src/@core/hooks/useSettings';
import { api } from 'src/utils/Rest-API';
import { IoIosAdd } from 'react-icons/io';
import { CiExport } from 'react-icons/ci';
import TableStockTranferDetail from './TableStockTranferDetail';

const Row = ({ row, index, page, rowsPerPage, handleUpdate, apiAccess }) => {
  console.log(row,'row')
   const [state, setState] = useState({ addDrawer: false })
     const [orderId,setOrderId]=useState('')
   
   const toggleDrawer = (anchor, open) => event => {
     console.log('open drawer', open)
     if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
       return
     }
     setState({ ...state, [anchor]: open })
   }
   const handleDrawerOpen = row => {
     console.log('data', row)
     setOrderId(row.id)
   }
   const list = anchor => (
 <Box sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : 800 }} role='presentation'>
 
 <Grid2 item xs={12}>
   <Typography variant='h2' className='my-3 mx-2' sx={{ fontWeight: 'bold', paddingLeft: 8,textAlign:'center' }}>
     Stock Tranfer Order Detail For: {row?.orderNo}
   </Typography>
 
   <Box
     sx={{
       position: 'relative',
       border: '1px solid #ccc',
       borderRadius: 2,
       p: 3,
       m: 4,
       backgroundColor: '#f9f9f9',
     }}
   >
    <Typography variant='h4' sx={{ fontWeight: 'bold', mb: 1 ,textAlign:'center'}}>
       Scanning Transaction
     </Typography>
     <Button
       variant='contained'
       sx={{
         position: 'absolute',
         top: 30,
         right: 16,
         zIndex: 1,
       }}
     >

       <Box sx={{ display: 'flex', alignItems: 'center' }}>
     
         <CiExport fontSize={20} />
         <span style={{ marginLeft: 6 }}>Export</span>
       </Box>
     </Button>
 
    
     <Typography variant='body1'>
       Status: <strong> 'Pending'</strong>
     </Typography>
     <Typography variant='body1'>
       User: <strong> 'N/A'</strong>
     </Typography>
   </Box>
 </Grid2>
 
 <Grid2 item xs={12}>
   <Typography variant='h4' className='mx-4 mt-3'>
                   Stock Tranfer Order Detail
                 </Typography>
   <TableStockTranferDetail orderId={orderId} />
 </Grid2>
 
 </Box>
 
   )
  return (
    <Fragment>
      <TableRow sx={{ '& > *': { borderBottom: '1px solid rgba(224, 224, 224, 1)' } }}>
        <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} align='center' component='th' scope='row' className='p-2'>
          {index + 1 + page * rowsPerPage}
        </TableCell>
       <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} align='center' className='p-2'>
                     {row.order_no}
                   </TableCell>
                   <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} align='center' className='p-2'>
                     {row.order_from_location.location_name}
                   </TableCell>
                   <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} align='center' className='p-2'>
                     {row.order_to_location.location_name}
                   </TableCell>
                   <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >
                     {moment(row?.order_date).format('DD/MM/YYYY, hh:mm:ss a')}
                   </TableCell>
                   <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >
                     {moment(row?.updated_at).format('DD/MM/YYYY, hh:mm:ss a')}
                   </TableCell>
                   <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} align='center' className='p-2'>
                   
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
          <Button onClick={toggleDrawer('addDrawer', true)}>
                          <IoIosAdd
                            fontSize={30}
                            onClick={() => {
                              console.log('Add button clicked')
                              handleDrawerOpen(row)
                            }}
                            style={{ cursor: 'pointer' }}
                          />
                        </Button>
        </TableCell>
        {orderId && (
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
    </Fragment>
  );
};
Row.propTypes = {
  row: PropTypes.any,
  index: PropTypes.any,
  page: PropTypes.any,
  rowsPerPage: PropTypes.any,
  handleUpdate: PropTypes.any,
  apiAccess: PropTypes.any,
};
const TableStocktransfer = ({
  handleUpdate,
  apiAccess,
  setStocktransfer,
  pendingAction,
  tableHeaderData,
}) => {
  const [sortBy, setSortBy] = useState('');
 
   const { settings } = useSettings();
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(settings.rowsPerPage)
    const [stocktransferData, setStocktransferData] = useState({ data: [], total: 0 })  //all Data
    const [sortDirection, setSortDirection] = useState('asc')
    const { setIsLoading } = useLoading()


   console.log("apiAccess",apiAccess)
   useMemo(()=>{
      setPage(0);    
    },[tableHeaderData,rowsPerPage]);


  useEffect(() => {
    getData()
  }, [tableHeaderData,pendingAction, page, rowsPerPage])

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }
  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleSort = (key,child) => {
    console.log('sort',key,child)
      const newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      const data=stocktransferData?.data
  
      const sorted = [...data].sort((a, b) => {
        if (!child) {
          if (key === 'updated_at' || key === 'order_date') {
            const dateA = new Date(a[key]);
            const dateB = new Date(b[key]);
            return newSortDirection === 'asc' ? dateA - dateB : dateB - dateA;
          } else {
            if (a[key] > b[key]) return newSortDirection === 'asc' ? 1 : -1;
            if (a[key] < b[key]) return newSortDirection === 'asc' ? -1 : 1;
            return 0;
          }
        }
    else{
              if (a[key][child] > b[key][child]) {
                console.log('hello')
                  return newSortDirection === 'asc' ? 1 : -1
                }
      
                if (a[key][child] < b[key][child]) {
                  return newSortDirection === 'asc' ? -1 : 1
                }
                return 0
          }
      })
    setStocktransferData({...stocktransferData,data:sorted});
    setSortDirection(newSortDirection);
    setSortBy(key);
  };
  
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
      const response = await api(`/stocktransfer-order/?${params.toString()}`, {}, 'get', true)
      console.log('GET stocktransfer-order response :- ', response.data)
      if (response?.data?.success) {
        setStocktransferData({data: response.data.data.stockTransferOrder, total:response.data.data.total})
        setStocktransfer(response.data.data.stockTransferOrder)
      } else {
        console.log('Error to get all purchase-order  ', response.data)
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
  return (
    <CustomTable
      data={stocktransferData?.data}
      totalRecords={stocktransferData?.total}
      page={page}
      rowsPerPage={rowsPerPage}
      handleChangePage={handleChangePage}
      setPage={setPage}
      setRowsPerPage={setRowsPerPage}
      handleChangeRowsPerPage={handleChangeRowsPerPage}
    >
      <Box sx={{ position: 'relative', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
        <Table stickyHeader>
          <TableHead style={{ backgroundColor: '#fff' }}>
            <TableRow sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >Sr.No.</TableCell>
               <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSort('order_no')}>
                              Order No
                              <IconButton align='center' aria-label='expand row' size='small' data-testid={`sort-icon-${sortBy}`}>
                                {getSortIcon(sortBy, 'order_no', sortDirection)}
                              </IconButton>
                            </TableCell>
                             <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSort("order_from_location","location_name")}>
                                             From
                                            <IconButton align='center' aria-label='expand row' size='small'>
                                              {getSortIcon(sortBy, 'order_from_location', sortDirection)}
                                            </IconButton>
                                          </TableCell>
                                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSort("order_to_location","location_name")}>
                                            To
                                            <IconButton align='center' aria-label='expand row' size='small'>
                                              {getSortIcon(sortBy, 'order_to_location', sortDirection)}
                                            </IconButton>
                                          </TableCell>
                                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSort('order_date')}>
                                             Order Date
                                            <IconButton align='center' aria-label='expand row' size='small'>
                                              {getSortIcon(sortBy, 'order_date', sortDirection)}
                                            </IconButton>
                                          </TableCell>
                              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSort('updated_at')} >
                              Update At
                              <IconButton align='center' aria-label='expand row' size='small'>
                                {getSortIcon(sortBy, 'updated_at', sortDirection)}
                              </IconButton>
                              </TableCell>   
                            <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >Action</TableCell>
                          </TableRow>
                        </TableHead>
          <TableBody>
            {stocktransferData?.data?.map((item, index) => (
              <Row
                key={index + 1}
                row={item}
                index={index}
                page={page}
                rowsPerPage={rowsPerPage}
                handleUpdate={handleUpdate}
                apiAccess={apiAccess}
              />
            ))}
            {stocktransferData?.data?.length === 0 && (
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
TableStocktransfer.propTypes = {
  setStocktransfer: PropTypes.any,  
  tableHeaderData: PropTypes.any,
  handleUpdate: PropTypes.any,
  apiAccess: PropTypes.any,
  pendingAction:PropTypes.any
};

export default TableStocktransfer;