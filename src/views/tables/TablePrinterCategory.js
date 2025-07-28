import PropTypes from 'prop-types'
import React from 'react'
import CommonTableWrapper from 'src/components/CommonTableWrapper'

const TablePrinterCategory = props => {
  return (
    <CommonTableWrapper
      {...props}
      endpoint='/printercategory/'
      columns={[
        { path: 'printer_category_id', label: 'Printer Category Id' },
        { path: 'printer_category_name', label: 'Printer Category Name' },
      ]}
      historyColumns={[
        { path: 'printer_category_id', label: 'Printer Category Id' },
        { path: 'printer_category_name', label: 'Printer Category Name' },
      ]}
      esignEnabled={props?.config?.config?.esign_status === true}
    />
  )
}

export default TablePrinterCategory

TablePrinterCategory.propTypes = {
  config: PropTypes.shape({
    config: PropTypes.shape({
      esign_status: PropTypes.bool
    })
  })
}