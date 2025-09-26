import PropTypes from 'prop-types'
import React from 'react'
import CommonTableWrapper from 'src/components/CommonTableWrapper'

const TableProduct = props => {
  return (
    <CommonTableWrapper
      {...props}
      endpoint='/product/'
      columns={[
        { label: 'Product ID', path: 'product_id' },
        { label: 'Common Name', path: 'common_name' },
        { label: 'GTIN', path: 'gtin' },
        { label: 'Grade', path: 'grade' },
        { label: 'Api Name', path: 'api_name' },
        { label: 'Country', path: 'countryMaster.country' }
      ]}
      historyColumns={[
        { label: 'Product ID', path: 'product_id' },
        { label: 'Common Name', path: 'common_name' },
        { label: 'GTIN', path: 'gtin' }, 
        { label: 'Grade', path: 'grade' },
        { label: 'Api Name', path: 'api_name' },
        { label: 'Country', path: 'countryMaster.country' }
      ]}
      esignEnabled={props?.config?.config?.esign_status === true}
    />
  )
}

export default TableProduct

TableProduct.propTypes = {
  config: PropTypes.shape({
    config: PropTypes.shape({
      esign_status: PropTypes.bool
    })
  })
}