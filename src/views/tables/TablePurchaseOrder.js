import React, { useState, Fragment, useEffect, useMemo } from 'react';
import {Box,Table,TableRow,TableHead,Grid2,TableBody,TableCell,Typography,IconButton,Tooltip, Button, SwipeableDrawer} from '@mui/material'
import { MdModeEdit } from 'react-icons/md';
import CustomTable from 'src/components/CustomTable';
import PropTypes from 'prop-types';
import { getSortIcon } from 'src/utils/sortUtils';
import moment from 'moment';
import { useLoading } from 'src/@core/hooks/useLoading';
import { useSettings } from 'src/@core/hooks/useSettings';
import { api } from 'src/utils/Rest-API';
import { CiExport } from 'react-icons/ci';
import TablePurchaseDetail from './TablePurchaseDetail';
import { id } from 'date-fns/locale';
import { MdVisibility } from 'react-icons/md';
import TableTransactionPurchase from './TableTransactionPurchase';
import { useAuth } from 'src/Context/AuthContext';
import downloadPdf from 'src/utils/DownloadPdf';


const Row = ({ row, index, page, rowsPerPage, handleUpdate, apiAccess,handleView,purchaseDetail }) => {
    const [state, setState] = useState({ addDrawer: false })
    const [orderId,setOrderId]=useState('')
    const [orderDetail,setOrderDetail] =useState([])
      const [userDataPdf, setUserDataPdf] = useState()
      const { getUserData } = useAuth()
  

   const tableBody = orderDetail?.map((item, index) => [
        index + 1,
        item.product_name,
        item.batch_no,
        item.qty,
        0,
      ])
    
      const tableData = useMemo(
        () => ({
          tableHeader: ['Sr.No.', 'Product','Batch', 'Total Quantity', 'Scanned Quantity'],
          tableHeaderText: `Purchase Order`,
          tableBodyText: `${row.order_no} list`,
          filename: `PurchaseOrder_${row.order_no}`
        }),[])
        
  const toggleDrawer = (anchor, open) => event => {
    console.log('open drawer', open)
    if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return
    }
    setState({ ...state, [anchor]: open })
  }
  const handlePurchaseDrawerOpen = row => {
    console.log('data', row)
    setOrderId(row,id)
  }
  const handleDownloadPdf = () => {
    let data = getUserData()
    setUserDataPdf(data)
    downloadPdf(tableData, null, tableBody, orderDetail, userDataPdf)
  }
  const list = anchor => (
<Box sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : 800 }} role='presentation'>

<Grid2 item xs={12}>
  <Typography variant='h2' className='my-3 mx-2' sx={{ fontWeight: 'bold', paddingLeft: 8 }}>
    Purchase Order Detail 
  </Typography>

  <Box
  sx={{ 
    px: 6,
    mx: 3,

  }}
>
  

  {/* Row with left and right sides */}
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'column',
      alignItems: 'flex-start',
      mb: 2,
    }}
  >
    {/* Left side: Order No and Order Date */}
    <Box>
      <Typography variant='body1' sx={{fontSize:16}}>
      <Box component="span" sx={{ fontWeight: 'bold' }}>Order No:</Box> {row.order_no}
      </Typography>
      <Typography variant='body1' sx={{fontSize:16}}>
      <Box component="span" sx={{ fontWeight: 'bold' }}>Order Date:</Box>  {moment(row.order_date).format('DD-MM-YYYY')}
      </Typography>
      <Typography variant='body1' sx={{fontSize:16}}>
      <Box component="span" sx={{ fontWeight: 'bold' }}> From:</Box>  {row.order_from_location.location_name}
      </Typography>
      <Typography variant='body1' sx={{fontSize:16}}>
      <Box component="span" sx={{ fontWeight: 'bold' }}> To: </Box>{row.order_to_location.location_name}
      </Typography>
    </Box>
  </Box>

</Box>
</Grid2>
    <Button  variant='contained'
            sx={{
              ml:8,
              my:6
            }}
            onClick={handleDownloadPdf}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CiExport fontSize={20} />
              <span style={{ marginLeft: 6 }}>Export</span>
            </Box>
          </Button>
          <Button  variant='contained'
            sx={{
              ml:8,
              my:6
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ marginLeft: 6 }}>Invoice</span>
            </Box>
          </Button>
          
<Grid2 item xs={12}>
   <Typography variant='h4' className='mx-4 mt-3'sx={{mb:3}}> Transaction Detail</Typography>
  <TableTransactionPurchase  />
</Grid2>
<Grid2 item xs={12}>
  <TablePurchaseDetail orderId={orderId} purchaseDetail={purchaseDetail} setOrderDetail={setOrderDetail}/>
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
        <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} align='center' className='p-2'>
          {row.status}
        </TableCell>
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >
          {moment(row?.order_date).format('DD/MM/YYYY, hh:mm:ss a')}
        </TableCell>
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >
          {moment(row?.updated_at).format('DD/MM/YYYY, hh:mm:ss a')}
        </TableCell>
        <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} align='center' className='p-2'>
        
            <Tooltip title={!apiAccess.editApiAccess || row.status !== "CREATED" && 'No edit access'}>
              <span>
                <MdModeEdit
                  fontSize={20}
                  data-testid={`edit-icon-${index + 1}`}
                  onClick={apiAccess.editApiAccess && row.status === 'CREATED' ? () => handleUpdate(row) : null}
                  style={{ cursor: apiAccess.editApiAccess  &&  row.status === 'CREATED'? 'pointer' : 'not-allowed', opacity: apiAccess.editApiAccess ? 1 : 0.5 }}
                />
              </span>
            </Tooltip>
          <Button onClick={toggleDrawer('addDrawer', true)}>
              <MdVisibility
                fontSize={24}
                onClick={() => {
                  console.log('Add button clicked')
                  handleView(row)
                  handlePurchaseDrawerOpen(row)
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
  handleRowToggle: PropTypes.any,
  handleUpdate: PropTypes.any,
  apiAccess: PropTypes.any,
  handelView:PropTypes.any,
  purchaseDetail:PropTypes.any
};
const TablePurchaseOrder = ({
  handleUpdate,
  apiAccess,
  setPurchaseOrder,
  pendingAction,
  tableHeaderData,
  purchaseDetail,
  handleView,

}) => {
  const [sortBy, setSortBy] = useState('');
   const { settings } = useSettings();
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(settings.rowsPerPage)
    const [purchaseOrderData, setPurchaseOrderData] = useState({ data: [], total: 0 })  //all Data
    const [sortDirection, setSortDirection] = useState('asc')
    const { setIsLoading } = useLoading()

   useMemo(()=>{
      setPage(0);    
    },[tableHeaderData,rowsPerPage]);

const handleSort = (key,child) => {
  console.log('sort',key,child)
    const newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    const data=purchaseOrderData?.data

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
  setPurchaseOrderData({...purchaseOrderData,data:sorted});
  setSortDirection(newSortDirection);
  setSortBy(key);
};

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
  
  const getData = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage === -1 ? -1 : rowsPerPage,
        search: tableHeaderData.searchVal,
        esign_status: tableHeaderData.esignStatus
      });
      const response = await api(`/purchase-order/?${params.toString()}`, {}, 'get', true)
      console.log('GET purchase-order response :- ', response.data)
      if (response?.data?.success) {
        setPurchaseOrderData({data: response.data.data.purchaseOrders, total:response.data.data.total})
        setPurchaseOrder(response.data.data.purchaseOrders)
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
      data={purchaseOrderData?.data}
      totalRecords={purchaseOrderData?.total}
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
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSort("status")}>
                Status
                <IconButton align='center' aria-label='expand row' size='small'>
                  {getSortIcon(sortBy, 'status', sortDirection)}
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
            {purchaseOrderData?.data?.map((item, index) => (
              <Row
                key={index + 1}
                row={item}
                index={index}
                page={page}
                rowsPerPage={rowsPerPage}
                handleUpdate={handleUpdate}
                apiAccess={apiAccess}
                handleView={handleView}
                purchaseDetail={purchaseDetail}
              />
            ))}
            {purchaseOrderData?.data?.length === 0 && (
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
TablePurchaseOrder.propTypes = {
 setPurchaseOrder: PropTypes.any,  
  tableHeaderData: PropTypes.any,
  handleUpdate: PropTypes.any,
  apiAccess: PropTypes.any,
  pendingAction:PropTypes.any,
  purchaseDetail:PropTypes.any,
  handleView:PropTypes.any
};

export default TablePurchaseOrder;