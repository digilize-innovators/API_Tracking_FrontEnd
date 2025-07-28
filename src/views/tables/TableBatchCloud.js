import React from 'react'
import { Tooltip } from '@mui/material'
import moment from 'moment'
import { MdOutlineCloudUpload } from 'react-icons/md'
import CommonTableWrapper from 'src/components/CommonTableWrapper'
import PropTypes from 'prop-types'

const TableBatchCloud = props => {
  const customActions = row => {
    const isApproved = row.esign_status === 'approved';
    const canUploadToCloud = isApproved && row.isBatchEnd && !row?.sent_to_cloud

    return (
      <Tooltip title={canUploadToCloud ? 'Send to Cloud' : 'Not allowed'}>
        <MdOutlineCloudUpload
          fontSize={20}
          onClick={canUploadToCloud ? () => props.handleUpdate(row) : undefined}
          style={{
            cursor: canUploadToCloud ? 'pointer' : 'not-allowed',
            opacity: canUploadToCloud ? 1 : 0.5,
          }}
        />
      </Tooltip>
    )
  }
 
  return (
    <CommonTableWrapper
      {...props}
      endpoint='/batch/'
      columns={[
        { path: 'batch_no', label: 'Batch No.' },
        { path: 'product.product_history[0].product_name', label: 'Product Name' },
        { path: 'location.history[0].location_name', label: 'Location Name' },
        {
          path: 'manufacturing_date',
          label: 'Mfg. Date',
          render: row => <>{moment(row.manufacturing_date).format('DD/MM/YYYY')}</>
        },
        {
          path: 'expiry_date',
          label: 'Exp. Date',
          render: row => <>{moment(row.expiry_date).format('DD/MM/YYYY')}</>
        },
        { path: 'qty', label: 'Qty' },
        {
          path: 'sent_to_cloud',
          label: 'Status',
          render: row => <>{row.sent_to_cloud ? 'Completed' : 'Pending'}</>
        }
      ]}
      historyColumns={[
        { path: 'batch_no', label: 'Batch No.' },
        { path: 'product.product_history[0].product_name', label: 'Product Name' },
        { path: 'location.history[0].location_name', label: 'Location Name' },
        {
          path: 'manufacturing_date',
          label: 'Mfg. Date',
          render: row => <>{moment(row.manufacturing_date).format('DD/MM/YYYY')}</>
        },
        {
          path: 'expiry_date',
          label: 'Exp. Date',
          render: row => <>{moment(row.expiry_date).format('DD/MM/YYYY')}</>
        },
        { path: 'qty', label: 'Qty' },
        {
          path: 'sent_to_cloud',
          label: 'Status',
          render: row => <>{row.sent_to_cloud ? 'Completed' : 'Pending'}</>
        }
      ]}
      esignEnabled={props?.config?.config?.esign_status === true}
      customActions={customActions}
    />
  )
}

export default TableBatchCloud
TableBatchCloud.propTypes = {
  handleUpdate:PropTypes.any,
  config: PropTypes.shape({
    config: PropTypes.shape({
      esign_status: PropTypes.bool
    })
  })
}