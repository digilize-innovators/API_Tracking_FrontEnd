
// // src/components/ScatterChart.js

// import React from 'react';
// import {
//   Legend,
//   Scatter,
//   ScatterChart,
//   Tooltip,
//   XAxis,
//   YAxis,
//   ResponsiveContainer
// } from 'recharts';

// const Scatterchart = ({ data }) => {
//   const formattedDataExecuted = data?.map(el => ({ name: el.name, y: el.executedBatch })) || [];
//   const formattedDataTotal = data?.map(el => ({ name: el.name, y: el.totalBatch })) || [];

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
//         Cases Dispatched
//       </h3>

//       <ResponsiveContainer width="100%" height="100%">
//         <ScatterChart margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
//           <XAxis
//             dataKey="name"
//             type={data?.length && typeof data[0]?.name === 'number' ? 'number' : 'category'}
//             domain={data?.length && typeof data[0]?.name === 'number' ? ['auto', 'auto'] : undefined}
//             tick={{ fontSize: 12 }}
//             axisLine={true}
//             tickLine={false}
//             padding={{ left: 25 }}
//           />
//           <YAxis
//             dataKey="y"
//             type="number"
//             tick={{ fontSize: 12 }}
//             axisLine={true}
//             tickLine={false}
//           />
//           <Tooltip
//             contentStyle={{
//               borderRadius: '4px',
//               color: '#fff',
//               fontSize: 12,
//             }}
//           />
//           <Legend />
//           <Scatter name="executedBatch" data={formattedDataExecuted} fill="#00d09c" />
//           <Scatter name="totalBatch" data={formattedDataTotal} fill="#5EADAE" />
//         </ScatterChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// export default Scatterchart;

// src/components/ScatterChart.js

import React from 'react';
import {
  Legend,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer
} from 'recharts';

const staticDispatchData = [
  { year: 2018, cases: 120 },
  { year: 2019, cases: 150 },
  { year: 2020, cases: 100 },
  { year: 2021, cases: 180 },
  { year: 2022, cases: 200 },
  { year: 2023, cases: 220 },
];

const Scatterchart = () => {
  const years = staticDispatchData.map(item => item.year);

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
        Cases Dispatched
      </h3>

      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
          <XAxis
            dataKey="year"
            type="number"
            domain={['dataMin', 'dataMax']}
            ticks={years}
            tick={{ fontSize: 12 }}
            axisLine
            tickLine={false}
            padding={{ left: 25 }}
          />
          <YAxis
            dataKey="cases"
            type="number"
            tick={{ fontSize: 12 }}
            axisLine
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: '4px',
              color: '#fff',
              fontSize: 12,
            }}
          />
          <Legend />
          <Scatter name="Cases Dispatched" data={staticDispatchData} fill="#00d09c" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Scatterchart;
