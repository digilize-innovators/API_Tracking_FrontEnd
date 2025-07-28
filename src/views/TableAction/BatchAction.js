import PropTypes from 'prop-types'
import { MdOutlineCloudUpload } from 'react-icons/md'
import { Tooltip, TableCell } from '@mui/material'

const BatchAction = ({ row, handleUpdate }) => {
  const isApproved = row.esign_status === 'approved'
  const isEndBatch = row.isBatchEnd === true
  const sentToCloud = row?.sent_to_cloud
  const canUploadToCloud = isApproved && isEndBatch && !sentToCloud

  return (
    <TableCell align='center' className='p-2'>
      <Tooltip title={canUploadToCloud ? 'Send to Cloud' : 'Not allowed'}>
        <MdOutlineCloudUpload
          fontSize={20}
          onClick={canUploadToCloud ? () => handleUpdate(row) : undefined}
          style={{
            cursor: canUploadToCloud ? 'pointer' : 'not-allowed',
            opacity: canUploadToCloud ? 1 : 0.5
          }}
        />
      </Tooltip>
    </TableCell>
  )
}
BatchAction.propTypes = {
  row: PropTypes.any,
  config: PropTypes.any,
  apiAccess: PropTypes.any,
  handleAuthCheck: PropTypes.any,
  handleUpdate: PropTypes.any
}
export default BatchAction
