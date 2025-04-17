//src/components/LineChart.js

import React from "react";
import {  Legend, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";


const Linechart = ({data}) => {
    return (
        <div style={{
            backgroundColor: '#fff',
            boxShadow: '2px 4px 10px 1px rgba(201, 201, 201, 0.47)',
            padding: '10px',
            color: 'gray',
            marginBottom: '10px',
        }}>
            <div style={{
                marginBottom: '20px',
            }}>
                Line Graph</div>
            <LineChart width={600} height={300} data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="executedCode" stroke="#8884d8" />
                <Line type="monotone" dataKey="totalCodeCreate" stroke="#82ca9d" />
            </LineChart>
        </div>
    )
}
export default Linechart;