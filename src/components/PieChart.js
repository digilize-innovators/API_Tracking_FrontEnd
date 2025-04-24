//src/components/PieChart.js

import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';


const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};
const Piechart = ({data}) => {
    const [newData,setNewData]=useState([])
    useEffect(()=>{
        const tempData=data?.reduce((preValue,currentVal,index)=>{
            preValue['totalCreate']+=currentVal['totalBatch'];
            preValue['executeCode']+=currentVal['executedBatch'];
            if(index==data.length-1){
                preValue['totalCreate']/=data.length;
                preValue['executeCode']/=data.length
            }
            return preValue
        },{totalCreate:0,executeCode:0});
        setNewData([{name:"totalBatch", value:tempData?.totalCreate},{name:'executedBatch',value:tempData?.executeCode}])
    },[data])
        // setReData()
        // const tempdata=data.map((el,)=>({name:el.name,value:el.totalCodeCreate/el.executedCode}))
    return (
        <div style={{
            backgroundColor: '#fff',
            boxShadow: '2px 4px 10px 1px rgba(201, 201, 201, 0.47)',
            padding: '10px',
            color: 'gray'
        }}>
            <div style={{
                marginBottom: '20px',
            }}>
                Pie Chart</div>
            <div style={{ width: 600, height: 300 }}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            data={newData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            isAnimationActive={false}
                        >
                            {newData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
                
            </div>
        </div>
    );
};

export default Piechart