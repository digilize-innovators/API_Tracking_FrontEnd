import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from "@mui/material";
import { useSettings } from 'src/@core/hooks/useSettings';
import PropTypes from "prop-types";

const TopLineShow = ({ data }) => {
  const { settings } = useSettings();
  console.log(settings.themeColor)
  const lineData = data?.topLines;

  return (
    <Card
      sx={{
        width: "100%",
        color: 'white',
        boxShadow: 4,
        border: '1px solid #e0e0e0',
        borderRadius: 0,
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
          //background: '#00d09c',
          backgroundColor: settings.themeColor,
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
                <TableCell align="right" sx={{ fontWeight: 700, color: '#333', textAlign: 'center' }}>Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lineData?.map((item, index) => (
                <TableRow
                  key={item?.line_name}
                  hover
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    transition: 'background-color 0.2s',
                  }}
                >
                  <TableCell align="left" sx={{ fontSize: 15 }}>{index + 1}</TableCell>
                  <TableCell align="center" sx={{ fontSize: 15 }}>{item?.line_name}</TableCell>
                  <TableCell align="right" sx={{ fontSize: 15, textAlign: 'center' }}>{item?.total}</TableCell>
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
TopLineShow.propTypes={
  data:PropTypes.any
}
export default TopLineShow;
