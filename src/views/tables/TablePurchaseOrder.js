import moment from 'moment'
import PropTypes from 'prop-types'
import React from 'react'
import OrderTable from 'src/components/OrderTable'

const TablePurchaseOrder = props => {
  return (
    <OrderTable
      {...props}
      title={'Purchase Order Detail'}
      endpoint='/purchase-order/'
      columns={[
        { label: 'Order No.', path: 'order_no' },
        { label: 'From', path: 'order_from_location.address' },
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

export default TablePurchaseOrder

TablePurchaseOrder.propTypes = {
  handleUpdate: PropTypes.func.isRequired,
  tableHeaderData: PropTypes.object.isRequired,
  apiAccess: PropTypes.object.isRequired,
  setDataCallback: PropTypes.func.isRequired,
}

