import PropTypes from 'prop-types'
import React from 'react'
import CommonTableWrapper from 'src/components/CommonTableWrapper'

const TableLocation = props => {
  return (
    <CommonTableWrapper
      {...props}
      endpoint='/location/'
      columns={[
        { label: 'Location ID', path: 'location_id' },
        { label: 'Location Name', path: 'location_name' },
        { label: 'Mfg.Lic', path: 'mfg_licence_no' },
        { label: 'Mfg. Name', path: 'mfg_name' },
        { label: 'Location Type', path: 'location_type' }
      ]}
      historyColumns={[
        { label: 'Location ID', path: 'location_id' },
        { label: 'Location Name', path: 'location_name' },
        { label: 'Mfg.Lic', path: 'mfg_licence_no' },
        { label: 'Mfg. Name', path: 'mfg_name' },
        { label: 'Location Type', path: 'location_type' }
      ]}
      esignEnabled={props?.config?.config?.esign_status === true}
    />
  )
}

export default TableLocation

TableLocation.propTypes = {
  config: PropTypes.shape({
    config: PropTypes.shape({
      esign_status: PropTypes.bool
    })
  })
}