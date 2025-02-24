import { useContext } from 'react';

import { LoaderContext } from '../context/loaderContext';
export const useLoading = () => useContext(LoaderContext);
