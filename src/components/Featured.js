import React from "react";
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useSettings } from 'src/@core/hooks/useSettings';
import PropTypes from "prop-types";

const Featured = ({ data }) => {
  const { settings } = useSettings();

  const styles = {
    featured: {
      width: '100%',
      boxShadow: "2px 4px 10px 1px rgba(201, 201, 201, 0.47)",
      background: '#fff',
      borderRadius: '0px',
      margin: 'auto',
    },
    top: {
      // display: "flex",
      // alignItems: "center",
      // justifyContent: "space-between",
      //color: "gray",

      backgroundColor: settings.themeColor,
      //background: '#00d09c',
      paddingTop: 14,
      paddingBottom: 7,
      paddingLeft: 5,
      paddingRight: 5,
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
      marginTop: 10,
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
      // marginTop: "10px",
      fontSize: "14px",
    },
    positive: {
      color: "#00d09c",
      fontSize: 18,
    },
    negative: {
      color: "red",
    },
  };

  return (
    <div style={styles.featured}>
      <div style={styles.top}>
        <h1 style={{
          // marginBottom: '12px',
          // fontSize: '20px',
          // color: 'gray',
          // fontWeight: '580',

          mb: 0,
          textAlign: 'center',
          fontSize: '20px',
          color: '#333',
          fontWeight: 600,

        }}>Parent - Child Mapping Status</h1>

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
            <div style={{ ...styles.itemResult, ...styles.positive }}>
              {data?.aggregationStats?.pastMonthAggCount}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
Featured.propTypes={
  data:PropTypes.any
}

export default Featured;