import {Table,Box,TableBody,TableCell,TableContainer,Typography} from "@mui/material";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useEffect, useLayoutEffect, useState } from "react";
import { api } from 'src/utils/Rest-API';
import moment from "moment";
import { getTokenValues } from "src/utils/tokenUtils";
import StatusChip from "./StatusChip";
import { statusObj } from "src/configs/statusConfig";
;

const List = ({data}) => {
    const [config, setConfig] = useState(null);



  const styles = {
    tableContainer: {
      width: "100%",
      boxShadow: "none",
      backgroundColor:'#fff',
      marginTop:20,
      marginRight:10
    },
    cellWrapper: {
      display: "flex",
      alignItems: "center",
    },
    image: {
      width: "32px",
      height: "32px",
      borderRadius: "50%",
      marginRight: "10px",
      objectFit: "cover",
    },
    status: {
      padding: "5px",
      borderRadius: "5px",
      fontSize: "14px",
      fontWeight: 500,
    },
    approved: {
      color: "green",
      backgroundColor: "rgba(0, 128, 0, 0.151)",
    },
    pending: {
      color: "goldenrod",
      backgroundColor: "rgba(189, 189, 3, 0.103)",
    },
    tableCell: {
      fontWeight: 500,
      fontSize: "14px",
      padding:20,
    },
  };

  useLayoutEffect(() => {
      const decodedToken = getTokenValues();
      setConfig(decodedToken);
      return () => { }
    }, [])

  
  return (
    <Box 
    sx={{
        width: '100%',
        bgcolor: '#fff',
        p: 3,
        borderRadius: 2,
        boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
        mb: 3,
      }}
    >
 <Typography variant="h4" // Larger text than h6
  sx={{
    ml:5,
    fontWeight: 800, // Bolder weight
    color: 'text.primary',
    my: 2,
    letterSpacing: '0.5px',
  }}>
  Recently Added Batches
</Typography>
    <TableContainer component={Paper} style={styles.tableContainer}>
      <Table sx={{ minWidth: 650 }} size="small">
        <TableHead style={{fontWeight:'bold'}}>
          <TableRow>
            <TableCell style={styles.tableCell}>Product</TableCell>
            <TableCell style={styles.tableCell}>Batch</TableCell>
            <TableCell style={styles.tableCell}>Quantity</TableCell>
            <TableCell style={styles.tableCell}>Manufacture Date</TableCell>
            <TableCell style={styles.tableCell}>Expiry Date</TableCell>

{            config?.config?.esign_status &&  <TableCell style={styles.tableCell}> Esign</TableCell>

}          </TableRow>
        </TableHead>
        <TableBody>
          {data?.recentBatch?.map((row,key) => (
            <TableRow key={key}>
              <TableCell style={styles.tableCell}>
                  {row.product.product_name}
              </TableCell>
              <TableCell style={styles.tableCell}>{row?.batch_no}</TableCell>
              <TableCell style={styles.tableCell}>{row?.qty}</TableCell>
              <TableCell style={styles.tableCell}>{moment(row?.manufacturing_date).format('DD-MM-YYYY')}</TableCell>
              <TableCell style={styles.tableCell}>{moment(row?.expiry_date).format('DD-MM-YYYY')}</TableCell>
              {config?.config?.esign_status === true && (
                        <StatusChip
                          label={row.esign_status}
                          color={statusObj[row.esign_status]?.color || 'default'}
                        />
                      )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    </Box>
  );
};

export default List;