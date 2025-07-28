import PropTypes from 'prop-types'
import React from 'react'
import CommonTableWrapper from 'src/components/CommonTableWrapper'

const TableUom = props => {
  return (
    <CommonTableWrapper
      {...props}
      endpoint='/uom/'
      columns={[
        { path: 'uom_name', label: 'Unit of Measurement' },
      ]}
      historyColumns={[
        { path: 'uom_name', label: 'Unit of Measurement' },
      ]}
      esignEnabled={props?.config?.config?.esign_status === true}
    />
  )
}

export default TableUom

TableUom.propTypes = {
  config: PropTypes.shape({
    config: PropTypes.shape({
      esign_status: PropTypes.bool
    })
  })
}