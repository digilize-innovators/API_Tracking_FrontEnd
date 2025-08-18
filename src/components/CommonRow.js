import React, { Fragment } from "react";
import { Collapse, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography, Box } from "@mui/material";
import { ChevronDown, ChevronUp } from "mdi-material-ui";
import StatusChip from "./StatusChip";
import { statusObj } from "src/configs/statusConfig";
import moment from "moment";
import { MdModeEdit, MdOutlineDomainVerification } from "react-icons/md";
import { getFieldValue } from "src/utils/rowUtils";
import PropTypes from "prop-types";

const CommonRow = ({
  row,
  index,
  isOpen,
  handleRowToggle,
  page,
  rowsPerPage,
  columns,
  historyColumns,
  historyData,
  config,
  handleAuthCheck,
  handleUpdate,
  apiAccess,
  customActions
}) => {
  const serialNumber = index + 1 + page * rowsPerPage;

  const canEdit = apiAccess.editApiAccess && !row?.isBatchEnd;
  const showEsignStatus = config?.config?.esign_status;

  const renderEditIcon = () => {
    if (customActions) return customActions(row, index);

    if (row.esign_status === 'pending' && showEsignStatus && config?.role !== 'admin') {
      return (
        <MdOutlineDomainVerification
          fontSize={20}
          onClick={() => handleAuthCheck(row)}
          style={{ cursor: 'pointer' }}
        />
      );
    }
    const getTooltipTitle = (hasEditAccess, isBatchEnd) => {
  if (!hasEditAccess) return 'No edit access';
  if (isBatchEnd) return 'Cannot edit due to mark end-batch';
  return '';
};

    return (
      <Tooltip
       title={getTooltipTitle(apiAccess.editApiAccess, row?.isBatchEnd)}
      >
        <span>
          <MdModeEdit
            fontSize={20}
            onClick={canEdit ? () => handleUpdate(row) : null}
            style={{
              cursor: canEdit ? 'pointer' : 'not-allowed',
              opacity: canEdit ? 1 : 0.5
            }}
          />
        </span>
      </Tooltip>
    );
  };

  const renderHistory = () => {
    if (!isOpen) return null;

    return (
      <TableRow>
        <TableCell colSpan={columns.length + 4}>
          <Collapse in={isOpen} timeout='auto' unmountOnExit>
            <Box sx={{ mx: 2 }}>
              <Typography variant='h6' gutterBottom>
                History
              </Typography>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell align='center'>Sr.No.</TableCell>
                    {historyColumns.map((col, idx) => (
                      <TableCell key={col.label} align='center'>
                        {col.label}
                      </TableCell>
                    ))}
                    {showEsignStatus && (
                      <TableCell align='center'>E-Sign</TableCell>
                    )}
                    <TableCell align='center'>Created At</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {historyData[row.id]?.map((historyRow, idx) => (
                    <TableRow key={historyRow.created_at}>
                      <TableCell align='center'>{idx + 1}</TableCell>
                      {historyColumns.map((col, i) => (
                        <TableCell key={i} align='center'>
                          {getFieldValue(historyRow, col)}
                        </TableCell>
                      ))}
                      {showEsignStatus && (
                        <TableCell align='center'>
                          <StatusChip
                            label={historyRow.esign_status}
                            color={statusObj[historyRow.esign_status]?.color || 'default'}
                          />
                        </TableCell>
                      )}
                      <TableCell align='center'>
                        {moment(historyRow.created_at).format('DD/MM/YYYY, hh:mm:ss a')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <Fragment>
      {/* Main Row */}
      <TableRow sx={{ '& > *': { borderBottom: '1px solid rgba(224, 224, 224, 1)' } }}>
        <TableCell className='p-2'>
          {historyColumns.length > 0 && (
            <IconButton size='small' onClick={() => handleRowToggle(row.id)}>
              {isOpen ? <ChevronUp /> : <ChevronDown />}
            </IconButton>
          )}
        </TableCell>

        <TableCell align='center'>{serialNumber}</TableCell>

        {columns.map((col, idx) => (
          <TableCell key={idx} align='center'>
            {getFieldValue(row, col)}
          </TableCell>
        ))}

        {showEsignStatus && config?.role !== 'admin' && (
          <TableCell align='center'>
            <StatusChip
              label={row?.esign_status}
              color={statusObj[row?.esign_status]?.color || 'default'}
            />
          </TableCell>
        )}

        <TableCell align='center'>
          {moment(row?.updated_at).format('DD/MM/YYYY, hh:mm:ss a')}
        </TableCell>

        <TableCell align='center'>{renderEditIcon()}</TableCell>
      </TableRow>

      {/* Collapsible History */}
      {renderHistory()}
    </Fragment>
  );
};


export { CommonRow }
CommonRow.propTypes={
 row:PropTypes.any,
  index:PropTypes.any,
  isOpen:PropTypes.any,
  handleRowToggle:PropTypes.any,
  page:PropTypes.any,
  rowsPerPage:PropTypes.any,
  columns:PropTypes.any,
  historyColumns:PropTypes.any,
  historyData:PropTypes.any,
  config:PropTypes.any,
  handleAuthCheck:PropTypes.any,
  handleUpdate:PropTypes.any,
  apiAccess:PropTypes.any,
  customActions:PropTypes.any

}
