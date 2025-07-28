import React from 'react'
import CommonTableWrapper from 'src/components/CommonTableWrapper'

const TablePrinterMaster = props => {
  return (
    <CommonTableWrapper
      {...props}
      endpoint='/printermaster/'
      columns={[
        { path: 'printer_id', label: 'Printer ID' },
        { path: 'printer_ip', label: 'Printer IP' },
        { path: 'printer_port', label: 'Printer Port' },
        { path: 'PrinterCategory.PrinterCategoryHistory[0].printer_category_name', label: 'Printer Category' },
      ]}
      historyColumns={[
        { path: 'printer_id', label: 'Printer ID' },
        { path: 'printer_ip', label: 'Printer IP' },
        { path: 'printer_port', label: 'Printer Port' },
        { path: 'PrinterCategory.PrinterCategoryHistory[0].printer_category_name', label: 'Printer Category' },
      ]}
      esignEnabled={props?.config?.config?.esign_status === true}
    />
  )
}

export default TablePrinterMaster

