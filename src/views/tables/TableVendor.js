import React from 'react'
import CommonTableWrapper from 'src/components/CommonTableWrapper'
import PropTypes from 'prop-types'
import { statusObj } from 'src/configs/statusConfig'
import StatusChip from 'src/components/StatusChip'


const TableArea = props => {
  return (
    <CommonTableWrapper
      {...props}
      endpoint='/vendor/'
      columns={[
        {  label: 'Vendor ID', path: 'vendor_code'},
        { label: 'Vendor Name', path: 'vendor_name'  },
        { label: 'Address', path: 'address'},
        {
                  label: 'Printing Complied',
                  path: 'printing_complied',
                  render: row => {
                    const status = row.printing_complied ? 'enabled' : 'disabled'
                    return (
                      <StatusChip
                        label={status}
                        color={statusObj[status]?.color || 'default'}
                      />
                    )
                  }
                }
      ]}
      historyColumns={[
        { label: 'Vendor ID', path: 'vendor_code' },
        { label: 'Vendor Name', path: 'vendor_name' },
        { label: 'Address', path: 'address' },
        {
                  label: 'Printing Complied',
                  path: 'printing_complied',
                  render: row => {
                    const status = row.is_active ? 'enabled' : 'disabled'
                    return (
                      <StatusChip
                        label={status}
                        color={statusObj[status]?.color || 'default'}
                      />
                    )
                  }
                }
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