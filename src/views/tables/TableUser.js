import React from 'react'
import CommonTableWrapper from 'src/components/CommonTableWrapper'
import StatusChip from 'src/components/StatusChip'
import { statusObj } from 'src/configs/statusConfig'

const TableUser = props => {
  return (
    <CommonTableWrapper
      {...props}
      endpoint='/user/'
      columns={[
        { path: 'user_id', label: 'User ID' },
        { path: 'user_name', label: 'User Name' },
        { path: 'department.history[0].department_name', label: 'Department' },
        { path: 'designation.history[0].designation_name', label: 'Designation' },
        { path: 'location.history[0].location_name', label: 'Location' },
        { path: 'email', label: 'Email' },
        {
          label: 'Status',
          path: 'is_active',
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
      historyColumns={[
        { path: 'user_id', label: 'User ID' },
        { path: 'user_name', label: 'User Name' },
        { path: 'department.history[0].department_name', label: 'Department' },
        { path: 'designation.history[0].designation_name', label: 'Designation' },
        { path: 'location.history[0].location_name', label: 'Location' },
        { path: 'email', label: 'Email' },
        {
          label: 'Status',
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

export default TableUser
