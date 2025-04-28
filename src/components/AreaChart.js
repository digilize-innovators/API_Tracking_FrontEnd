//src/components/AreaChart.js

import React from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";



const Areachart = ({data}) => {
    return (
        <div className="w-full bg-white rounded-md shadow-md p-4 text-gray-600 my-4">
        <div className="mb-5 pb-2 font-medium">
            Total Batches v/s Executed Batches
        </div>
        <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
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
                    <Tooltip />
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
    </div>

    )
}

export default Areachart;