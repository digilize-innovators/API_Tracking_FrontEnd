import React from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";

const Linechart = ({ data }) => {
    return (
        <div
            style={{
                background: "#fff",
                padding: "20px",
                fontFamily: "sans-serif",
                boxShadow: "2px 4px 10px 1px rgba(201, 201, 201, 0.47)",
                width: '24.5vw',
                height: '20.5vw',
                boxSizing: "border-box",
            }}
        >
            <div
                style={{
                    fontSize: "20px",
                    color: "gray",
                    fontWeight: "580",
                    marginBottom: "12px"
                }}
            >
                Line Graph
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#333",
                            color: "#fff",
                            borderRadius: "4px",
                            fontSize: 12
                        }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="executedBatch" stroke="#8884d8" />
                    <Line type="monotone" dataKey="totalBatch" stroke="#82ca9d" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default Linechart;