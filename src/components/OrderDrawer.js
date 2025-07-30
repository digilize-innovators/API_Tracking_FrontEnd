import { Box, Button, Grid2, Typography } from '@mui/material'
import { useRouter } from 'next/router'
import PropTypes from 'prop-types'
import React, { useEffect, useMemo, useState } from 'react'
import { CiExport } from 'react-icons/ci'
import { useLoading } from 'src/@core/hooks/useLoading'
import { useAuth } from 'src/Context/AuthContext'
import { api } from 'src/utils/Rest-API'
import { getFieldValue } from 'src/utils/rowUtils'
import SnackbarAlert from './SnackbarAlert'
import downloadPdf from 'src/utils/DownloadPdf'
import TableTransaction from 'src/views/tables/TableTransaction'
import TableOrderDetails from 'src/views/tables/TableOrderDetails'

const OrderDrawer = ({ anchor, title, details, row, endpoint, transactionsDetail, invoiceBtnDisable, setInvoiceBtnDisable }) => {
    const [userDataPdf, setUserDataPdf] = useState()
    const [alertData, setAlertData] = useState({ openSnackbar: false, type: '', message: '', variant: 'filled' })
    const [orderDetail, setOrderDetail] = useState([])
    const { removeAuthToken, getUserData } = useAuth()
    const { setIsLoading } = useLoading()
    const router = useRouter()

    useEffect(() => {
        let data = getUserData()
        setUserDataPdf(data)
        console.log('staus ', invoiceBtnDisable);
        
    }, [])

    const tableData = useMemo(
        () => ({
            tableHeader: ['Sr.No.', 'Product', 'Batch', 'Total Quantity', 'Scanned Quantity'],
            tableHeaderText: `${title} Order`,
            tableBodyText: `${row.order_no} list`,
            filename: `${title}Order_${row.order_no}`
        }),
        []
    )

    const tableBody = orderDetail?.map((item, index) => [
        index + 1,
        item.product_name,
        item.batch_no,
        item.qty,
        item.o_scan_qty
    ])

    const handleDownloadPdf = () => {
        downloadPdf(tableData, null, tableBody, orderDetail, userDataPdf)
    }

    const handleGenerate = async () => {
        try {
            const data = { orderId: row.id }
            setIsLoading(true)
            const res = await api(`${endpoint}generate-invoice/`, data, 'post', true);
            setIsLoading(false)
            if (res?.data?.success) {
                setAlertData({ ...alertData, openSnackbar: true, type: 'success', message: 'Invoice Generated successfully' })
                setInvoiceBtnDisable(false)
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
            console.log('Error in generate invoice ', error)
            router.push('/500')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Box sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : 800 }}>
            <Grid2 item xs={12}>
                <Typography variant='h2' className='my-3 mx-2' sx={{ fontWeight: 'bold', paddingLeft: 8 }}> {title} Order Details</Typography>
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
                disabled={!invoiceBtnDisable}
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
                <TableTransaction transactionsDetail={transactionsDetail} />
            </Grid2>
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
            <SnackbarAlert openSnackbar={alertData.openSnackbar} closeSnackbar={()=> setAlertData({ ...alertData, openSnackbar: false })} alertData={alertData} />
        </Box>
    )
}
OrderDrawer.propTypes = {
    anchor: PropTypes.any.isRequired,
    title: PropTypes.string.isRequired,
    details: PropTypes.array, 
    row: PropTypes.object.isRequired,
    endpoint: PropTypes.string.isRequired,
    transactionsDetail: PropTypes.object.isRequired,
    invoiceBtnDisable: PropTypes.bool.isRequired,
    setInvoiceBtnDisable: PropTypes.func.isRequired
}

export default OrderDrawer

