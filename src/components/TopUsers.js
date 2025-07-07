import React, { useRef } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  Stack,
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

const TopUserShow = ({ data }) => {
  const { settings } = useSettings();
    console.log(settings.themeColor)

  const userData = data?.topUsers;
  const topUserData = data?.topUserDetails;
  const scrollRef = useRef(null);

  return (
    <Card
      sx={{
        width: '100%',
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
          fontWeight: 560,
          //background: '#00d09c',
          backgroundColor:settings.themeColor,
          padding: 3,
        }}
      >
        Top Users
      </Typography>

      <CardContent>
        <TableContainer component={Paper} elevation={0} sx={{ boxShadow: 'none' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell align="left" sx={{ fontWeight: 700, color: '#333' }}>Index</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#333' }}>Name</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#333', textAlign: 'center', }}>Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {userData?.map((item, index) => (
                <TableRow
                  key={item.user_id}
                  hover
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell align="left" sx={{ fontSize: 15 }}>{index + 1}</TableCell>
                  <TableCell align="center" sx={{ fontSize: 15 }}>{item.user_id}</TableCell>
                  <TableCell align="right" sx={{ fontSize: 15, textAlign: 'center' }}>{item.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.3)' }} />

        <Typography
          variant="h5"
          sx={{ mb: 2, textAlign: 'center', fontWeight: 'bold', color: '#333' }}
        >
          Top User
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box
            ref={scrollRef}
            sx={{
              display: 'flex',
              overflowX: 'auto',
              py: 1,
              '&::-webkit-scrollbar': { display: 'none' },
              flex: 1,
              justifyContent: 'center',
            }}
          >
            {topUserData?.map((user, index) => (
              <Card
                key={user?.user_id}
                sx={{
                  minWidth: 120,
                  maxWidth: 120,
                  mx: 1,
                  textAlign: 'center',
                  p: 2,
                  borderRadius: 0,
                  border: '0px solid #e0e0e0',
                }}
              >
                <Stack alignItems="center" spacing={1}>
                  {/* <img
                    src={user?.profile_photo}
                    crossOrigin="anonymous"
                    alt="Profile"
                    style={{
                      width: '80px',
                      height: '80px',
                      objectFit: 'cover',
                      borderRadius: '50%',
                      marginTop: 4,
                    }}
                  /> */}
                  <img
                    src={user?.profile_photo || '/images/avatars/1.png'}
                    crossOrigin="anonymous" 
                    alt="/images/avtars/1.png"
                    style={{
                      width: '80px',
                      height: '80px',
                      objectFit: 'cover',
                      borderRadius: '50%',
                      marginTop: 4,
                      backgroundColor: '#e0e0e0' // fallback bg for missing images
                    }}
                  />

                  <Typography style={{ fontSize: 15, marginTop: 10 }}>{user?.user_id}</Typography>
                  <Typography style={{ fontSize: 16, marginTop: 5, marginBottom: 10 }}>{user?.user_name}</Typography>
                </Stack>
              </Card>
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
TopUserShow.propTypes={
  data:PropTypes.any
}
export default TopUserShow;
