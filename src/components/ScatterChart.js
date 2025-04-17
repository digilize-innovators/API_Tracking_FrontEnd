//src/components/ScatterChart.js

import React from 'react'
import { Legend, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts'

const Scatterchart = ({ data }) => {
  return (
    <div
      style={{
        backgroundColor: '#fff',
        boxShadow: '2px 4px 10px 1px rgba(201, 201, 201, 0.47)',
        padding: '10px',
        color: 'gray',
        marginBottom: '10px'
      }}
    >
      <div
        style={{
          marginBottom: '20px'
        }}
      >
        Scatter Graph
      </div>
      <ScatterChart
        width={600}
        height={300}
        margin={{
          top: 20,
          right: 20,
          bottom: 10,
          left: 10
        }}
      >
        <XAxis
          dataKey='name'
          type={data?.length && typeof data[0]?.name == 'number' ? 'number' : 'category'}
          {...(data?.length && typeof data[0]?.name === 'number' ? { domain: ['auto', 'auto'] } : {})}
          textAnchor='end'
          allowDuplicatedCategory={false}
          tickFormatter={(tick) => (tick)}
        />
        <YAxis dataKey='y' type='number' />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
        <Legend />
        <Scatter name='executedCode' data={data?.map(el => ({ name: el.name, y: el.executedCode }))} fill='#8884d8' />
        <Scatter
          name='totalCodeCreate'
          data={data?.map(el => ({ name: el.name, y: el.totalCodeCreate }))}
          fill='#82ca9d'
        />
      </ScatterChart>
    </div>
  )
}

export default Scatterchart