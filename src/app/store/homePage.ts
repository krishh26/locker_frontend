import { createSlice } from '@reduxjs/toolkit';
import axiosInstance from 'src/utils/axios';
import jsonData from 'src/url.json';
import { showMessage } from './fuse/messageSlice';

const initialState = {
    counts: {} as { [key: string]: number },
    cardData: {} as { [key: string]: any[] },
    loading: false,
    exporting: {} as { [key: string]: boolean },
    fetchingData: {} as { [key: string]: boolean },
};

const homePageSlice = createSlice({
    name: 'homePage',
    initialState,
    reducers: {
        setLoading(state, action) {
            state.loading = action.payload;
        },
        setCounts(state, action) {
            state.counts = action.payload;
        },
        setCardData(state, action) {
            const { type, data } = action.payload;
            state.cardData[type] = data;
        },
        setExporting(state, action) {
            const { type, value } = action.payload;
            state.exporting[type] = value;
        },
        setFetchingData(state, action) {
            const { type, value } = action.payload;
            state.fetchingData[type] = value;
        },
        clearCardData(state, action) {
            const type = action.payload;
            delete state.cardData[type];
        },
    },
});

export const slice = homePageSlice.actions;
export const selectHomePage = ({ homePage }) => homePage;

// Fetch counts for all cards (without type parameter)
export const fetchHomePageCounts = () => async (dispatch) => {
    try {
        dispatch(slice.setLoading(true));
        const response = await axiosInstance.get(
            `${jsonData.API_LOCAL_URL}/learner/list-with-count`
        );
        
        if (response.data) {
            // Handle different response structures
            // The API might return counts as an object with type keys, or as an array
            let counts = {};
            if (response.data.counts) {
                counts = response.data.counts;
            } else if (response.data.data && typeof response.data.data === 'object') {
                counts = response.data.data;
            } else if (Array.isArray(response.data.data)) {
                // If it's an array, we might need to process it differently
                // For now, set empty counts if it's an array
                counts = {};
            }
            dispatch(slice.setCounts(counts));
        }
        return true;
    } catch (error) {
        console.error('Error fetching home page counts:', error);
        dispatch(showMessage({ 
            message: error.response?.data?.message || 'Error fetching counts', 
            variant: 'error' 
        }));
        return false;
    } finally {
        dispatch(slice.setLoading(false));
    }
};

// Fetch full data for a specific card type
export const fetchCardData = (type: string) => async (dispatch) => {
    try {
        dispatch(slice.setFetchingData({ type, value: true }));
        const response = await axiosInstance.get(
            `${jsonData.API_LOCAL_URL}/learner/list-with-count?type=${type}`
        );
        
        if (response.data) {
            // Handle different response structures
            const data = response.data.data || response.data.learners || response.data.list || [];
            dispatch(slice.setCardData({ type, data: Array.isArray(data) ? data : [] }));
        }
        return true;
    } catch (error) {
        console.error(`Error fetching data for type ${type}:`, error);
        dispatch(showMessage({ 
            message: error.response?.data?.message || `Error fetching data for ${type}`, 
            variant: 'error' 
        }));
        return false;
    } finally {
        dispatch(slice.setFetchingData({ type, value: false }));
    }
};

// Export data to CSV
export const exportCardData = (type: string, title: string) => async (dispatch) => {
    try {
        dispatch(slice.setExporting({ type, value: true }));
        const response = await axiosInstance.get(
            `${jsonData.API_LOCAL_URL}/learner/list-with-count?type=${type}`
        );
        
        if (response.data) {
            const data = response.data.data || response.data.learners || response.data.list || [];
            
            if (Array.isArray(data) && data.length > 0) {
                // Get headers from the first object
                const headers = Object.keys(data[0]);
                
                // Create CSV content
                const csvHeaders = headers.join(',');
                const csvRows = data.map((row) => {
                    return headers
                        .map((header) => {
                            const value = row[header];
                            // Handle nested objects and arrays
                            if (value === null || value === undefined) {
                                return '""';
                            }
                            if (typeof value === 'object') {
                                return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
                            }
                            return `"${String(value).replace(/"/g, '""')}"`;
                        })
                        .join(',');
                });

                const csvContent = [csvHeaders, ...csvRows].join('\n');

                // Create and download the CSV file
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute(
                    'download',
                    `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
                );
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                dispatch(showMessage({ 
                    message: 'No data available to export', 
                    variant: 'warning' 
                }));
            }
        }
        return true;
    } catch (error) {
        console.error('Export error:', error);
        dispatch(showMessage({ 
            message: error.response?.data?.message || 'Error exporting data', 
            variant: 'error' 
        }));
        return false;
    } finally {
        dispatch(slice.setExporting({ type, value: false }));
    }
};

export default homePageSlice.reducer;

