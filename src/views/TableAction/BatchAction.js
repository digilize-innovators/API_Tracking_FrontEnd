import PropTypes from "prop-types";
import { MdModeEdit, MdOutlineDomainVerification, MdOutlineCloudUpload } from 'react-icons/md'
import {
  Tooltip,
  TableCell,
} from '@mui/material'
const BatchAction = ({ row, config, apiAccess, isBatchCloud, handleAuthCheck, handleUpdate }) => {
  const esignEnabled = config?.config?.esign_status === true;
  const isPending = row.esign_status === 'pending';
  const isApproved = row.esign_status === 'approved';
  const isEndBatch = row.isBatchEnd === true;
  const canEdit = apiAccess?.editApiAccess === true;
  const sentToCloud = row?.sent_to_cloud;

  const canUploadToCloud = isApproved && isEndBatch && !sentToCloud;

  const renderCloudUploadIcon = () => (
    <MdOutlineCloudUpload
      fontSize={20}
      onClick={canUploadToCloud ? () => handleUpdate(row) : undefined}
      style={{
        cursor: canUploadToCloud ? 'pointer' : 'not-allowed',
        opacity: canUploadToCloud ? 1 : 0.5
      }}
    />
  );

  const renderEditIcon = () => (
    <MdModeEdit
      fontSize={20}
      onClick={canEdit && !isEndBatch ? () => handleUpdate(row) : undefined}
      style={{
        cursor: canEdit ? 'pointer' : 'not-allowed',
        opacity: canEdit ? 1 : 0.5
      }}
    />
  );

  const getEditTooltipTitle = () => {
    if (!canEdit) return 'No edit access';
    if (isEndBatch) return 'Cannot edit due to mark end-batch';
    return '';
  };

  if (esignEnabled && isPending && !isBatchCloud) {
    return (
      <TableCell align="center" className="p-2">
        <MdOutlineDomainVerification fontSize={20} onClick={() => handleAuthCheck(row)} />
      </TableCell>
    );
  }

  return (
    <TableCell align="center" className="p-2">
      {isBatchCloud ? (
        <Tooltip title={canUploadToCloud ? 'Send to Cloud' : 'Not allowed'}>
          <span>{renderCloudUploadIcon()}</span>
        </Tooltip>
      ) : (
        <Tooltip title={getEditTooltipTitle()}>
          <span>{renderEditIcon()}</span>
        </Tooltip>
      )}
    </TableCell>
  );
};
BatchAction.propTypes={
    row:PropTypes.any, 
    config:PropTypes.any, 
    apiAccess:PropTypes.any, 
    isBatchCloud:PropTypes.any,
     handleAuthCheck:PropTypes.any,
      handleUpdate:PropTypes.any
}
export default BatchAction;
