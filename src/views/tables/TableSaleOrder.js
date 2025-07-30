import moment from 'moment'
import PropTypes from 'prop-types'
import React from 'react'
import OrderTable from 'src/components/OrderTable'

const TableSaleOrder = props => {
  return (
    <OrderTable
      {...props}
      title={'Sale Order Detail'}
      endpoint='/sales-order/'
      columns={[
        { label: 'Order No.', path: 'order_no' },
        { label: 'From', path: 'order_from_location.location_name' },
        { label: 'To', path: 'order_to_location.location_name' },
        { label: 'Type', path: 'order_type' },
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

export default TableSaleOrder

TableSaleOrder.propTypes = {
  handleUpdate: PropTypes.func.isRequired,
  tableHeaderData: PropTypes.object.isRequired,
  apiAccess: PropTypes.object.isRequired,
  setDataCallback: PropTypes.func.isRequired,
}
