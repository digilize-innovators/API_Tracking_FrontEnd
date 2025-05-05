// import { Table, Box, TableBody, TableCell, TableContainer, Typography } from "@mui/material";
// import TableHead from "@mui/material/TableHead";
// import TableRow from "@mui/material/TableRow";
// import Paper from "@mui/material/Paper";
// import { useEffect, useLayoutEffect, useState } from "react";
// import { api } from 'src/utils/Rest-API';
// import moment from "moment";
// import { getTokenValues } from "src/utils/tokenUtils";
// import StatusChip from "./StatusChip";
// import { statusObj } from "src/configs/statusConfig";

// const List = ({ data }) => {
//   const [config, setConfig] = useState(null);

//   const styles = {
//     tableContainer: {
//       width: "100%",
//       boxShadow: "none",
//       backgroundColor: '#fff',
//       marginTop: 20,
//       marginRight: 10
//     },
//     cellWrapper: {
//       display: "flex",
//       alignItems: "center",
//     },
//     image: {
//       width: "32px",
//       height: "32px",
//       borderRadius: "50%",
//       marginRight: "10px",
//       objectFit: "cover",
//     },
//     status: {
//       padding: "5px",
//       borderRadius: "5px",
//       fontSize: "14px",
//       fontWeight: 500,
//     },
//     approved: {
//       color: "green",
//       backgroundColor: "rgba(0, 128, 0, 0.151)",
//     },
//     pending: {
//       color: "goldenrod",
//       backgroundColor: "rgba(189, 189, 3, 0.103)",
//     },
//     tableCell: {
//       fontWeight: 500,
//       fontSize: "14px",
//       padding: 20,
//     },
//   };

//   useLayoutEffect(() => {
//     const decodedToken = getTokenValues();
//     setConfig(decodedToken);
//     return () => { }
//   }, [])


//   return (
//     <Box
//       sx={{
//         width: '100%',
//         bgcolor: '#fff',
//         p: 3,
//         borderRadius: 2,
//         boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
//         mb: 3,
//       }}
//     >
//       <Typography variant="subtitle2" // Larger text than h6
//         sx={{
//           ml: 5,
//           color: 'text.secondary',
//           fontWeight: 'bold',
//           fontSize: '1.3rem',
//         }}>
//         Recently Added Batches
//       </Typography>
//       <TableContainer component={Paper} style={styles.tableContainer}>
//         <Table sx={{ minWidth: 650 }} size="small">
//           <TableHead style={{ fontWeight: 'bold' }}>
//             <TableRow>
//               <TableCell style={styles.tableCell}>Product</TableCell>
//               <TableCell style={styles.tableCell}>Batch</TableCell>
//               <TableCell style={styles.tableCell}>Quantity</TableCell>
//               <TableCell style={styles.tableCell}>Manufacture Date</TableCell>
//               <TableCell style={styles.tableCell}>Expiry Date</TableCell>

//               {config?.config?.esign_status && <TableCell style={styles.tableCell}> Esign</TableCell>

//               }          </TableRow>
//           </TableHead>
//           <TableBody>
//             {data?.recentBatch?.map((row, key) => (
//               <TableRow key={key}>
//                 <TableCell style={styles.tableCell}>
//                   {row.product.product_name}
//                 </TableCell>
//                 <TableCell style={styles.tableCell}>{row?.batch_no}</TableCell>
//                 <TableCell style={styles.tableCell}>{row?.qty}</TableCell>
//                 <TableCell style={styles.tableCell}>{moment(row?.manufacturing_date).format('DD-MM-YYYY')}</TableCell>
//                 <TableCell style={styles.tableCell}>{moment(row?.expiry_date).format('DD-MM-YYYY')}</TableCell>
//                 {config?.config?.esign_status === true && (
//                   <StatusChip
//                     label={row.esign_status}
//                     color={statusObj[row.esign_status]?.color || 'default'}
//                   />
//                 )}
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </TableContainer>
//     </Box>
//   );
// };

// export default List;

import React, { useLayoutEffect, useState, Fragment } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Collapse,
  Paper,
  Tooltip
} from '@mui/material';
import { ChevronUp, ChevronDown } from 'mdi-material-ui';
import moment from 'moment';
import { MdModeEdit } from 'react-icons/md';
import { getTokenValues } from 'src/utils/tokenUtils';
import StatusChip from './StatusChip'; // Adjust path if needed
import { statusObj } from 'src/configs/statusConfig';

const List = ({ data }) => {
  const [config, setConfig] = useState(null);
  const [openRows, setOpenRows] = useState({});
  
  const headerBgColor = '#f5f5f5'; // You can use your theme color here

  useLayoutEffect(() => {
    const decodedToken = getTokenValues();
    setConfig(decodedToken);
    return () => {};
  }, []);

  const handleRowToggle = (id) => {
    setOpenRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const rowsWithHistory = data?.recentBatch?.map((row, index) => ({
    ...row,
    id: row.id || `row-${index}`,
    history: row.history || [
      {
        ...row,
        created_at: row.updated_at || row.created_at,
        area: {
          area_category: {
            area_category_name: row.product?.product_name
          }
        },
        location: {
          location_name: row.location_name || 'N/A'
        }
      }
    ]
  })) || [];

  return (
    <Box
      sx={{
        width: '100%',
        bgcolor: '#fff',
        p: 3,
        //boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
        boxShadow: '2px 4px 10px 1px rgba(201, 201, 201, 0.47)',
        mb: 3,
        borderRadius: 0
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{
          ml: 5,
          fontWeight: 'bold',
          fontSize: '1.3rem',
          //backgroundColor: headerBgColor,
          px: 2,
          py: 1,
          borderRadius: 0,
          display: 'inline-block'
        }}
      >
        Recently Added Batches
      </Typography>

      <Box sx={{ position: 'relative', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', mt: 2 , borderRadius:0}}>
        <TableContainer component={Paper}>
          <Table stickyHeader>
            <TableHead style={{ backgroundColor: headerBgColor }}>
              <TableRow>
                <TableCell />
                <TableCell align="center">Sr.No.</TableCell>
                <TableCell align="center">Product</TableCell>
                <TableCell align="center">Batch</TableCell>
                <TableCell align="center">Quantity</TableCell>
                <TableCell align="center">Manufacture Date</TableCell>
                <TableCell align="center">Expiry Date</TableCell>
                {config?.config?.esign_status === true && <TableCell align="center">E-Sign</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {rowsWithHistory.map((row, index) => {
                const isOpen = openRows[row.id];
                return (
                  <Fragment key={row.id}>
                    <TableRow>
                      <TableCell>
                        <IconButton size="small" onClick={() => handleRowToggle(row?.id)}>
                          {isOpen ? <ChevronUp /> : <ChevronDown />}
                        </IconButton>
                      </TableCell>
                      <TableCell align="center">{index + 1}</TableCell>
                      <TableCell align="center">{row?.product?.product_name}</TableCell>
                      <TableCell align="center">{row?.batch_no}</TableCell>
                      <TableCell align="center">{row?.qty}</TableCell>
                      <TableCell align="center">{moment(row?.manufacturing_date).format('DD-MM-YYYY')}</TableCell>
                      <TableCell align="center">{moment(row?.expiry_date).format('DD-MM-YYYY')}</TableCell>
                      {config?.config?.esign_status === true && (
                        <TableCell align="center">
                          <StatusChip
                            label={row?.esign_status}
                            color={statusObj[row?.esign_status]?.color || 'default'}
                          />
                        </TableCell>
                      )}
                    </TableRow>

                    {isOpen && (
                      <TableRow>
                        <TableCell colSpan={9}>
                          <Collapse in={isOpen} timeout="auto" unmountOnExit>
                            <Box sx={{ mx: 2 }}>
                              <Typography variant="h6" gutterBottom>
                                History
                              </Typography>
                              <Table size="small">
                                <TableHead style={{ backgroundColor: headerBgColor }}>
                                  <TableRow>
                                    <TableCell align="center">Sr.No.</TableCell>
                                    <TableCell align="center">Product</TableCell>
                                    <TableCell align="center">Batch</TableCell>
                                    <TableCell align="center">Quantity</TableCell>
                                    <TableCell align="center">MFG</TableCell>
                                    <TableCell align="center">EXP</TableCell>
                                    {config?.config?.esign_status && (
                                      <TableCell align="center">E-Sign</TableCell>
                                    )}
                                    <TableCell align="center">Updated At</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {row.history.map((h, i) => (
                                    <TableRow key={i}>
                                      <TableCell align="center">{i + 1}</TableCell>
                                      <TableCell align="center">{h?.product?.product_name}</TableCell>
                                      <TableCell align="center">{h?.batch_no}</TableCell>
                                      <TableCell align="center">{h?.qty}</TableCell>
                                      <TableCell align="center">{moment(h?.manufacturing_date).format('DD-MM-YYYY')}</TableCell>
                                      <TableCell align="center">{moment(h?.expiry_date).format('DD-MM-YYYY')}</TableCell>
                                      {config?.config?.esign_status && (
                                        <TableCell align="center">
                                          <StatusChip
                                            label={h?.esign_status}
                                            color={statusObj[h?.esign_status]?.color || 'default'}
                                          />
                                        </TableCell>
                                      )}
                                      <TableCell align="center">
                                        {moment(h?.created_at).format('DD-MM-YYYY, hh:mm:ss a')}
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
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default List;