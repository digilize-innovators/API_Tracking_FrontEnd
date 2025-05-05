//src/components/AreaChart.js

import React from "react";
import { Area, AreaChart, Tooltip, XAxis, YAxis, ResponsiveContainer, Legend } from "recharts";

const Areachart = ({ data }) => {
    return (
        <div style={{
            background: '#fff',
            //boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
            boxShadow: '2px 4px 10px 1px rgba(201, 201, 201, 0.47)',
            padding: '20px',
            margin: '10px auto',
            width: '24vw',
            height: '18.5vw',
            fontFamily: 'sans-serif',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
        }}>
            <div style={{
                marginBottom: '12px',
                fontSize: '20px',
                color: 'gray',
                fontWeight: '580'
            }}>
                Total Batches vs Executed Batches
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis dataKey="name" />
                    <YAxis />
                    {/* <Tooltip /> */}
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#333',
                            borderRadius: '4px',
                            border: 'none',
                            color: '#fff',
                            fontSize: 12,
                        }}
                    />
                    <Legend />
                    <Area
                        type="monotone"
                        dataKey="executedBatch"
                        stroke="#8884d8"
                        fillOpacity={1}
                        fill="url(#colorUv)"
                    />
                    <Area
                        type="monotone"
                        dataKey="totalBatch"
                        stroke="#82ca9d"
                        fillOpacity={1}
                        fill="url(#colorPv)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default Areachart;

