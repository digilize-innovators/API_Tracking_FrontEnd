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
        { label: 'Product Name', path: 'product_name' },
        { label: 'GTIN', path: 'gtin' },
        { label: 'Division', path: 'division' },
        { label: 'Foreign Name', path: 'foreign_name' },
        { label: 'Company', path: 'company.CompanyHistory[0].company_name' },
        { label: 'Country', path: 'countryMaster.country' }
      ]}
      historyColumns={[
        { label: 'Product ID', path: 'product_id' },
        { label: 'Product Name', path: 'product_name' },
        { label: 'GTIN', path: 'gtin' }, 
        { label: 'Division', path: 'division' },
        { label: 'Foreign Name', path: 'foreign_name' },
        { label: 'Company', path: 'company.CompanyHistory[0].company_name' },
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