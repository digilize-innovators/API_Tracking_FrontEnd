import React, { useState, Fragment, useEffect, useMemo } from 'react';
import { Box, Table, Collapse, TableRow, TableHead, TableBody, TableCell, Typography, IconButton, Tooltip, Button, SwipeableDrawer, Grid2 } from '@mui/material';
import { MdModeEdit, MdOutlineDomainVerification, MdVisibility } from 'react-icons/md';
import { ChevronUp, ChevronDown } from 'mdi-material-ui';
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
import TableStockReconcilDetail from './TableStockReconcilDetail';



const TableStockReconciliation = ({
}) => {
  const [sortBy, setSortBy] = useState('');
  //   const [openRows, setOpenRows] = useState({});
  //   const [historyData, setHistoryData] = useState({});
  //   const [page, setPage] = useState(0)
  //   const { settings } = useSettings()
  const [sortDirection, setSortDirection] = useState('asc')
  //   const [rowsPerPage, setRowsPerPage] = useState(settings.rowsPerPage)
  //   const { setIsLoading } = useLoading()
  //   const { removeAuthToken } = useAuth()
  //   const router=useRouter()
  //   const [areaData, setAreaData] = useState({data:[],total:0})


  //   const handleRowToggle = async (rowId) => {
  //     await handleRowToggleHelper(rowId, openRows, setOpenRows, setHistoryData, '/area/history');
  //   };

  //   useMemo(()=>{
  //     setPage(0)
  //   },[tableHeaderData,rowsPerPage])

  //   const getData = async () => {
  //     setIsLoading(true)
  //     try {
  //       const params = new URLSearchParams({
  //         page: page + 1,
  //         limit: rowsPerPage === -1 ? -1 : rowsPerPage,
  //         search: tableHeaderData.searchVal,
  //         esign_status: tableHeaderData.esignStatus
  //       })
  //       const response = await api(`/area/?${params.toString()}`, {}, 'get', true)
  //       if (response.data.success) {
  //         console.log("after add",response.data.data.areas)
  //         setAreaData({data:response.data.data.areas,total:response.data.data.total})
  //         setArea(response.data.data.areas)
  //       }
  //       else {
  //         console.log('Error to get all areas ', response.data)
  //         if (response.data.code === 401) {
  //           removeAuthToken();
  //           router.push('/401');
  //         }
  //       }
  //     } catch (error) {
  //       console.log('Error in get areas ', error)
  //     } finally {
  //       setIsLoading(false)
  //     }
  //   }

  //   useEffect(() => {
  //     getData();
  //   }, [tableHeaderData,page,rowsPerPage,pendingAction])

  //   const handleSort = (key,child) => {
  //     const newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
  //     const data=areaData?.data

  //     const sorted = [...data].sort((a, b) => {
  //         if(!child){
  //             if (a[key] > b[key]) {
  //             return newSortDirection === 'asc' ? 1 : -1
  //           }

  //           if (a[key] < b[key]) {
  //             return newSortDirection === 'asc' ? -1 : 1
  //           }
  //           return 0
  //         }
  //         else{
  //             if (a[key][child] > b[key][child]) {
  //                 return newSortDirection === 'asc' ? 1 : -1
  //               }

  //               if (a[key][child] < b[key][child]) {
  //                 return newSortDirection === 'asc' ? -1 : 1
  //               }
  //               return 0
  //         }
  //     })
  //     setAreaData({...areaData,data:sorted});
  //   setSortDirection(newSortDirection);
  //   setSortBy(key);
  // };

  //   const handleChangePage = (event, newPage) => {
  //     setPage(newPage)
  //   }

  //   const handleChangeRowsPerPage = event => {
  //     setRowsPerPage(parseInt(event.target.value, 10))
  //     setPage(0)
  //   }
  const [state, setState] = useState({ addDrawer: false })
  const [orderId, setOrderId] = useState('')

  const toggleDrawer = (anchor, open) => event => {
    console.log('open drawer', open)
    if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return
    }
    setState({ ...state, [anchor]: open })
  }
  const handleDrawerOpen = row => {
    console.log('data', row)
    setOrderId(1)
  }
  const list = anchor => (
    <Box sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : 800 }} role='presentation'>

      <Grid2 item xs={12}>
        <Typography variant='h2' className='my-3 mx-2' sx={{ fontWeight: 'bold', paddingLeft: 8 }}>
          Stock Reconciliation for Ahmedabad
        </Typography>

        <Box
          sx={{
            px: 6,
            mx: 3,

          }}
        >
          <Box
          //  sx={{
          //    display: 'flex',
          //    justifyContent: 'column',
          //    alignItems: 'flex-start',
          //    mb: 2,
          //  }}
          >
            <Grid2 item xs={12}>
              <TableStockReconcilDetail />
            </Grid2>
            {/* Left side: Order No and Order Date */}
          </Box>
        </Box>
      </Grid2>
    </Box>

  )


  return (

    <Box sx={{ position: 'relative', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
      <Table stickyHeader >
        <TableHead style={{ backgroundColor: '#fff', height: '60px' }}>
          <TableRow sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
            <TableCell className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} />
            <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Sr.No.</TableCell>
            <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} onClick={() => handleSort('area_id')}>
              Location
              <IconButton align='center' aria-label='expand row' size='small' data-testid={`sort-icon-${sortBy}`}>
                {getSortIcon(sortBy, 'area_id', sortDirection)}
              </IconButton>
            </TableCell>
            <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} onClick={() => handleSort('area_name')}>
              Created At
              <IconButton align='center' aria-label='expand row' size='small'>
                {getSortIcon(sortBy, 'area_name', sortDirection)}
              </IconButton>
            </TableCell>
            <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} onClick={() => handleSort("area_category", 'area_category_name')}>
              Status
              <IconButton align='center' aria-label='expand row' size='small'>
                {getSortIcon(sortBy, 'area_category', sortDirection)}
              </IconButton>
            </TableCell>
            <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <Fragment>
            <TableRow sx={{ '& > *': { borderBottom: '1px solid rgba(224, 224, 224, 1)' } }}>
              <TableCell className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                <IconButton align='center' aria-label='expand row' size='small' onClick={() => handleRowToggle(row?.id)}>
                  {/* {isOpen ? <ChevronUp /> : <ChevronDown />} */}
                </IconButton>
              </TableCell>
              <TableCell align='center' component='th' scope='row' className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                1
              </TableCell>

              <TableCell align='center' className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                Ahmedabad
              </TableCell>
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                {moment('11/11/2001').format('DD/MM/YYYY, hh:mm:ss a')}
              </TableCell>

              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                Completed
              </TableCell>
              <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} align='center' className='p-2'>
                {/* <span>
                <MdVisibility
                //   data-testid={`edit-icon-${index + 1}`}
                  fontSize={20}
                //   style={{ cursor: apiAccess.editApiAccess ? 'pointer' : 'not-allowed', opacity: apiAccess.editApiAccess ? 1 : 0.5 }}
                />
              </span> */}
                <Button onClick={toggleDrawer('addDrawer', true)}>
                  <MdVisibility
                    fontSize={24}
                    onClick={() => {
                      console.log('Add button clicked')
                      handleDrawerOpen(1)
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
        </TableBody>
      </Table>
    </Box>
  );
};
TableStockReconciliation.propTypes = {

};
export default TableStockReconciliation;