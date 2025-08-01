import React, { useState } from 'react'
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
import TableStockReconcilDetail from 'src/views/tables/TableStockReconcilDetail'

const TableStockReconciliation = () => {
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
    <Box sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : 800 }}>
      <Grid2 item xs={12}>
        <Typography variant='h2' className='my-3 mx-2' sx={{ fontWeight: 'bold', paddingLeft: 8 }}>
          Stock Reconciliation for Ahmedabad
        </Typography>

        <Box
          sx={{
            px: 6,
            mx: 3
          }}
        >
          <Box>
            <Grid2 item xs={12}>
              <TableStockReconcilDetail />
            </Grid2>
          </Box>
        </Box>
      </Grid2>
    </Box>
  )

  return (
    <Box sx={{ position: 'relative', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
      <Table stickyHeader>
        <TableHead style={{ backgroundColor: '#fff', height: '60px' }}>
          <TableRow sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
            <TableCell className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} />
            <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
              Sr.No.
            </TableCell>
            <TableCell
              align='center'
              sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
              onClick={() => handleSort('area_id')}
            >
              Location
           
            </TableCell>
            <TableCell
              align='center'
              sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
              onClick={() => handleSort('area_name')}
            >
              Created At
           
            </TableCell>
            <TableCell
              align='center'
              sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
              onClick={() => handleSort('area_category', 'area_category_name')}
            >
              Status
            </TableCell>
            <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
              Action
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow sx={{ '& > *': { borderBottom: '1px solid rgba(224, 224, 224, 1)' } }}>
            <TableCell className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
              <IconButton
                align='center'
                aria-label='expand row'
                size='small'
                onClick={() => handleRowToggle(row?.id)}
              ></IconButton>
            </TableCell>
            <TableCell
              align='center'
              component='th'
              scope='row'
              className='p-2'
              sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
            >
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
        </TableBody>
      </Table>
    </Box>
  )
}
TableStockReconciliation.propTypes = {}
export default TableStockReconciliation
