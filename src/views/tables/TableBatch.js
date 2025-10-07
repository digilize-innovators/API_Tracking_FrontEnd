import moment from 'moment'
import PropTypes from 'prop-types'
import React from 'react'
import CommonTableWrapper from 'src/components/CommonTableWrapper'

const TableBatch = props => {
  return (
    <CommonTableWrapper
      {...props}
      endpoint='/batch/'
      columns={[
        { path: 'batch_no', label: 'Batch No.' },
        { path: 'product.product_history[0].common_name', label: 'Product Name' },
        { path: 'location.history[0].location_name', label: 'Location Name' },
        { 
          path: 'manufacturing_date', 
          label: 'Mfg. Date',
          render: row => (
            <>{moment(row.manufacturing_date).format('DD/MM/YYYY')}</>
          )
        },
        { 
          path: 'expiry_date', 
          label: 'Exp. Date',
          render: row => (
            <>{moment(row.expiry_date).format('DD/MM/YYYY')}</>
          ) 
        },
        { path: 'qty', label: 'Qty' },
      ]}
      historyColumns={[
        { path: 'batch_no', label: 'Batch No.' },
        { path: 'product.product_history[0].common_name', label: 'Product Name' },
        { path: 'location.history[0].location_name', label: 'Location Name' },
        { 
          path: 'manufacturing_date', 
          label: 'Mfg. Date',
          render: row => (
            <>{moment(row.manufacturing_date).format('DD/MM/YYYY')}</>
          )
        },
        { 
          path: 'expiry_date', 
          label: 'Exp. Date',
          render: row => (
            <>{moment(row.expiry_date).format('DD/MM/YYYY')}</>
          ) 
        },
        { path: 'qty', label: 'Qty' },
      ]}
      esignEnabled={props?.config?.config?.esign_status === true}
    />
  )
}

export default TableBatch
TableBatch.propTypes = {
  config: PropTypes.shape({
    config: PropTypes.shape({
      esign_status: PropTypes.bool
    })
  })
}