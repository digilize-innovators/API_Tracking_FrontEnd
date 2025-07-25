import React from 'react'
import CommonTableWrapper from 'src/components/CommonTableWrapper'

const TableArea = props => {
  return (
    <CommonTableWrapper
      {...props}
      endpoint='/area/'
      columns={[
        { path: 'area_id', label: 'Area ID' },
        { path: 'area_name', label: 'Area Name' },
        { path: 'area_category.history[0].area_category_name', label: 'Area Category' },
        { path: 'location.history[0].location_name', label: 'Location Name' }
      ]}
      historyColumns={[
        { label: 'Area ID', path: 'area_id' },
        { label: 'Area Name', path: 'area_name' },
        { label: 'Area Category', path: 'area_category.history[0].area_category_name' },
        { label: 'Location', path: 'location.history[0].location_name' }
      ]}
      esignEnabled={props?.config?.config?.esign_status === true}
    />
  )
}

export default TableArea
