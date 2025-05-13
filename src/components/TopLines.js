// import React from "react";
// import { Card, CardContent, Typography, Grid2, Divider } from "@mui/material";

// const TopLineShow = ({ data }) => {
//     const lineData = data?.topLines;

//     return (
//         <Card sx={{
//             width: "25%",
//             color: 'white',
//             boxShadow: 4,
//             borderRadius: 0,
//             border: '1px solid #e0e0e0',
//         }}>
//             <Typography variant="h5" sx={{
//                 mb: 0,
//                 textAlign: 'center',
//                 fontSize: '20px',
//                 color: '#333',
//                 fontWeight: 600,
//                 //background: 'linear-gradient(135deg, #00d09c 0%, #ffffff 100%)',
//                 background: '#00d09c',
//                 padding: 3
//             }}>
//                 Top Lines
//             </Typography>
//             <CardContent>

//                 <Grid2 container alignItems="center" sx={{ mb: 2, px: 1, display: 'flex', justifyContent: 'space-between' }}>
//                     <Grid2 item size={4} textAlign='left'>
//                         <Typography variant="subtitle2" sx={{ opacity: 0.9, fontWeight: '700', color: '#333' }}>
//                             Index
//                         </Typography>
//                     </Grid2>
//                     <Grid2 item size={4}>
//                         <Typography variant="subtitle2" sx={{ opacity: 0.9, fontWeight: '700', color: '#333', textAlign: 'center' }}>
//                             Name
//                         </Typography>
//                     </Grid2>
//                     <Grid2 item size={4} sx={{ textAlign: 'right' }}>
//                         <Typography variant="subtitle2" sx={{ opacity: 0.9, fontWeight: '700', color: '#333' }}>
//                             Total
//                         </Typography>
//                     </Grid2>
//                 </Grid2>

//                 {lineData?.map((item, index) => (
//                     <Grid2
//                         container
//                         alignItems="center"
//                         sx={{
//                             mb: 1.5,
//                             p: 1,
//                             ml: 3,
//                             mr: 2.5,
//                             borderRadius: 0,
//                             '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
//                         }}
//                         key={index}
//                     >
//                         <Grid2 item size={4} display="flex" justifyContent="flex-start" alignItems="center">
//                             <Typography style={{ fontSize: 15 }}>{index + 1}</Typography>
//                         </Grid2>
//                         <Grid2 item size={4} display="flex" alignItems="center">
//                             <Typography style={{ fontSize: 15, textAlign: 'center' }}>{item?.line_name}</Typography>
//                         </Grid2>
//                         <Grid2 item size={4} sx={{ textAlign: 'right' }}>
//                             <Typography style={{ fontSize: 15 }}>{item?.total}</Typography>
//                         </Grid2>
//                     </Grid2>
//                 ))}

//                 <Divider sx={{ my: 3, borderColor: 'rgba(0,0,0,0.1)' }} />
//             </CardContent>
//         </Card>
//     );
// };

// export default TopLineShow;


import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from "@mui/material";

const TopLineShow = ({ data }) => {
  const lineData = data?.topLines;

  return (
    <Card
      sx={{
        width: "25%",
        color: 'white',
        boxShadow: 4,
        border: '1px solid #e0e0e0',
      }}
    >
      <Typography
        variant="h5"
        sx={{
          mb: 0,
          textAlign: 'center',
          fontSize: '20px',
          color: '#333',
          fontWeight: 600,
          background: '#00d09c',
          padding: 3,
        }}
      >
        Top Lines
      </Typography>

      <CardContent>

        <TableContainer component={Paper} elevation={0} sx={{ boxShadow: 'none' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell align="left" sx={{ fontWeight: 700, color: '#333' }}>Index</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#333' }}>Name</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#333', textAlign:'center' }}>Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lineData?.map((item, index) => (
                <TableRow
                  key={index}
                  hover
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    transition: 'background-color 0.2s',
                  }}
                >
                  <TableCell align="left" sx={{ fontSize: 15 }}>{index + 1}</TableCell>
                  <TableCell align="center" sx={{ fontSize: 15 }}>{item?.line_name}</TableCell>
                  <TableCell align="right" sx={{ fontSize: 15 , textAlign:'center'}}>{item?.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* <Divider sx={{ my: 3, borderColor: 'rgba(0,0,0,0.1)' }} /> */}

      </CardContent>
    </Card>
  );
};

export default TopLineShow;
