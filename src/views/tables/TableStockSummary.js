import React, { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Table,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Typography,
  IconButton,
  Button,
  SwipeableDrawer,
  Grid2
} from '@mui/material'
import { MdVisibility } from 'react-icons/md'
import moment from 'moment'
import TableStockSummaryDetail from 'src/views/tables/TableStockSummaryDetail'
import { useSettings } from 'src/@core/hooks/useSettings'
import { useRouter } from 'next/router'
import { sortData } from 'src/utils/sortData'
import { useLoading } from 'src/@core/hooks/useLoading'
import { api } from 'src/utils/Rest-API'
import CustomTable from 'src/components/CustomTable'
import { useAuth } from 'src/Context/AuthContext'
import { IoIosAdd } from 'react-icons/io'


 

const Row = ({
  key,row,index ,page,rowsPerPage
}) => {


   const [openLocation,setOpenLocation]=useState({})
     const [state, setState] = useState({ addDrawer: false })


  const handleLocationStock = async row => {
        setOpenLocation(row)
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
        <Typography variant='h4' fontWeight="bold"  className='mx-4 my-4 mx-2'>
          Stock Summary
        </Typography>
         <Typography  variant='h4' fontWeight="bold" className='mx-4 my-4 mx-2' >
          LocationName:{openLocation?.location_name}
        </Typography>
        <Box
          sx={{
            px: 6,
            mx: 3,
            mt:9
          }}
        >
          <Box>
            <Grid2 item xs={12}>
              <TableStockSummaryDetail />
            </Grid2>
          </Box>
        </Box>
      </Grid2>
    </Box>
  )
  return(
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
                 {openLocation?.location_names && (
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

const TableStockSummary = ({                tableHeaderData
}) => {
  const { settings } = useSettings()
  const[locationData,setLocationData]=useState({data:[],total:0,})
  const [sortDirection, setSortDirection] = useState('asc')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(settings.rowsPerPage)
   const router = useRouter()
   const { setIsLoading } = useLoading()
   const { removeAuthToken } = useAuth()


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
          search: tableHeaderData.searchVal,
        })
        const res = await api(`/stock-summary/?${params.toString()}`, {}, 'get', true)
        setIsLoading(false)
        if (res.data.success) {
          setLocationData({ data: res.data.data.stockLocations, total: res.data.data.total })
          // setDepartment({ data: res.data.data.departments, index: res.data.data.offset })
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
             </TableCell>
            <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
              Action
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
            {locationData?.data?.map((item, index) => (
                        <Row
                          key={item.id}
                          row={item}
                          index={index}
                          page={page}
                          rowsPerPage={rowsPerPage}
                        />
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
TableStockSummary.propTypes = {}
export default TableStockSummary
