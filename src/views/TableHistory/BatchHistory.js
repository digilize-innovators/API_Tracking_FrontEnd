import {
  Typography,
  TableCell,
  TableBody,
  TableHead,
  TableRow,
  Collapse,
  Table,
  Box
} from '@mui/material'
import moment from "moment";
import PropTypes from 'prop-types';
import StatusChip from 'src/components/StatusChip';
import { statusObj } from 'src/configs/statusConfig'


const BatchHistory = ({ historyData, row, config }) => {
  return (
    <TableRow>
      <TableCell colSpan={12}>
        <Collapse in={true} timeout="auto" unmountOnExit>
          <Box sx={{ mx: 2 }}>
            <Typography variant="h6" gutterBottom>
              History
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {['Sr.No.', 'Batch No.', 'Product Name', 'Location Name', 'Manufacturing Date', 'Expiry Date', 'Quantity']
                    .map((header, i) => (
                      <TableCell key={header} align="center">{header}</TableCell>
                    ))}
                  {config?.config?.esign_status && (
                    <TableCell align="center">E-Sign</TableCell>
                  )}
                  <TableCell align="center">Created At</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {historyData[row.id]?.map((historyRow, idx) => (
                  <TableRow key={historyRow.created_at}>
                    <TableCell align="center">{idx + 1}</TableCell>
                    <TableCell align="center">{historyRow.batch_no}</TableCell>
                    <TableCell align="center">{historyRow.product?.product_history[0]?.product_name}</TableCell>
                    <TableCell align="center">{historyRow.location?.history[0]?.location_name}</TableCell>
                    <TableCell align="center">{moment(historyRow.manufacturing_date).format('DD/MM/YYYY')}</TableCell>
                    <TableCell align="center">{moment(historyRow.expiry_date).format('DD/MM/YYYY')}</TableCell>
                    <TableCell align="center">{historyRow.qty}</TableCell>
                    {config?.config?.esign_status && (
                      <StatusChip
                        label={historyRow.esign_status}
                        color={statusObj[historyRow.esign_status]?.color || 'default'}
                      />
                    )}
                    <TableCell align="center">{moment(historyRow.created_at).format('DD/MM/YYYY, hh:mm:ss a')}</TableCell>
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
BatchHistory.propTypes={
     historyData:PropTypes.any,
      row:PropTypes.any,
       config:PropTypes.any
}
export default BatchHistory;
