// // //src/components/BarChart.js
// // import React from 'react'
// // import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
// import React from 'react'
// import { BarChart, ResponsiveContainer,XAxis, YAxis, Tooltip, Legend ,Bar } from "recharts";

// // import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

// // const Barchart = ({data}) => {
// //   return (
// //     <div style={{
// //       backgroundColor: '#fff',
// //       boxShadow: '2px 4px 10px 1px rgba(201, 201, 201, 0.47)',
// //       padding: '10px',
// //       color: 'gray',
// //       marginBottom: '10px',
// //       marginTop:'10px',
// //       width: '50%'
// //     }}>
// //       <div style={{
// //         marginBottom: '20px',
// //       }}> 
// //         Bar Graph</div>
// //       <BarChart
// //         width={600}
// //         height={300}
// //         data={data}
// //         margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
// //       >
// //         <XAxis dataKey="name" />
// //         <YAxis />
// //         <Tooltip />
// //         <Legend />
// //         <Bar dataKey="executedBatch" fill="#8884d8" />
// //         <Bar dataKey="totalBatch" fill="#82ca9d" />
// //       </BarChart>
// //     </div >
// //   );

// // }

// // export default Barchart
// // // import React from 'react';
// // // import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// // // const Barchart = ({ data }) => {
// // //   return (
// // //     <div style={{
// // //       backgroundColor: '#fff',
// // //       boxShadow: '2px 4px 10px 1px rgba(201, 201, 201, 0.47)',
// // //       padding: '10px',
// // //       color: 'gray',
// // //       marginBottom: '10px',
// // //       marginTop: '10px',
// // //       width: '100%',
// // //     }}>
// // //       <div style={{ marginBottom: '20px' }}>Bar Graph</div>
// // //       <div style={{ width: '50%', height: 300 }}>
// // //         <ResponsiveContainer width="100%" height="100%">
// // //           <BarChart
// // //             data={data}
// // //             margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
// // //           >
// // //             <XAxis dataKey="name" />
// // //             <YAxis />
// // //             <Tooltip />
// // //             <Legend />
// // //             <Bar dataKey="executedBatch" fill="#8884d8" />
// // //             <Bar dataKey="totalBatch" fill="#82ca9d" />
// // //           </BarChart>
// // //         </ResponsiveContainer>
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default Barchart;

// const Barchart = ({ data }) => {
//   return (
//     <div style={{
//       display: 'flex',
//       justifyContent: 'space-between',
//       padding: '10px',
//       marginTop: '10px',
//       marginBottom: '10px',
//       width: '30vw',
//       backgroundColor: '#fff',
//       boxShadow: '2px 4px 10px 1px rgba(201, 201, 201, 0.47)',
//       color: 'gray',
//     }}>
//       <div style={{ flex: 1, marginRight: '10px' }}>
//         <div style={{ marginBottom: '20px' }}>Bar Graph</div>
//         <div style={{ width: '100%', height: 300 }}>
//           <ResponsiveContainer width="100%" height="100%">
//             <BarChart
//               data={data}
//               margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
//             >
//               <XAxis dataKey="name" />
//               <YAxis />
//               <Tooltip />
//               <Legend />
//               <Bar dataKey="executedBatch" fill="#8884d8" />
//               <Bar dataKey="totalBatch" fill="#82ca9d" />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Barchart;
// import React from 'react';
// import {
//   BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
// } from 'recharts';

// // Custom tooltip for better visuals
// const CustomTooltip = ({ active, payload, label }) => {
//   if (active && payload && payload.length) {
//     return (
//       <div style={{
//         background: '#fff',
//         border: '1px solid #ccc',
//         padding: '10px',
//         borderRadius: '10px',
//         fontSize: '0.9rem',
//         boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
//       }}>
//         <p style={{ marginBottom: '5px', fontWeight: 'bold' }}>{label}</p>
//         {payload.map((entry, index) => (
//           <p key={index} style={{ color: entry.color, margin: 0 }}>
//             {entry.name}: {entry.value}
//           </p>
//         ))}
//       </div>
//     );
//   }

//   return null;
// };

// const Barchart = ({ data }) => {
//   return (
//     <div style={{
//       backgroundColor: '#ffffff',
//       boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
//       borderRadius: '12px',
//       padding: '20px',
//       margin: '20px auto',
//       width: '30vw',
//       height: '400px',
//       fontFamily: 'sans-serif',
//     }}>
//       <h3 style={{ marginBottom: '20px', color: '#333' }}>Production Overview</h3>
//       <ResponsiveContainer width="100%" height="100%">
//         <BarChart
//           data={data}
//           margin={{ top: 20, right: 30, left: 10, bottom: 30 }}
//         >
//           <defs>
//             <linearGradient id="colorExecuted" x1="0" y1="0" x2="0" y2="1">
//               <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
//               <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
//             </linearGradient>
//             <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
//               <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
//               <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1} />
//             </linearGradient>
//           </defs>

//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="name" tick={{ fontSize: 12 }} />
//           <YAxis tick={{ fontSize: 12 }} />
//           <Tooltip content={<CustomTooltip />} />
//           <Legend />
//           <Bar
//             dataKey="executedBatch"
//             fill="url(#colorExecuted)"
//             radius={[8, 8, 0, 0]}
//             barSize={30}
//           />
//           <Bar
//             dataKey="totalBatch"
//             fill="url(#colorTotal)"
//             radius={[8, 8, 0, 0]}
//             barSize={30}
//           />
//         </BarChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// export default Barchart;

// import React from 'react';
// import {
//   BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
// } from 'recharts';

// const CustomTooltip = ({ active, payload, label }) => {
//   if (active && payload && payload.length) {
//     return (
//       <div style={{
//         backgroundColor: '#1f1f2e',
//         border: '1px solid #5e5eff',
//         padding: '10px',
//         borderRadius: '10px',
//         color: '#fff',
//         fontSize: '0.9rem',
//         boxShadow: '0 0 10px rgba(94, 94, 255, 0.4)',
//       }}>
//         <p style={{ marginBottom: '5px', fontWeight: 600 }}>{label}</p>
//         {payload.map((entry, index) => (
//           <p key={index} style={{ color: entry.color, margin: 0 }}>
//             {entry.name}: {entry.value}
//           </p>
//         ))}
//       </div>
//     );
//   }

//   return null;
// };

// const Barchart = ({ data }) => {
//   return (
//     <div style={{
//       background: 'linear-gradient(145deg, #1e1e2f, #2c2c3e)',
//       boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
//       borderRadius: '16px',
//       padding: '30px',
//       margin: '40px auto',
//       width: '50vw',
//       height: '420px',
//       color: '#fff',
//       fontFamily: 'Poppins, sans-serif',
//     }}>
//       <h2 style={{
//         marginBottom: '20px',
//         color: '#a0a0ff',
//         fontWeight: 600,
//         letterSpacing: '0.5px',
//       }}>📊 Production Performance</h2>
//       <ResponsiveContainer width="100%" height="100%">
//         <BarChart
//           data={data}
//           margin={{ top: 20, right: 30, left: 10, bottom: 30 }}
//           barGap={10}
//         >
//           <CartesianGrid strokeDasharray="3 3" stroke="#3a3a5a" />
//           <XAxis dataKey="name" tick={{ fill: '#aaa', fontSize: 12 }} />
//           <YAxis tick={{ fill: '#aaa', fontSize: 12 }} />
//           <Tooltip content={<CustomTooltip />} />
//           <Legend wrapperStyle={{ color: '#ccc', fontSize: 12 }} />
//           <Bar
//             dataKey="executedBatch"
//             fill="#5e5eff"
//             radius={[10, 10, 0, 0]}
//             barSize={24}
//             animationDuration={800}
//           />
//           <Bar
//             dataKey="totalBatch"
//             fill="#00d09c"
//             radius={[10, 10, 0, 0]}
//             barSize={24}
//             animationDuration={800}
//           />
//         </BarChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// export default Barchart;

import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from 'recharts';

const Barchart = ({ data }) => {
  return (
    <div style={{
      background: '#fff',
      boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
      padding: '20px',
      margin: '10px auto',
      width: '35vw',
      height: '25.5vw',
      fontFamily: 'sans-serif',
    }}>
        <h3 style={{
        marginBottom: '12px',
        fontSize:'16px',
        color: 'gray',
      }}> Code Generation</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 20, right: 20, left: 0, bottom: 20 }} // Reduced left margin
        >
        
          <XAxis type="number" tick={{ fontSize: 12 }} />
          <YAxis  dataKey="name"
            type="category"
            tick={{ fontSize: 13 }}
            width={75} // Force narrow left space
            axisLine={true}
            tickLine={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="executedBatch" fill="#5e5eff" radius={[0, 10, 10, 0]} barSize={20} />
          <Bar dataKey="totalBatch" fill="#00d09c" radius={[0, 10, 10, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Barchart;
