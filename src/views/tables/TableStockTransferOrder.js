import moment from 'moment'
import PropTypes from 'prop-types'
import React from 'react'
import OrderTable from 'src/components/OrderTable'

const TableStockTransferOrder = props => {
  return (
    <OrderTable
      {...props}
      title={'StockTransfer Order Detail'}
      endpoint='/stocktransfer-order/'
      columns={[
        { label: 'Order No.', path: 'order_no' },
        { label: 'From', path: 'order_from_location.location_name' },
        { label: 'To', path: 'order_to_location.location_name' },
        { label: 'Status', path: 'status' },
        {
          label: 'Order Date',
          path: 'order_date',
          render: row => (
            <>{moment(row.order_date).format('DD/MM/YYYY')}</>
          )
        }
      ]}
    />
  )
}

export default TableStockTransferOrder

TableStockTransferOrder.propTypes = {
  handleUpdate: PropTypes.func.isRequired,
  tableHeaderData: PropTypes.object.isRequired,
  apiAccess: PropTypes.object.isRequired,
  setDataCallback: PropTypes.func.isRequired,
}
