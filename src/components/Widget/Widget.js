import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { MdOutlinePersonOutline, MdOutlineBatchPrediction } from "react-icons/md";
import { AiOutlineProduct, } from 'react-icons/ai'
import { TfiLayoutMediaRightAlt } from 'react-icons/tfi'
import { TbLocation } from "react-icons/tb";
import { MdProductionQuantityLimits } from "react-icons/md";
import { MdOutlineInventory2 } from "react-icons/md";
import Link from 'next/link';

const Widget = ({ data }) => {
  console.log("data", data)
  const metrics = [
    {
      title: 'Total Users',
      link: 'See all users',
      route: '/user',
      value: data?.statistics?.totalUsers,
      icon: <MdOutlinePersonOutline fontSize="large" />,
      color: 'crimson',
      bgColor: 'rgba(255, 0, 0, 0.2)',

    },
    {
      title: 'Total Products',
      link: 'See all products',
      route: '/product',
      value: data?.statistics?.totalProducts,
      icon: <AiOutlineProduct fontSize="medium" />,
      color: 'goldenrod',
      bgColor: 'rgba(218, 165, 32, 0.2)'
    },
    {
      title: 'Total Batches',
      link: 'See all batches',
      route: '/batch-master',
      value: data?.statistics?.totalBatches,
      icon: <MdOutlineBatchPrediction fontSize="medium" />,
      color: 'green',
      bgColor: 'rgba(0, 128, 0, 0.2)'
    },
    {
      title: 'MFG. Lines',
      link: 'See all Lines',
      route: '/printerlineconfiguration',
      value: data?.statistics?.activeManufacturingLines,
      icon: <TfiLayoutMediaRightAlt fontSize="medium" />,
      color: 'purple',
      bgColor: 'rgba(128, 0, 128, 0.2)'
    },
     {
      title: 'Total Orders Dispatched',
      link: 'See all orders dispatched',
      route: '/sales-order',
      value: data?.statistics?.totalDidpatchedOrder,
      icon: <MdProductionQuantityLimits fontSize="medium" />,
      color: 'purple',
      bgColor: 'rgba(128, 0, 128, 0.2)'
    },
    {
      title: 'Top Performing Locations',
      link: 'See all locations',
      route: '/batch-master',
      value: data?.statistics?.topPerformingLocationsCount,
      icon: <TbLocation fontSize="medium" />,
      color: 'green',
      bgColor: 'rgba(0, 128, 0, 0.2)'
    },
    // {
    //   title: 'Top selling products',
    //   link: 'See all selling products',
    //   route: '/sales-order',
    //   value: data?.statistics?.topSellingProducts,
    //   icon: <MdOutlineInventory2 fontSize="large" />,
    //   color: 'crimson',
    //   bgColor: 'rgba(255, 0, 0, 0.2)',
    // },
  ];
  // useEffect(()=>{ 
  //  getData()
  // },[])

  return (
    <Box sx={{
      minWidth: '100%',
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
      gap: 2,
      pb: 2,
    }}>
      {metrics.map((metric, index) => (
        <Card key={index} sx={{
          borderRadius: '0px',
          boxShadow: '2px 4px 10px 1px rgba(201, 201, 201, 0.47)',
          backgroundColor: '#fff'
        }}>
          <CardContent sx={{
            display: 'flex',
            justifyContent: 'space-between',
            p: 3,

          }}>
            {/* Left Section */}
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              <Typography variant="subtitle2" sx={{
                color: 'text.secondary',
                fontWeight: 'bold',
                fontSize: '1.3rem',
                //backgroundColor:'red',

              }}>
                {metric.title}
              </Typography>

              <Typography variant="h5" sx={{
                fontSize: '28px',
                color: '#333333',
                my: 3,
                fontWeight: 300,
              }}>
                {metric.value || 230}
              </Typography>
              <Link href={metric.route} passHref sx={{}}>
                <Typography variant="body2" sx={{
                  fontSize: '16px',
                  //color: '#333333',
                  color: '#50BDA0',
                  fontWeight: 570,
                  borderBottom: '0px solid gray',
                  '&:hover': { textDecoration: 'underline', cursor: 'pointer' }
                }}>
                  {metric.link}
                </Typography>
              </Link>
            </Box>

            {/* Right Section */}
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              alignItems: 'flex-end',
              //backgroundColor:'yellow'
            }}>


              <Box sx={{
                p: '5px',
                borderRadius: '5px',
                color: metric.color,
                backgroundColor: metric.bgColor,
                marginTop: 4,
                cursor: 'not-allowed'
              }}>
                {metric.icon}
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>

  );
}

export default Widget;