// src/components/AreaChart.js

import React from "react";
import { Area, AreaChart, Tooltip, XAxis, YAxis, ResponsiveContainer, Legend } from "recharts";

const Areachart = ({ data }) => {
    return (
        <div style={{
            background: '#fff',
            padding: '20px',
            margin: '10px auto',
            // width: '23.5vw',
            // height: '18.5vw',
            width: '100%',
            aspectRatio: '4 / 3', // Ensures height adjusts with width
            maxHeight: '400px',

            fontFamily: 'sans-serif',
            boxShadow: '2px 4px 10px 1px rgba(201, 201, 201, 0.47)',
        }}>
            <h3 style={{
                marginBottom: '12px',
                fontSize: '20px',
                color: 'gray',
                fontWeight: '580'
            }}>
                Total vs Executed Batches
            </h3>

            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 5, right: 20, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00d09c" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#00d09c" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#5EADAE" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#5EADAE" stopOpacity={0} />
                        </linearGradient>
                    </defs>

                    <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12 }}
                        axisLine={true}
                        padding={{ left: 25 }}
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
                    {/* <Legend /> */}
                    <Legend
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                    />
                    <Area
                        type="monotone"
                        dataKey="executedBatch"
                        stroke="#00d09c"
                        fillOpacity={1}
                        fill="url(#colorUv)"
                    />
                    <Area
                        type="monotone"
                        dataKey="totalBatch"
                        stroke="#5EADAE"
                        fillOpacity={1}
                        fill="url(#colorPv)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default Areachart;

