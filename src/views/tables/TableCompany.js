import PropTypes from 'prop-types'
import React from 'react'
import CommonTableWrapper from 'src/components/CommonTableWrapper'

const TableCompany = props => {
  return (
    <CommonTableWrapper
      {...props}
      endpoint='/company/'
      columns={[
        { label: 'Company ID', path: 'company_id' },
        { label: 'Company Name', path: 'company_name' },
        { label: 'Mfg.Lic', path: 'mfg_licence_no' },
        { label: 'Email', path: 'email' },
        { label: 'Contact No.', path: 'contact' },
        { label: 'Address', path: 'address' },
        { label: 'GS1 Prefix', path: 'gs1_prefix' }
      ]}
      historyColumns={[
        { label: 'Company ID', path: 'company_id' },
        { label: 'Company Name', path: 'company_name' },
        { label: 'Mfg.Lic', path: 'mfg_licence_no' },
        { label: 'Email', path: 'email' },
        { label: 'Contact No.', path: 'contact' },
        { label: 'Address', path: 'address' },
        { label: 'GS1 Prefix', path: 'gs1_prefix' }
      ]}
      esignEnabled={props?.config?.config?.esign_status === true}
    />
  )
}

export default TableCompany

TableCompany.propTypes = {
  config: PropTypes.shape({
    config: PropTypes.shape({
      esign_status: PropTypes.bool
    })
  })
}