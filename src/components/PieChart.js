// // src/components/PieChart.js

// import React, { useEffect, useState } from 'react';
// import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

// const COLORS = ['#00d09c', '#5EADAE', '#FFBB28', '#FF8042'];

// const RADIAN = Math.PI / 180;
// const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
//   const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
//   const x = cx + radius * Math.cos(-midAngle * RADIAN);
//   const y = cy + radius * Math.sin(-midAngle * RADIAN);

//   return (
//     <text
//       x={x}
//       y={y}
//       fill="white"
//       textAnchor={x > cx ? 'start' : 'end'}
//       dominantBaseline="central"
//       fontSize={12}
//     >
//       {`${(percent * 100).toFixed(0)}%`}
//     </text>
//   );
// };

// const Piechart = ({ data }) => {
//   const [newData, setNewData] = useState([]);

//   useEffect(() => {
//     const tempData = data?.reduce(
//       (preValue, currentVal, index) => {
//         preValue['totalCreate'] += currentVal['totalBatch'];
//         preValue['executeCode'] += currentVal['executedBatch'];
//         if (index === data.length - 1) {
//           preValue['totalCreate'] /= data.length;
//           preValue['executeCode'] /= data.length;
//         }
//         return preValue;
//       },
//       { totalCreate: 0, executeCode: 0 }
//     );

//     setNewData([
//       { name: 'totalBatch', value: tempData?.totalCreate },
//       { name: 'executedBatch', value: tempData?.executeCode }
//     ]);
//   }, [data]);

//   return (
//     <div style={{
//       background: '#fff',
//       padding: '20px',
//       margin: '10px auto',
//       width: '23.5vw',
//       height: '18.5vw',
//       fontFamily: 'sans-serif',
//       boxShadow: '2px 4px 10px 1px rgba(201, 201, 201, 0.47)'
//     }}>
//       <h3 style={{
//         marginBottom: '12px',
//         fontSize: '20px',
//         color: 'gray',
//         fontWeight: '580'
//       }}>
//         Top Selling Products
//       </h3>

//       <ResponsiveContainer width="100%" height="100%">
//         <PieChart margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
//           <Pie
//             data={newData}
//             cx="50%"
//             cy="50%"
//             labelLine={false}
//             label={renderCustomizedLabel}
//             outerRadius={80}
//             fill="#00d09c"
//             dataKey="value"
//             isAnimationActive={false}
//           >
//             {newData.map((entry, index) => (
//               <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//             ))}
//           </Pie>
//           <Tooltip
//                contentStyle={{
//                 borderRadius: '4px',
//                 color: '#fff',
//                 fontSize: 12,
//               }}
//           />
//           <Legend />
//         </PieChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// export default Piechart;

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#00d09c', '#5EADAE', '#FFBB28', '#FF8042', '#FF6666', '#66B2FF'];

const staticProductData = [
  { name: 'Product A', value: 320 },
  { name: 'Product B', value: 270 },
  { name: 'Product C', value: 190 },
  { name: 'Product D', value: 140 },
  { name: 'Product E', value: 90 },
  { name: 'Product F', value: 80 },
];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={12}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const Piechart = () => {
  return (
    <div style={{
      background: '#fff',
      padding: '20px',
      margin: '10px auto',
      width: '23.5vw',
      height: '18.5vw',
      fontFamily: 'sans-serif',
      boxShadow: '2px 4px 10px 1px rgba(201, 201, 201, 0.47)'
    }}>
      <h3 style={{
        marginBottom: '12px',
        fontSize: '20px',
        color: 'gray',
        fontWeight: '580'
      }}>
        Total Orders Dispatched
      </h3>

      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
          <Pie
            data={staticProductData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            fill="#00d09c"
            dataKey="value"
            isAnimationActive={false}
          >
            {staticProductData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: '4px',
              color: '#fff',
              fontSize: 12,
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Piechart;
