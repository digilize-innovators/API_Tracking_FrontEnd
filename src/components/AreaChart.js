//src/components/AreaChart.js

import React from "react";
import { Area, AreaChart, Tooltip, XAxis, YAxis } from "recharts";



const Areachart = ({data}) => {
    return (
        <div style={{
            backgroundColor: '#fff',
            boxShadow: '2px 4px 10px 1px rgba(201, 201, 201, 0.47)',
            padding: '10px',
            color: 'gray',
            marginBottom: '10px',
            marginTop: '10px',
            width:'38.5vw'
        }}>
            <div style={{
                marginBottom: '20px',
                paddingBottom:"10px"
            }}>
                Total Baches v/s Executed Batches </div>
            <AreaChart width={600} height={300} data={data}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }} >
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
                <Tooltip />
                <Area type="monotone" dataKey="executedBatch" stroke="#8884d8" fillOpacity={1} fill="url(#colorUv)" />
                <Area type="monotone" dataKey="totalBatch" stroke="#82ca9d" fillOpacity={1} fill="url(#colorPv)" />
            </AreaChart>
        </div>
    )
}

export default Areachart;