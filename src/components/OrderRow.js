import React, { Fragment, useState } from "react";
import { SwipeableDrawer, TableCell, TableRow, Tooltip, Button } from "@mui/material";
import moment from "moment";
import { MdModeEdit, MdVisibility } from "react-icons/md";
import { getFieldValue } from "src/utils/rowUtils";
import PropTypes from "prop-types";
import { useLoading } from "src/@core/hooks/useLoading";
import { api } from 'src/utils/Rest-API'
import { useAuth } from "src/Context/AuthContext";
import { useRouter } from "next/router";
import OrderDrawer from "./OrderDrawer";

const OrderRow = ({
    row,
    index,
    title,
    page,
    rowsPerPage,
    endpoint,
    columns,
    handleUpdate,
    apiAccess,
    customActions,
    invoiceBtnDisable,
    setInvoiceBtnDisable

}) => {
    const serialNumber = index + 1 + page * rowsPerPage;
    const [state, setState] = useState({ addDrawer: false })
    const [orderId, setOrderId] = useState('')
    const [transactionsDetail, setTransactionsDetail] = useState({});
    const { setIsLoading } = useLoading()
    const { removeAuthToken } = useAuth()
    const router = useRouter()

    const getTractionDetail = async id => {
        try {
            setIsLoading(true)
            const res = await api(`${endpoint}transaction-details/${id}`, {}, 'get', true)
            setIsLoading(false)
            if (res.data.success) {
                setTransactionsDetail(res?.data.data)
                setInvoiceBtnDisable(
                    res.data.data.transactions.length > 0 && res.data.data.transactions.every(item => item.status === 'COMPLETED') && row.status !== 'INVOICE_GENERATED'
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

    const handleDrawerOpen = rowId => {
        setOrderId(rowId)
    }

    const toggleDrawer = (anchor, open) => event => {
        if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return
        }
        setState({ ...state, [anchor]: open })
    }



    return (
        <Fragment>
            {/* Main Row */}
            <TableRow sx={{ '& > *': { borderBottom: '1px solid rgba(224, 224, 224, 1)' } }}>
                <TableCell className='p-2'></TableCell>

                <TableCell align='center'>{serialNumber}</TableCell>

                {columns.map((col, idx) => (
                    <TableCell key={idx} align='center'>
                        {getFieldValue(row, col)}
                    </TableCell>
                ))}

                <TableCell align='center'>
                    {moment(row?.updated_at).format('DD/MM/YYYY, hh:mm:ss a')}
                </TableCell>

                <TableCell align='center'>
                    {customActions ? (
                        customActions(row, index)
                    ) : (
                        <>
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
                                        handleDrawerOpen(row.id)
                                        getTractionDetail(row.id)
                                    }}
                                    style={{ cursor: 'pointer' }}
                                />
                            </Button>
                        </>
                    )}
                    {orderId && (
                        <SwipeableDrawer
                            anchor={'right'}
                            open={state['addDrawer']}
                            onClose={toggleDrawer('addDrawer', false)}
                            onOpen={toggleDrawer('addDrawer', true)}
                        >
                            <OrderDrawer
                                anchor={'addDrawer'}
                                title={title}
                                details={[
                                    { label: 'Order No.', path: 'order_no' },
                                    {
                                        label: 'Order Date',
                                        path: 'order_date',
                                        render: row => (
                                            <>{moment(row.order_date).format('DD/MM/YYYY')}</>
                                        )
                                    },
                                    { label: 'From', path: 'order_from_location.location_name' },
                                    { label: 'To', path: 'order_to_location.location_name' },
                                    { label: 'Status', path: 'status' }
                                ]}
                                row={row}
                                endpoint={endpoint}
                                transactionsDetail={transactionsDetail}
                                invoiceBtnDisable={invoiceBtnDisable}
                                setInvoiceBtnDisable={setInvoiceBtnDisable}
                            />
                        </SwipeableDrawer>
                    )}
                </TableCell>
            </TableRow>
        </Fragment>
    );
};

export { OrderRow }

OrderRow.propTypes = {
    title:PropTypes.any,
    row: PropTypes.any,
    index: PropTypes.any,
    page: PropTypes.any,
    rowsPerPage: PropTypes.any,
    endpoint:PropTypes.any,
    columns: PropTypes.any,
    handleUpdate: PropTypes.any,
    apiAccess: PropTypes.any,
    customActions: PropTypes.any,
    invoiceBtnDisable:PropTypes.any,
    setInvoiceBtnDisable:PropTypes.any

}
