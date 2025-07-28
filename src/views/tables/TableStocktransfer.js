import React, { useMemo, useState } from 'react'
import { Box, Button, Grid2, SwipeableDrawer, Tooltip, Typography } from '@mui/material'
import moment from 'moment'
import CommonTableWrapper from 'src/components/CommonTableWrapper'
import { MdModeEdit, MdVisibility } from 'react-icons/md'
import { CiExport } from 'react-icons/ci'
import { id } from 'date-fns/locale'
import { useAuth } from 'src/Context/AuthContext'
import downloadPdf from 'src/utils/DownloadPdf'
import TableStockTransaction from './TableStockTransaction'
import TableStockTranferDetail from './TableStockTranferDetail'

const TableStocktransfer = props => {
  const CustomActions = row => {
    const [state, setState] = useState({ addDrawer: false })
    const [orderId, setOrderId] = useState('')
    const [orderDetail, setOrderDetail] = useState([])
    const { getUserData } = useAuth()
    const [userDataPdf, setUserDataPdf] = useState()
    const { apiAccess, handleUpdate, handleView, stocktransferDetail } = props

    const tableData = useMemo(
      () => ({
        tableHeader: ['Sr.No.', 'Product', 'Batch', 'Total Quantity', 'Scanned Quantity'],
        tableHeaderText: `StockTransfer Order`,
        tableBodyText: `${row.order_no} list`,
        filename: `StockTransfer_${row.order_no}`
      }),
      []
    )

    const tableBody = orderDetail?.map((item, index) => [index + 1, item.product_name, item.batch_no, item.qty, 0])

    const toggleDrawer = (anchor, open) => event => {
      console.log('open drawer', open)
      if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
        return
      }
      setState({ ...state, [anchor]: open })
    }

    const handleDrawerOpen = row => {
      console.log('data', row)
      setOrderId(row, id)
    }

    const list = anchor => (
      <Box sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : 800 }} role='presentation'>
        <Grid2 item xs={12}>
          <Typography variant='h2' className='my-3 mx-2' sx={{ fontWeight: 'bold', paddingLeft: 8 }}>
            Stock Tranfer Order Detail
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
                    {' '}
                    From:
                  </Box>{' '}
                  {row.order_from_location.location_name}
                </Typography>
                <Typography variant='body1' sx={{ fontSize: 16 }}>
                  <Box component='span' sx={{ fontWeight: 'bold' }}>
                    {' '}
                    To:{' '}
                  </Box>
                  {row.order_to_location.location_name}
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
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginLeft: 6 }}>Invoice</span>
          </Box>
        </Button>

        <Grid2 item xs={12}>
          <Typography variant='h4' className='mx-4 mt-3' sx={{ mb: 3 }}>
            {' '}
            Transaction Detail
          </Typography>
          <TableStockTransaction />
        </Grid2>
        <Grid2 item xs={12}>
          <TableStockTranferDetail orderId={orderId} stocktransferDetail={stocktransferDetail} setOrderDetail={setOrderDetail} />
        </Grid2>
      </Box>
    )

    const handleDownloadPdf = () => {
      let data = getUserData()
      setUserDataPdf(data)
      downloadPdf(tableData, null, tableBody, orderDetail, userDataPdf)
    }

    return (
      <>
        <Tooltip title={!apiAccess.editApiAccess || (row.status !== 'CREATED' && 'No edit access')}>
          <span>
            <MdModeEdit
              fontSize={20}
              data-testid={`edit-icon-${row.id}`}
              onClick={apiAccess.editApiAccess && row.status === 'CREATED' ? () => handleUpdate(row) : null}
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
              console.log('Add button clicked')
              handleView(row)
              handleDrawerOpen(row)
            }}
            style={{ cursor: 'pointer' }}
          />
        </Button>
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
      </>
    )
  }

  return (
    <CommonTableWrapper
      {...props}
      endpoint='/stocktransfer-order/'
      columns={[
        { path: 'order_no', label: 'Order No.' },
        { path: 'order_from_location.location_name', label: 'From' },
        { path: 'order_to_location.location_name', label: 'To' },
        { path: 'status', label: 'Status' },
        {
          path: 'order_date',
          label: 'Order Date',
          render: row => <>{moment(row.order_date).format('DD/MM/YYYY')}</>
        },
      ]}
      historyColumns={[]}
      esignEnabled={props?.config?.config?.esign_status === true}
      customActions={CustomActions}
    />
  )
}

export default TableStocktransfer
