import FuseLoading from '@fuse/core/FuseLoading';
import Close from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import {
    Box,
    Card,
    Chip,
    Grid,
    IconButton,
    InputAdornment,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography
} from '@mui/material';
import { selectGlobalUser } from 'app/store/globalUser';
import {
    fetchLearnersWaitingToBeSampledAPI,
    selectLearnersWaitingToBeSampled
} from 'app/store/learnersWaitingToBeSampled';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CustomPagination from 'src/app/component/Pagination/CustomPagination';

const Index = () => {
  const { data, dataFetchLoading, meta_data } = useSelector(selectLearnersWaitingToBeSampled);
  const { pagination } = useSelector(selectGlobalUser);
  const dispatch: any = useDispatch();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    refetchData();
  }, []);

  useEffect(() => {
    refetchData(searchKeyword, currentPage);
  }, [pagination]);

  const refetchData = (keyword = searchKeyword, page = 1) => {
    dispatch(fetchLearnersWaitingToBeSampledAPI({ page, page_size: pagination?.page_size || 10 }, keyword));
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setCurrentPage(1);
      refetchData(searchKeyword, 1);
    }
  };

  const handleSearchChange = (e) => {
    setSearchKeyword(e.target.value);
  };

  const clearSearch = () => {
    setSearchKeyword('');
    setCurrentPage(1);
    refetchData('', 1);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setCurrentPage(newPage);
    refetchData(searchKeyword, newPage);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusChipColor = (status) => {
    switch (status) {
      case 'In Training':
        return 'primary';
      case 'Awaiting Induction':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (dataFetchLoading) {
    return <FuseLoading />;
  }

  return (
    <Grid>
      <Card className='m-12 rounded-6'>
        <div className='w-full h-full'>
          {/* Header Section */}
          <div className='p-24'>
            <Typography 
              variant='h4' 
              className='font-600 mb-8'
              sx={{ color: '#2c3e50' }}
            >
              Learners waiting to be sampled
            </Typography>
            <Typography 
              variant='body1' 
              className='mb-24'
              sx={{ color: '#7f8c8d' }}
            >
              Learners 'in training or awaiting induction' status and not assigned to an IQA Sampling Plan.
            </Typography>

            {/* Search Section */}
            <div className='mb-24'>
              <TextField
                label='Search by course name or learner name'
                fullWidth
                size='small'
                value={searchKeyword}
                onChange={handleSearchChange}
                onKeyDown={handleSearch}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      {searchKeyword ? (
                        <Close
                          onClick={clearSearch}
                          sx={{
                            color: '#5B718F',
                            fontSize: 18,
                            cursor: 'pointer',
                          }}
                        />
                      ) : (
                        <IconButton
                          disableRipple
                          sx={{ color: '#5B718F' }}
                          onClick={() => refetchData(searchKeyword, 1)}
                          size='small'
                        >
                          <SearchIcon fontSize='small' />
                        </IconButton>
                      )}
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  },
                }}
              />
            </div>

            {/* Table Section */}
            <TableContainer 
              component={Paper} 
              sx={{ 
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #e0e0e0'
              }}
            >
              <Table sx={{ minWidth: 650 }} aria-label="learners waiting to be sampled table">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                    <TableCell 
                      sx={{ 
                        fontWeight: 600, 
                        color: '#2c3e50',
                        borderBottom: '2px solid #dee2e6'
                      }}
                    >
                      Course name
                    </TableCell>
                    <TableCell 
                      align="center"
                      sx={{ 
                        fontWeight: 600, 
                        color: '#2c3e50',
                        borderBottom: '2px solid #dee2e6'
                      }}
                    >
                      Total waiting to be Sampled
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 600, 
                        color: '#2c3e50',
                        borderBottom: '2px solid #dee2e6'
                      }}
                    >
                      Learners
                    </TableCell>
                    <TableCell 
                      align="center"
                      sx={{ 
                        fontWeight: 600, 
                        color: '#2c3e50',
                        borderBottom: '2px solid #dee2e6'
                      }}
                    >
                      Course start date range
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data?.length > 0 ? (
                    data.map((row, index) => (
                      <TableRow 
                        key={index}
                        sx={{ 
                          '&:last-child td, &:last-child th': { border: 0 },
                          '&:hover': { backgroundColor: '#f8f9fa' }
                        }}
                      >
                        <TableCell 
                          component="th" 
                          scope="row"
                          sx={{ 
                            fontWeight: 500,
                            color: '#2c3e50',
                            maxWidth: '300px',
                            wordWrap: 'break-word'
                          }}
                        >
                          {row.course_name}
                        </TableCell>
                        <TableCell 
                          align="center"
                          sx={{ 
                            fontWeight: 600,
                            color: '#e74c3c'
                          }}
                        >
                          {row.total_waiting}
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            maxWidth: '400px',
                            wordWrap: 'break-word'
                          }}
                        >
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {row.learners?.map((learner, learnerIndex) => (
                              <Chip
                                key={learnerIndex}
                                label={learner.name}
                                size="small"
                                color={getStatusChipColor(learner.status)}
                                variant="outlined"
                                sx={{ 
                                  fontSize: '0.75rem',
                                  height: '24px'
                                }}
                              />
                            ))}
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              From: {formatDate(row.course_start_date)}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              To: {formatDate(row.course_end_date)}
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                          <Typography variant="h6" color="text.secondary">
                            No learners waiting to be sampled
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            All learners have been assigned to sampling plans or are not in the required status.
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination Section */}
            {data?.length > 0 && (
              <CustomPagination
                pages={meta_data?.pages}
                page={meta_data?.page}
                handleChangePage={handleChangePage}
                items={meta_data?.items}
              />
            )}

            {/* Summary Section */}
            {data?.length > 0 && (
              <Box sx={{ mt: 3, p: 2, backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <Typography variant="body2" color="text.secondary">
                  Total courses with learners waiting to be sampled: <strong>{data.length}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total learners waiting: <strong>{data.reduce((sum, row) => sum + row.total_waiting, 0)}</strong>
                </Typography>
              </Box>
            )}
          </div>
        </div>
      </Card>
    </Grid>
  );
};

export default Index;
