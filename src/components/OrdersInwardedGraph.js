// import React from 'react';
// import {
//   BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
// } from 'recharts';

// const OrdersInwarded = ({ data }) => {
//   const formattedData = Array.isArray(data)
//     ? data
//         .filter(item => item && item.codeGenerated !== undefined && (item.year || item.month || item.date))
//         .map(item => ({
//           ...item,
//           name: item.date || item.month || String(item.year),
//         }))
//     : [];

//   return (
//     <div style={{
//       background: '#fff',
//       padding: '20px',
//       margin: '10px auto',
//       width: '23.5vw',
//       height: '18.5vw',
//       fontFamily: 'sans-serif',
//       boxShadow: '2px 4px 10px 1px rgba(201, 201, 201, 0.47)',
//     }}>
//       <h3 style={{
//         marginBottom: '12px',
//         fontSize: '20px',
//         color: 'gray',
//         fontWeight: '580'
//       }}>
//         Orders Inwarded
//       </h3>

//       <ResponsiveContainer width="100%" height="100%">
//         <BarChart
//           data={formattedData}
//           margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
//         >
//           {/* Removed CartesianGrid to eliminate dashed background lines */}

//           <XAxis
//             type="category"
//             dataKey="name"
//             tick={{ fontSize: 12 }}
//           />
//           <YAxis
//             type="number"
//             tick={{ fontSize: 12 }}
//             axisLine={true}
//             tickLine={false}
//           />
//           <Tooltip
//             contentStyle={{
//               backgroundColor: '#393939',
//               borderRadius: '4px',
//               border: 'none',
//               color: '#fff',
//               fontSize: 12,
//             }}
//           />
//           <Legend />
//           <Bar
//             dataKey="codeGenerated"
//             fill="#00d09c"
//             //radius={[10, 10, 0, 0]}
//             barSize={20}
//           />
//         </BarChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// export default OrdersInwarded;

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const OrdersInwarded = () => {
  // Static sample data for design
  const formattedData = [
    { name: 'Jan', OrdersInwarded: 150 },
    { name: 'Feb', OrdersInwarded: 120 },
    { name: 'Mar', OrdersInwarded: 180 },
    { name: 'Apr', OrdersInwarded: 140 },
    { name: 'May', OrdersInwarded: 200 },
    { name: 'Jun', OrdersInwarded: 170 },
    { name: 'Jul', OrdersInwarded: 160 },
    { name: 'Aug', OrdersInwarded: 190 },
    { name: 'Sep', OrdersInwarded: 130 },
    { name: 'Oct', OrdersInwarded: 210 },
  ];

  return (
    <div
      style={{
        background: '#fff',
        padding: '20px',
        margin: '10px auto',
        width: '23.5vw',
        height: '18.5vw',
        fontFamily: 'sans-serif',
        boxShadow: '2px 4px 10px 1px rgba(201, 201, 201, 0.47)',
      }}
    >
      <h3
        style={{
          marginBottom: '12px',
          fontSize: '20px',
          color: 'gray',
          fontWeight: '580',
        }}
      >
       Orders Inwarded
      </h3>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={formattedData}
          margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
        >
          <XAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            type="number"
            tick={{ fontSize: 12 }}
            axisLine={true}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#393939',
              borderRadius: '4px',
              border: 'none',
              color: '#fff',
              fontSize: 12,
            }}
          />
          <Legend />
          <Bar
            dataKey="OrdersInwarded"
            fill="#00d09c"
            barSize={20}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OrdersInwarded;