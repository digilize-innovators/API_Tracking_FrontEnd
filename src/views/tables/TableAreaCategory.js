import PropTypes from 'prop-types'
import React from 'react'
import CommonTableWrapper from 'src/components/CommonTableWrapper'

const TableAreaCategory = props => {
  return (
    <CommonTableWrapper
      {...props}
      endpoint='/area-category/'
      columns={[{ label: 'Areacategory Name', path: 'area_category_name' }]}
      historyColumns={[{ label: 'Areacategory Name', path: 'area_category_name' }]}
      esignEnabled={props?.config?.config?.esign_status === true}
    />
  )
}

export default TableAreaCategory
TableAreaCategory.propTypes = {
  config: PropTypes.shape({
    config: PropTypes.shape({
      esign_status: PropTypes.bool
    })
  })
}