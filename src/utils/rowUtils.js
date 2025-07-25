import { api } from 'src/utils/Rest-API';
import _ from 'lodash'

export const handleRowToggleHelper = async (rowId, openRows, setOpenRows, setHistoryData, fetchUrl) => {
    setOpenRows((prev) => ({
        ...prev,
        [rowId]: !prev[rowId]
    }));

    if (!openRows[rowId]) {
        await fetchHistoryDataHelper(rowId, setHistoryData, fetchUrl);
    }
};

export const fetchHistoryDataHelper = async (rowId, setHistoryData, fetchUrl) => {
    try {
        const res = await api(`${fetchUrl}/${rowId}`, {}, 'get', true);
        console.log("Res of fetch history ", res.data)
        if (res.data.success) {
            setHistoryData((prev) => ({
                ...prev,
                [rowId]: res.data.data
            }));
        }
    } catch (error) {
        console.error('Error fetching history:', error);
    }
};

export const getFieldValue = (row, col) => {
  // Basic string path or custom render function
  if (typeof col === 'string') return _.get(row, col, 'NA');
  if (typeof col.render === 'function') return col.render(row);
  return _.get(row, col.path, 'NA');
};
