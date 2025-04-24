import React from "react";
import { MdKeyboardArrowDown, MdKeyboardArrowUp, MdMoreVert } from "react-icons/md";
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const Featured = ({data}) => {

  const styles = {
    featured: {
      flex: 1,
      boxShadow: "2px 4px 10px 1px rgba(201, 201, 201, 0.47)",
      padding: "10px",
      background:'#fff',
      marginTop: "10px", // ⬅️ add some spacing from the top

    },
    top: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      color: "gray",
    },
    title: {
      fontSize: "16px",
      fontWeight: 500,
    },
    bottom: {
      padding: "10px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
     
    },
    featuredChart: {
      width: "100px",
      height: "100px",
    },
    amount: {
      fontSize: "30px",
    },
    description: {
      fontWeight: 300,
      fontSize: "12px",
      color: "gray",
      textAlign: "center",
    },
    summary: {
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    item: {
      textAlign: "center",
    },
    itemTitle: {
      fontSize: "14px",
      color: "gray",
    },
    itemResult: {
      display: "flex",
      alignItems: "center",
      marginTop: "10px",
      fontSize: "14px",
    },
    positive: {
      color: "green",
    },
    negative: {
      color: "red",
    },
  };

  return (
    <div style={styles.featured}>
      <div style={styles.top}>
        <h1 style={styles.title}>Parent-Child Mapping Status</h1>
        
      </div>
      <div style={styles.bottom}>
        <div style={styles.featuredChart}>
          <CircularProgressbar value={data?.aggregationStats.aggPercent} text={`${data?.aggregationStats.aggPercent}%`} strokeWidth={5} />
        </div>
        <p style={styles.title}>Total number of Aggregated</p>
        <p style={styles.amount}>{data?.aggregationStats.aggCount}</p>
       
        <div style={styles.summary}>
          <div style={styles.item}>
            <div style={styles.itemTitle}>Today</div>
            <div style={{ ...styles.itemResult, ...styles.positive }}>
            {data?.aggregationStats?.todayAggCount}
            </div>
          </div>
          <div style={styles.item}>
            <div style={styles.itemTitle}>Last Week</div>
            <div style={{ ...styles.itemResult, ...styles.positive }}>
              {data?.aggregationStats?.pastWeekAggCount}
            </div>
          </div>
          <div style={styles.item}>
            <div style={styles.itemTitle}>Last Month</div>
            <div style={{ ...styles.itemResult, ...styles.positive}}>
              {data?.aggregationStats?.pastMonthAggCount}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Featured;