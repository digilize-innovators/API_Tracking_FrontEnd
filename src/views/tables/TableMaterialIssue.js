import React from 'react'
import CommonTableWrapper from 'src/components/CommonTableWrapper'
import PropTypes from 'prop-types'


const TableArea = props => {
  return (
    <CommonTableWrapper
      {...props}
      endpoint='/materialissue/'
      columns={[
        { path: 'materialissue_id', label: 'MaterialIssue ID' },
        { path: 'product.product_history[0].api_name', label: 'Product Id' },
        { path: 'batch.history[0].batch_no', label: 'Batch Id' },
        { path: 'quantity_issue', label: 'Quality Issue' },
        { path: 'qcresult', label: 'QC Result' }
      ]}
      historyColumns={[
        { path: 'materialissue_id', label: 'MaterialIssue ID' },
        { path: 'product.product_history[0].api_name', label: 'Product Id' },
        { path: 'batch.history[0].batch_no', label: 'Batch Id' },
        { path: 'quantity_issue', label: 'Quality Issue' },
        { path: 'qcresult', label: 'QC Result' }
      ]}
      esignEnabled={props?.config?.config?.esign_status === true}
    />
  )
}

export default TableArea

TableArea.propTypes = {
  config: PropTypes.shape({
    config: PropTypes.shape({
      esign_status: PropTypes.bool
    })
  })
}