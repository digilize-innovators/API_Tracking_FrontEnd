import React, { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Table,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Typography,
  IconButton,
  Tooltip,
  Button,
  SwipeableDrawer,
  Grid2
} from '@mui/material'
import { MdModeEdit,MdVisibility } from 'react-icons/md'
import CustomTable from 'src/components/CustomTable'
import PropTypes from 'prop-types'
import { getSortIcon } from 'src/utils/sortUtils'
import moment from 'moment'
import { useLoading } from 'src/@core/hooks/useLoading'
import { useSettings } from 'src/@core/hooks/useSettings'
import { api } from 'src/utils/Rest-API'
import { CiExport } from 'react-icons/ci'
import TableSaleDetail from './TableSaleDetail'
import TableSaleTransaction from './TableSaleTransaction'
import { useAuth } from 'src/Context/AuthContext'
import downloadPdf from 'src/utils/DownloadPdf'
import { useRouter } from 'next/router'
import SnackbarAlert from 'src/components/SnackbarAlert'
import { sortData } from 'src/utils/sortData'

const Row = ({ row, index, page, rowsPerPage, handleUpdate, apiAccess }) => {
  const [state, setState] = useState({ addDrawer: false })
  const [orderId, setOrderId] = useState('')
  const [saleDetail, setSaleDetail] = useState('')
  const [status, setStatus] = useState(false)
  const [orderDetail, setOrderDetail] = useState([])
  const [alertData, setAlertData] = useState({ openSnackbar: false, type: '', message: '', variant: 'filled' })
  const [userDataPdf, setUserDataPdf] = useState()
  const { setIsLoading } = useLoading()
  const { removeAuthToken, getUserData } = useAuth()
  const router = useRouter()

  const getTractionDetail = async id => {
    try {
      setIsLoading(true)
      const res = await api(`/sales-order/transaction-details/${id}`, {}, 'get', true)
      setIsLoading(false)
      if (res.data.success) {
        
        setSaleDetail(res?.data.data)

        setStatus(
         res.data.data.transactions.length>0 && res.data.data.transactions.every(item => item.status === 'COMPLETED') && row.status !== 'INVOICE_GENERATED'
        )
      } else if (res.data.code === 401) {
        removeAuthToken()
        router.push('/401')
      }
    } catch (error) {
      console.log('Error in get sales-order transaction info ', error)
      setIsLoading(false)
    }
  }
  useEffect(() => {
    let data = getUserData()
    setUserDataPdf(data)
  }, [])

  const tableBody = orderDetail?.map((item, index) => [
    index + 1,
    item.product_name,
    item.batch_no,
    item.qty,
    item.o_scan_qty
  ])

  const tableData = useMemo(
    () => ({
      tableHeader: ['Sr.No.', 'Product', 'Batch', 'Total Quantity', 'Scanned Quantity'],
      tableHeaderText: `Sale Order`,
      tableBodyText: `${row.order_no} list`,
      filename: `SaleOrder_${row.order_no}`
    }),
    []
  )

  const toggleDrawer = (anchor, open) => event => {
    if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return
    }
    setState({ ...state, [anchor]: open })
  }
  const handleDrawerOpen = row => {
    setOrderId(row.id)
  }

  const handleDownloadPdf = () => {
    downloadPdf(tableData, null, tableBody, orderDetail, userDataPdf)
  }
  const closeSnackbar = () => {
    setAlertData({ ...alertData, openSnackbar: false })
  }
  const handleGenerate = async () => {
    try {
      const data = { orderId: orderId }
      setIsLoading(true)
      const res = await api('/sales-order/generate-invoice/', data, 'post', true);
      setIsLoading(false)
      if (res?.data?.success) {
        setAlertData({ ...alertData, openSnackbar: true, type: 'success', message: 'Invoice Generated successfully' })
        setStatus(false)
      }
        else if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        } else if (res.data.code === 409) {
          setAlertData({ ...alertData, openSnackbar: true, type: 'error', message: res.data.message })
        }
       else {
        setAlertData({ ...alertData, openSnackbar: true, type: 'error', message: res.data?.message })
      }
    } catch (error) {
      console.log('Error in add locaiton ', error)
      router.push('/500')
    } finally {
      setIsLoading(false)
    }
  }
  const list = anchor => (
    <Box sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : 800 }}>
      <Grid2 item xs={12}>
        <Typography variant='h2' className='my-3 mx-2' sx={{ fontWeight: 'bold', paddingLeft: 8 }}>
          Sale Order Detail
        </Typography>

        <Box
          sx={{
            px: 6,
            mx: 3
          }}
        >
          {/* Row with left and right sides */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'column',
              alignItems: 'flex-start',
              mb: 2
            }}
          >
            {/* Left side: Order No and Order Date */}
            <Box>
              <Typography variant='body1' sx={{ fontSize: 16 }}>
                <Box component='span' sx={{ fontWeight: 'bold' }}>
                  Order No:
                </Box>{' '}
                {row.order_no}
              </Typography>
              <Typography variant='body1' sx={{ fontSize: 16 }}>
                <Box component='span' sx={{ fontWeight: 'bold' }}>
                  Order Date:
                </Box>{' '}
                {moment(row.order_date).format('DD-MM-YYYY')}
              </Typography>
              <Typography variant='body1' sx={{ fontSize: 16 }}>
                <Box component='span' sx={{ fontWeight: 'bold' }}>
                  
                  From:
                </Box>
                {row.order_from_location.location_name}
              </Typography>
              <Typography variant='body1' sx={{ fontSize: 16 }}>
                <Box component='span' sx={{ fontWeight: 'bold' }}>
                
                  To:
                </Box>
                {row.order_to_location.location_name}
              </Typography>
              <Typography variant='body1' sx={{ fontSize: 16 }}>
                <Box component='span' sx={{ fontWeight: 'bold' }}>
                
                  Status:
                </Box>
                {row.status}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Grid2>
      <Button
        variant='contained'
        sx={{
          ml: 8,
          my: 6
        }}
        onClick={handleDownloadPdf}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CiExport fontSize={20} />
          <span style={{ marginLeft: 6 }}>Export</span>
        </Box>
      </Button>
      <Button
        variant='contained'
        sx={{
          ml: 8,
          my: 6
        }}
        disabled={!status}
         onClick={handleGenerate}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ marginLeft: 6 }}> Generate Invoice </span>
        </Box>
      </Button>

      <Grid2 item xs={12}>
        <Typography variant='h4' className='mx-4 mt-3' sx={{ mb: 3 }}>
         
          Transaction Detail
        </Typography>
        <TableSaleTransaction saleDetail={saleDetail} />
      </Grid2>
      <Grid2 item xs={12}>
        <TableSaleDetail
          saleDetail={saleDetail}
          setOrderDetail={setOrderDetail}
          orderDetail={row}
          userDataPdf={userDataPdf}
          setAlertData={setAlertData}
        />
      </Grid2>
      <SnackbarAlert openSnackbar={alertData.openSnackbar} closeSnackbar={closeSnackbar} alertData={alertData} />
    </Box>
  )

  return (
   
      <TableRow sx={{ '& > *': { borderBottom: '1px solid rgba(224, 224, 224, 1)' } }}>
        <TableCell
          sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
          align='center'
          component='th'
          scope='row'
          className='p-2'
        >
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
          {row.order_type}
        </TableCell>
        <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} align='center' className='p-2'>
          {row.status}
        </TableCell>
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          {moment(row?.order_date).format('DD/MM/YYYY, hh:mm:ss a')}
        </TableCell>
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          {moment(row?.updated_at).format('DD/MM/YYYY, hh:mm:ss a')}
        </TableCell>
        <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} align='center' className='p-2'>
          <Tooltip title={!apiAccess.editApiAccess || row.status !== 'CREATED' && 'No edit access'}>
            <span>
              <MdModeEdit
                fontSize={20}
                data-testid={`edit-icon-${index + 1}`}
                onClick={
                  apiAccess.editApiAccess && row.status === 'CREATED' ? () => handleUpdate(row) : null
                }
                style={{
                  cursor: apiAccess.editApiAccess && row.status === 'CREATED' ? 'pointer' : 'not-allowed',
                  opacity: apiAccess.editApiAccess ? 1 : 0.5
                }}
              />
            </span>
          </Tooltip>
          <Button onClick={toggleDrawer('addDrawer', true)}>
            <MdVisibility
              fontSize={24}
              onClick={() => {
                handleDrawerOpen(row)
                getTractionDetail(row.id)
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
  )
}
Row.propTypes = {
  row: PropTypes.any,
  index: PropTypes.any,
  page: PropTypes.any,
  rowsPerPage: PropTypes.any,
  handleUpdate: PropTypes.any,
  apiAccess: PropTypes.any
}
const TableSaleOrder = ({ handleUpdate, apiAccess, setSaleOrder, pendingAction, tableHeaderData }) => {
  const [sortBy, setSortBy] = useState('')
  const { settings } = useSettings()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(settings.rowsPerPage)
  const [orderSaleData, setOrderSaleData] = useState({ data: [], total: 0 }) //all Data
  const [sortDirection, setSortDirection] = useState('asc')
  const { setIsLoading } = useLoading()

  useMemo(() => {
    setPage(0)
  }, [tableHeaderData, rowsPerPage])

  const handleSort = (path) => {
   const newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    const data = orderSaleData?.data || [];
    const sortedData = sortData(data, path, newSortDirection);
    setOrderSaleData(prev => ({ ...prev, data: sortedData }))
    setSortDirection(newSortDirection)
    setSortBy(path)
  }

  useEffect(() => {
    getData()
  }, [tableHeaderData, pendingAction, page, rowsPerPage])

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
        esign_status: tableHeaderData.esignStatus,
        type: tableHeaderData.orderTypeFilter
      });
      const response = await api(`/sales-order/?${params.toString()}`, {}, 'get', true)
      if (response?.data?.success) {
        setOrderSaleData({ data: response.data.data.orders, total: response.data.data.total })
        setSaleOrder(response.data.data.orders)
      } else if (response.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      
    } catch (error) {
      console.log('Error in get locations ', error)
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <CustomTable
      data={orderSaleData?.data}
      totalRecords={orderSaleData?.total}
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
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                Sr.No.
              </TableCell>
              <TableCell
                align='center'
                sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
                style={{ cursor: 'pointer' }}
                onClick={() => handleSort('order_no')}
              >
                Order No
                <IconButton align='center' aria-label='expand row' size='small' data-testid={`sort-icon-${sortBy}`}>
                  {getSortIcon(sortBy, 'order_no', sortDirection)}
                </IconButton>
              </TableCell>
              <TableCell
                align='center'
                sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
                style={{ cursor: 'pointer' }}
                onClick={() => handleSort('order_from_location.location_name')}
              >
                From
                <IconButton align='center' aria-label='expand row' size='small'>
                  {getSortIcon(sortBy, 'order_from_location.location_name', sortDirection)}
                </IconButton>
              </TableCell>
              <TableCell
                align='center'
                sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
                style={{ cursor: 'pointer' }}
                onClick={() => handleSort('order_to_location.location_name')}
              >
                To
                <IconButton align='center' aria-label='expand row' size='small'>
                  {getSortIcon(sortBy, 'order_to_location.location_name', sortDirection)}
                </IconButton>
              </TableCell>
              <TableCell
                align='center'
                sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
                style={{ cursor: 'pointer' }}
                onClick={() => handleSort('order_type')}
              >
                Type
                <IconButton align='center' aria-label='expand row' size='small' data-testid={`sort-icon-${sortBy}`}>
                  {getSortIcon(sortBy, 'order_type', sortDirection)}
                </IconButton>
              </TableCell>
              <TableCell
                align='center'
                sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
                style={{ cursor: 'pointer' }}
                onClick={() => handleSort('status')}
              >
                Status
                <IconButton align='center' aria-label='expand row' size='small'>
                  {getSortIcon(sortBy, 'status', sortDirection)}
                </IconButton>
              </TableCell>
              <TableCell
                align='center'
                sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
                style={{ cursor: 'pointer' }}
                onClick={() => handleSort('order_date')}
              >
                Order Date
                <IconButton align='center' aria-label='expand row' size='small'>
                  {getSortIcon(sortBy, 'order_date', sortDirection)}
                </IconButton>
              </TableCell>
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
            {orderSaleData?.data?.map((item, index) => (
              <Row
                key={item?.id}
                row={item}
                index={index}
                page={page}
                rowsPerPage={rowsPerPage}
                handleUpdate={handleUpdate}
                apiAccess={apiAccess}
              />
            ))}
            {orderSaleData?.data?.length === 0 && (
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
TableSaleOrder.propTypes = {
  setSaleOrder: PropTypes.any,
  tableHeaderData: PropTypes.any,
  handleUpdate: PropTypes.any,
  apiAccess: PropTypes.any,
  pendingAction:PropTypes.any
}

export default TableSaleOrder
