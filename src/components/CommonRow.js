import React, { Fragment } from "react";
import { Collapse, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography, Box } from "@mui/material";
import { ChevronDown, ChevronUp } from "mdi-material-ui";
import StatusChip from "./StatusChip";
import { statusObj } from "src/configs/statusConfig";
import moment from "moment";
import { MdModeEdit, MdOutlineDomainVerification } from "react-icons/md";
import { getFieldValue } from "src/utils/rowUtils";

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

  return (
    <Fragment>
      {/* Main Row */}
      <TableRow sx={{ '& > *': { borderBottom: '1px solid rgba(224, 224, 224, 1)' } }}>
        {
          historyColumns.length > 0 ? (
            <TableCell className='p-2'>
              <IconButton size='small' onClick={() => handleRowToggle(row.id)}>
                {isOpen ? <ChevronUp /> : <ChevronDown />}
              </IconButton>
            </TableCell>
          ) : <TableCell className='p-2'></TableCell>
        }

        <TableCell align='center'>{serialNumber}</TableCell>

        {columns.map((col, idx) => (
          <TableCell key={idx} align='center'>
            {getFieldValue(row, col)}
          </TableCell>
        ))}

        {config?.config?.esign_status && (
          <TableCell align='center'>
              <StatusChip label={row?.esign_status} color={statusObj[row?.esign_status]?.color || 'default'} />
          </TableCell>
        )}

        <TableCell align='center'>
          {moment(row?.updated_at).format('DD/MM/YYYY, hh:mm:ss a')}
        </TableCell>

        <TableCell align='center'>
          {customActions ? (
            customActions(row, index)
          ) : (
            row.esign_status === 'pending' && config?.config?.esign_status ? (
              <MdOutlineDomainVerification fontSize={20} onClick={() => handleAuthCheck(row)} />
            ) : (
              <Tooltip title={!apiAccess.editApiAccess ? 'No edit access' : row?.isBatchEnd ? 'Cannot edit due to mark end-batch' : ''}>
                <span>
                  <MdModeEdit
                    fontSize={20}
                    onClick={apiAccess.editApiAccess && !row?.isBatchEnd ? () => handleUpdate(row) : null}
                    style={{
                      cursor: apiAccess.editApiAccess ? 'pointer' : 'not-allowed',
                      opacity: apiAccess.editApiAccess ? 1 : 0.5
                    }}
                  />
                </span>
              </Tooltip>
            )
          )}
        </TableCell>
      </TableRow>

      {/* Collapsible History */}
      {isOpen && (
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
                        <TableCell key={idx} align='center'>
                          {col.label}
                        </TableCell>
                      ))}
                      {config?.config?.esign_status && (
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
                        {config?.config?.esign_status && (
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
      )}
    </Fragment>
  );
};

export { CommonRow }
