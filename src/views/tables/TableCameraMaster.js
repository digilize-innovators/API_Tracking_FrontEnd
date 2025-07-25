import React from 'react'
import CommonTableWrapper from 'src/components/CommonTableWrapper'

const TableCameraMaster = props => {
  return (
    <CommonTableWrapper
      {...props}
      endpoint='/cameramaster/'
      columns={[
        { path: 'name', label: 'Camera Name' },
        { path: 'ip', label: 'Camera IP' },
        { path: 'port', label: 'Camera Port' }
      ]}
      historyColumns={[
        { path: 'name', label: 'Camera Name' },
        { path: 'ip', label: 'Camera IP' },
        { path: 'port', label: 'Camera Port' }
      ]}
      esignEnabled={props?.config?.config?.esign_status === true}
    />
  )
}

export default TableCameraMaster


