import { Box, Button, Grid2, Typography } from '@mui/material'
import { useRouter } from 'next/router'
import PropTypes from 'prop-types'
import React, { useEffect, useLayoutEffect, useState } from 'react'
import { CiExport } from 'react-icons/ci'
import { useLoading } from 'src/@core/hooks/useLoading'
import { useAuth } from 'src/Context/AuthContext'
import { api } from 'src/utils/Rest-API'
import { getFieldValue } from 'src/utils/rowUtils'
import SnackbarAlert from './SnackbarAlert'
import TableTransaction from 'src/views/tables/TableTransaction'
import TableOrderDetails from 'src/views/tables/TableOrderDetails'
import salepdf from 'src/utils/salePdf'
import { Trumpet } from 'mdi-material-ui'

const statusActionMap = {
  CREATED: { title: 'Generate Invoice', endpoint: 'generate-invoice' },
  SCANNING_IN_PROGRESS: { title: 'Generate Invoice', endpoint: 'generate-invoice' },
  SCANNING_COMPLETED: { title: 'Generate Invoice', endpoint: 'generate-invoice' },
  INVOICE_CANCELLED: { title: 'Generate Invoice', endpoint: 'generate-invoice' },
  INVOICE_GENERATED: { title: 'Cancelled Invoice', endpoint: 'cancelled-invoice' },
  INWARD_IN_PROGRESS: { title: 'Generate GRN', endpoint: 'generate-grn' },
  INWARD_COMPLETED: { title: 'Generate GRN', endpoint: 'generate-grn' },
  GRN_GENERATED: { title: 'Generate GRN', endpoint: 'generate-grn' }
}

const StockOrderDrawer = ({
  anchor,
  title,
  details,
  row,
  endpoint,
  transactionsDetail,
  invoiceBtnDisable,
  setInvoiceBtnDisable
}) => {
  const [userDataPdf, setUserDataPdf] = useState()
  const [alertData, setAlertData] = useState({ openSnackbar: false, type: '', message: '', variant: 'filled' })
  const [orderDetail, setOrderDetail] = useState([])
  const [orderScannedCode, setOrderScannedCode] = useState({})
  const { removeAuthToken, getUserData } = useAuth()
  const { setIsLoading } = useLoading()
  const router = useRouter()

  useEffect(() => {
    let data = getUserData()
    setUserDataPdf(data)
  }, [])

  const tableBody = orderDetail?.map((item, index) => [
    index + 1,
    item.product_name,
    item.batch_no,
    item.qty,
    item.scanned_qty
  ])

  const handleDownloadPdf = async () => {
    try {
      setIsLoading(true)
      const res = await api(`${endpoint}scanned-codes/${row?.id}`, {}, 'get', true)
      setIsLoading(false)

      if (res?.data?.success) {
        salepdf(row, title, tableBody, orderDetail, userDataPdf, res?.data?.data)
      } else if (res.data.code === 401) {
        removeAuthToken()
        router.push('/401')
      } else {
        setAlertData({ ...alertData, openSnackbar: true, type: 'error', message: res.data?.message })
      }
    } catch (error) {
      console.log('Error scanned-code fetch ', error)
      router.push('/500')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerate = async () => {
    try {
      const data = { orderId: row.id }
      setIsLoading(true)

      const res = await api(`${endpoint}${statusActionMap[row.status].endpoint}/`, data, 'post', true)
      setIsLoading(false)
      if (res?.data?.success) {
        invoiceBtnDisable == true ? setInvoiceBtnDisable(false) : setInvoiceBtnDisable(true)

        setAlertData({ ...alertData, openSnackbar: true, type: 'success', message: res.data.message })
      } else if (res.data.code === 401) {
        removeAuthToken()
        router.push('/401')
      } else if (res.data.code === 409) {
        setAlertData({ ...alertData, openSnackbar: true, type: 'error', message: res.data.message })
      } else {
        setAlertData({ ...alertData, openSnackbar: true, type: 'error', message: res.data?.message })
      }
    } catch (error) {
      console.log('Error in generate invoice ', error)
      router.push('/500')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : 800 }}>
      <Grid2 item xs={12}>
        <Typography variant='h2' className='my-3 mx-2' sx={{ fontWeight: 'bold', paddingLeft: 8 }}>
          {' '}
          Stock Transfer Order Detail{' '}
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
            <Box>
              {/* Left side: Order No and Order Date */}
              {details.map((col, idx) => (
                <Typography variant='body1' sx={{ fontSize: 16 }} key={col.label}>
                  <Box component='span' sx={{ fontWeight: 'bold' }}>
                    {col.label} {': '}
                  </Box>
                  {getFieldValue(row, col)}
                </Typography>
              ))}
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
        disabled={!invoiceBtnDisable && !(row.status === 'INVOICE_GENERATED' || row.status === 'SCANNING_COMPLETED')}
        onClick={handleGenerate}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ marginLeft: 6 }}> {statusActionMap[row.status].title} </span>
        </Box>
      </Button>
      {row?.status !== 'INVOICE_GENERATED' && (
        <Grid2 item xs={12}>
          <Typography variant='h4' className='mx-4 mt-3' sx={{ mb: 3 }}>
            Transaction Detail
          </Typography>
          <TableTransaction transactionsDetail={transactionsDetail} />
        </Grid2>
      )}

      <Grid2 item xs={12}>
        <TableOrderDetails
          endpoint={endpoint}
          transactionsDetail={transactionsDetail}
          setOrderDetail={setOrderDetail}
          orderDetail={row}
          userDataPdf={userDataPdf}
          setAlertData={setAlertData}
        />
      </Grid2>
      <SnackbarAlert
        openSnackbar={alertData.openSnackbar}
        closeSnackbar={() => setAlertData({ ...alertData, openSnackbar: false })}
        alertData={alertData}
      />
    </Box>
  )
}
StockOrderDrawer.propTypes = {
  anchor: PropTypes.any.isRequired,
  title: PropTypes.string.isRequired,
  details: PropTypes.array,
  row: PropTypes.object.isRequired,
  endpoint: PropTypes.string.isRequired,
  transactionsDetail: PropTypes.object.isRequired,
  invoiceBtnDisable: PropTypes.bool.isRequired,
  setInvoiceBtnDisable: PropTypes.func.isRequired
}

export default StockOrderDrawer
