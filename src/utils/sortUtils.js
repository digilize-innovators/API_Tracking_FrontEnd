// src/utils/sortUtils.js

import ChevronUp from 'mdi-material-ui/ChevronUp';
import ChevronDown from 'mdi-material-ui/ChevronDown';

// Define the global getSortIcon function
export const getSortIcon = (column, sortBy, sortDirection) => {
    if (sortBy === column) {
        return sortDirection === 'asc' ? <ChevronDown /> : <ChevronUp />;
    }
    return null;
};