import React from 'react'
import CommonTableWrapper from 'src/components/CommonTableWrapper'

const TableControlPanelMaster = props => {
  return (
    <CommonTableWrapper
      {...props}
      endpoint='/controlpanelmaster/'
      columns={[
        { path: 'name', label: 'Name' },
        { path: 'ip', label: 'IP' },
        { path: 'port', label: 'Port' }
      ]}
      historyColumns={[
        { path: 'name', label: 'Name' },
        { path: 'ip', label: 'IP' },
        { path: 'port', label: 'Port' }
      ]}
      esignEnabled={props?.config?.config?.esign_status === true}
    />
  )
}

export default TableControlPanelMaster

