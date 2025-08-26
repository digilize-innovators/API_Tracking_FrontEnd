import React, { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Table,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Typography,
  Button,
  SwipeableDrawer,
  Grid2,
  IconButton
} from '@mui/material'
import { MdVisibility } from 'react-icons/md'
import TableStockSummaryDetail from 'src/views/tables/TableStockSummaryDetail'
import { useSettings } from 'src/@core/hooks/useSettings'
import { useRouter } from 'next/router'
import { sortData } from 'src/utils/sortData'
import { useLoading } from 'src/@core/hooks/useLoading'
import { api } from 'src/utils/Rest-API'
import CustomTable from 'src/components/CustomTable'
import { useAuth } from 'src/Context/AuthContext'
import PropTypes from 'prop-types'
import SnackbarAlert from 'src/components/SnackbarAlert'
import { getSortIcon } from 'src/utils/sortUtils'

const Row = ({ row, index, page, rowsPerPage }) => {
  const [alertData, setAlertData] = useState({ openSnackbar: false, type: '', message: '', variant: 'filled' })
  const [openLocation, setOpenLocation] = useState({})
  const [state, setState] = useState({ addDrawer: false })
  const router = useRouter()
  const { removeAuthToken } = useAuth()

  const handleLocationStock = async row => {
    try {
      const stockDetail = await api(`/stock-summary/getStockByLocation?locationId=${row?.id}`, {}, 'get', true)

      if (stockDetail.data.success) {
        setOpenLocation({ locationData: row, productData: stockDetail.data.data })
      } else if (stockDetail.data.code === 401) {
        removeAuthToken()
        router.push('/401')
      } else if (stockDetail.data.code === 404) {
        setAlertData({
          ...alertData,
          type: 'error',
          message: stockDetail.data?.message || 'Not Found',
          openSnackbar: true
        })
      } else {
        console.error('Failed to fetch data:', stockDetail.data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const closeSnackbar = () => {
    setAlertData({ ...alertData, openSnackbar: false })
  }
  const toggleDrawer = (anchor, open) => event => {
    console.log('open drawer', open)
    if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return
    }
    setState({ ...state, [anchor]: open })
  }

  const list = anchor => (
    <Box sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : 800 }}>
      <Grid2 item xs={12}>
        <Typography variant='h4' fontWeight='bold' className='mx-4 my-4 mx-2'>
          Stock Summary
        </Typography>
        <Typography variant='h4' fontWeight='bold' className='mx-4 my-4 mx-2'>
          LocationName:{openLocation?.locationData.location_name}
        </Typography>
        <Box
          sx={{
            px: 6,
            mx: 3,
            mt: 9
          }}
        >
          <Box>
            <Grid2 item xs={12}>
              <TableStockSummaryDetail
                data={openLocation?.productData?.totalStock}
                locationId={openLocation?.locationData.id}
                locationName={openLocation?.locationData.location_name}
              />
            </Grid2>
          </Box>
        </Box>
      </Grid2>
    </Box>
  )
  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: '1px solid rgba(224, 224, 224, 1)' } }}>
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
          {row.location_name}
        </TableCell>
        <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} align='center' className='p-2'>
          <Button onClick={toggleDrawer('addDrawer', true)}>
            <MdVisibility
              fontSize={30}
              onClick={() => {
                handleLocationStock(row)
              }}
              style={{ cursor: 'pointer' }}
            />
          </Button>
        </TableCell>
        {openLocation?.locationData?.location_name && (
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
      <SnackbarAlert alertData={alertData} closeSnackbar={closeSnackbar} openSnackbar={alertData.openSnackbar} />
    </>
  )
}
Row.propTypes = {
  row: PropTypes.any,
  index: PropTypes.any,
  page: PropTypes.any,
  rowsPerPage: PropTypes.any
}
const TableStockSummary = ({ tableHeaderData }) => {
  const { settings } = useSettings()
  const [locationData, setLocationData] = useState({ data: [], total: 0 })
  const [sortDirection, setSortDirection] = useState('asc')
  const [sortBy, setSortBy] = useState('')

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(settings.rowsPerPage)
  const router = useRouter()
  const { setIsLoading } = useLoading()
  const { removeAuthToken,getUserData } = useAuth()

  useMemo(() => {
    setPage(0)
  }, [tableHeaderData, rowsPerPage])

  useEffect(() => {
    getlocation()
  }, [page, rowsPerPage, tableHeaderData])

  const getlocation = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage === -1 ? -1 : rowsPerPage,
        search: tableHeaderData.searchVal
      })
      const res = await api(`/location/?${params.toString()}`, {}, 'get', true)
      setIsLoading(false)
      if (res.data.success) {
        const user = getUserData()
         const userLocation = user.userLocation // or location_id depending on token structure
        const userName = user.departmentName
        if (userName === 'Admin') {
          // restrict to user location only
        setLocationData({ data: res.data.data.locations, total: res.data.data.total })
        } else {
          const finalLocations = res.data.data.locations.filter(loc => loc.location_name === userLocation)
           setLocationData({ data:finalLocations, total: res.data.data.total })

        }
        
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
    const data = locationData?.data || []
    const sortedData = sortData(data, path, newSortDirection)
    setLocationData(prev => ({ ...prev, data: sortedData }))
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
      data={locationData?.data}
      page={page}
      rowsPerPage={rowsPerPage}
      totalRecords={locationData?.total}
      handleChangePage={handleChangePage}
      handleChangeRowsPerPage={handleChangeRowsPerPage}
    >
      <Box sx={{ position: 'relative', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
        <Table stickyHeader>
          <TableHead style={{ backgroundColor: '#fff', height: '60px' }}>
            <TableRow sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                Sr.No.
              </TableCell>
              <TableCell
                align='center'
                sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
                onClick={() => handleSort('location_name')}
              >
                Location
                <IconButton size='small'>{getSortIcon(sortBy, 'location_name', sortDirection)}</IconButton>
              </TableCell>

              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {locationData?.data?.map((item, index) => (
              <Row key={item.id} row={item} index={index} page={page} rowsPerPage={rowsPerPage} />
            ))}
            {locationData?.length === 0 && (
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
TableStockSummary.propTypes = {
  tableHeaderData: PropTypes.any
}
export default TableStockSummary
