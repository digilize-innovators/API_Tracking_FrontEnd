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
        { label: 'Packaging Size', path: 'packaging_size' },
        { label: 'Company', path: 'company.CompanyHistory[0].company_name' },
        { label: 'Country', path: 'countryMaster.country' }
      ]}
      historyColumns={[
        { label: 'Product ID', path: 'product_id' },
        { label: 'Product Name', path: 'product_name' },
        { label: 'GTIN', path: 'gtin' },
        { label: 'NDC', path: 'ndc' },
        { label: 'MRP', path: 'mrp' },
        { label: 'Generic Name', path: 'generic_name' },
        { label: 'Packaging Size', path: 'packaging_size' },
        { label: 'Company', path: 'company.CompanyHistory[0].company_name' },
        { label: 'Country', path: 'countryMaster.country' }
      ]}
      esignEnabled={props?.config?.config?.esign_status === true}
    />
  )
}

export default TableProduct

