import PropTypes from 'prop-types'
import React from 'react'
import CommonTableWrapper from 'src/components/CommonTableWrapper'
import StatusChip from 'src/components/StatusChip'
import { statusObj } from 'src/configs/statusConfig'

const TablePrinterLineConfiguration = props => {
  return (
    <CommonTableWrapper
      {...props}
      endpoint='/printerlineconfiguration/'
      columns={[
        { path: 'printer_line_name', label: 'PrinterLine Name' },
        { path: 'PrinterCategory.PrinterCategoryHistory[0].printer_category_name', label: 'Printer Category' },
        { path: 'PrinterMaster.PrinterMasterHistory[0].printer_id', label: 'Priner ID' },
        { path: 'ControlPanel.ControlPanelMasterHistory[0].name', label: 'ControlPanel' },
        { path: 'line_no', label: 'Line No.' },
        {
          label: 'Camera',
          path: 'camera_enable',
          render: row => {
            const status = row.camera_enable ? 'enabled' : 'disabled'
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
        { path: 'printer_line_name', label: 'PrinterLine Name' },
        { path: 'PrinterCategory.PrinterCategoryHistory[0].printer_category_name', label: 'Printer Category' },
        { path: 'PrinterMaster.PrinterMasterHistory[0].printer_id', label: 'Priner ID' },
        { path: 'ControlPanelMaster.ControlPanelMasterHistory[0].name', label: 'ControlPanel' },
        { path: 'line_no', label: 'Line No.' },
        { path: 'area_category.history[0].area_category_name', label: 'Area Category' },
        { path: 'area.history[0].area_name', label: 'Area' },
        { path: 'locations.history[0].location_name', label: 'Location' },
        {
          label: 'Camera',
          path: 'camera_enable',
          render: row => {
            const status = row.camera_enable ? 'enabled' : 'disabled'
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

export default TablePrinterLineConfiguration

TablePrinterLineConfiguration.propTypes = {
  config: PropTypes.shape({
    config: PropTypes.shape({
      esign_status: PropTypes.bool
    })
  })
}