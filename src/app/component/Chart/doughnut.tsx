import React, { useMemo, useCallback } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { 
  Box, 
  Typography, 
  Paper, 
  useTheme, 
  alpha,
  Fade,
  Tooltip as MuiTooltip,
  Chip,
  CircularProgress
} from '@mui/material'
import { styled } from '@mui/material/styles'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PendingIcon from '@mui/icons-material/Pending'
import WarningIcon from '@mui/icons-material/Warning'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend)

// TypeScript Interfaces
interface ChartData {
  fullyCompleted: number
  notStarted: number
  partiallyCompleted: number
  totalSubUnits: number
}

interface LegendItem {
  label: string
  value: number
  color: string
  icon: React.ReactNode
  average: string
}

interface MatrixChartData {
  // Inner ring data
  yetToComplete: number
  fullyCompleted: number
  workInProgress: number
  totalUnits: number
  // Outer ring data
  duration: number
  totalDuration: number
  // Additional data
  dayPending?: number
}

interface DoughnutChartProps {
  value?: ChartData | MatrixChartData
  size?: number
  showLabels?: boolean
  showTooltip?: boolean
  animated?: boolean
  title?: string
  className?: string
  variant?: 'standard' | 'matrix'
  matrixTitle?: string
  onExploreClick?: () => void
  showExploreButton?: boolean
}

interface ChartColors {
  completed: string
  progress: string
  overdue: string
  border: string
  // Matrix colors
  yetToComplete: string
  workInProgress: string
  duration: string
  durationBackground: string
}

// Styled Components
const StyledChartContainer = styled(Paper)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.default, 0.9)} 100%)`,
  boxShadow: theme.shadows[2],
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  minHeight: 200,
  minWidth: 200,
  
  '&:hover': {
    boxShadow: theme.shadows[8],
    transform: 'translateY(-4px)',
    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
  },
  
  [theme.breakpoints.down('sm')]: {
    minHeight: 150,
    minWidth: 150,
    padding: theme.spacing(1),
  },
}))

const StyledChartTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(1),
  textAlign: 'center',
  fontSize: '0.9rem',
  
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.8rem',
  },
}))

const StyledLegendContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
  marginTop: theme.spacing(1),
  width: '100%',
}))

const StyledLegendItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(0.5),
  borderRadius: theme.spacing(1),
  transition: 'background-color 0.2s ease',
  
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
  },
}))

const StyledLegendColor = styled(Box)<{ color: string }>(({ theme, color }) => ({
  width: 15,
  height: 15,
  borderRadius: '50%',
  backgroundColor: color,
  border: `2px solid ${theme.palette.background.paper}`,
  boxShadow: theme.shadows[1],
}))

const StyledLegendText = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  color: theme.palette.text.secondary,
  fontWeight: 500,
}))

const StyledProgressContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1,
}))

const StyledProgressText = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  color: theme.palette.primary.main,
  fontSize: '1.2rem',
  
  [theme.breakpoints.down('sm')]: {
    fontSize: '1rem',
  },
}))

const StyledProgressLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.7rem',
  color: theme.palette.text.secondary,
  textAlign: 'center',
}))

const StyledMatrixTitle = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  fontSize: '0.8rem',
  fontWeight: 600,
  color: theme.palette.text.primary,
  backgroundColor: alpha(theme.palette.background.paper, 0.9),
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
  zIndex: 10,
}))

// Chart configuration
const getChartOptions = (theme: any, animated: boolean = true, isMatrix: boolean = false): any => ({
  responsive: true,
  maintainAspectRatio: true,
  cutout: isMatrix ? '30%' : '65%',
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: false,
      backgroundColor: alpha(theme.palette.grey[900], 0.9),
      titleColor: theme.palette.common.white,
      bodyColor: theme.palette.common.white,
      borderColor: theme.palette.primary.main,
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: true,
      callbacks: {
        label: (context: any) => {
          const label = context.label || ''
          const value = context.parsed || 0
          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0'
          return `${label}: ${value} (${percentage}%)`
        },
      },
    },
  },
  animation: animated ? {
    animateRotate: true,
    animateScale: true,
    duration: 2000,
    easing: 'easeInOutQuart' as const,
  } : false,
  elements: {
    arc: {
      borderWidth: 2,
      borderColor: theme.palette.background.paper,
    },
  },
})

// Color scheme generator
const getChartColors = (theme: any): ChartColors => ({
  completed: theme.palette.success.main,
  progress: theme.palette.warning.main,
  overdue: theme.palette.error.main,
  border: theme.palette.background.paper,
  // Matrix colors matching the design
  yetToComplete: '#FF002D', // Red
  workInProgress: '#FFBF00', // Orange
  duration: '#1E72AE', // Dark blue
  durationBackground: '#FFFFFF', // White
})

// Default data for demo
const defaultData: ChartData = {
  fullyCompleted: 12,
  notStarted: 3,
  partiallyCompleted: 19,
  totalSubUnits: 34,
}

const defaultMatrixData: MatrixChartData = {
  yetToComplete: 5,
  fullyCompleted: 15,
  workInProgress: 8,
  totalUnits: 28,
  duration: 20,
  totalDuration: 30,
}

const DoughnutChart: React.FC<DoughnutChartProps> = ({
  value = defaultData,
  size = 120,
  showLabels = true,
  showTooltip = true,
  animated = true,
  title,
  className,
  variant = 'standard',
  matrixTitle = '2025 matrix',
  onExploreClick,
  showExploreButton = true,
}) => {
  const theme = useTheme()
  const colors = getChartColors(theme)
  
  // Determine if we're using matrix data
  const isMatrix = variant === 'matrix' && 'yetToComplete' in value
  
  // Memoized chart data
  const chartData = useMemo(() => {
    if (isMatrix) {
      const matrixValue = value as MatrixChartData
      const {
        yetToComplete = 0,
        fullyCompleted = 0,
        workInProgress = 0,
        totalUnits = 0,
        duration = 0,
        totalDuration = 0,
      } = matrixValue

      const hasData = totalUnits > 0
      const innerData = [
        yetToComplete,
        fullyCompleted,
        workInProgress,
      ]

      const outerData = [
        duration,
        totalDuration - duration,
      ]

      return {
        labels: ['Yet to Complete', 'Fully Completed', 'Work in Progress', 'Duration', 'Remaining'],
        datasets: [
          // Inner ring
          {
            label: 'Progress',
            data: [...innerData, 0, 0], // Pad with zeros for outer ring
            backgroundColor: [
              colors.yetToComplete,
              colors.completed,
              colors.workInProgress,
              'transparent',
              'transparent',
            ],
            borderColor: [
              alpha(colors.yetToComplete, 0.8),
              alpha(colors.completed, 0.8),
              alpha(colors.workInProgress, 0.8),
              'transparent',
              'transparent',
            ],
            borderWidth: 2,
            hoverBackgroundColor: [
              alpha(colors.yetToComplete, 0.8),
              alpha(colors.completed, 0.8),
              alpha(colors.workInProgress, 0.8),
              'transparent',
              'transparent',
            ],
            hoverBorderWidth: 3,
            cutout: '50%',
          },
          // Outer ring
          {
            label: 'Duration',
            data: [0, 0, 0, duration, totalDuration - duration],
            backgroundColor: [
              'transparent',
              'transparent',
              'transparent',
              colors.duration,
              colors.durationBackground,
            ],
            borderColor: [
              'transparent',
              'transparent',
              'transparent',
              alpha(colors.duration, 0.8),
              alpha(colors.durationBackground, 0.8),
            ],
            borderWidth: 2,
            hoverBackgroundColor: [
              'transparent',
              'transparent',
              'transparent',
              alpha(colors.duration, 0.8),
              alpha(colors.durationBackground, 0.8),
            ],
            hoverBorderWidth: 3,
            cutout: '30%',
          },
        ],
      }
    } else {
      const standardValue = value as ChartData
      const {
        fullyCompleted = 0,
        notStarted = 0,
        partiallyCompleted = 0,
        totalSubUnits = 0,
      } = standardValue

      const hasData = totalSubUnits > 0
      const data = [
        fullyCompleted,
        partiallyCompleted,
        hasData ? notStarted : 1,
      ]

      return {
        labels: ['Completed', 'In Progress', 'Not Started'],
        datasets: [
          {
            label: hasData ? 'Sub Units' : 'No Data',
            data,
            backgroundColor: [
              colors.completed,
              colors.progress,
              colors.overdue,
            ],
            borderColor: [
              alpha(colors.completed, 0.8),
              alpha(colors.progress, 0.8),
              alpha(colors.overdue, 0.8),
            ],
            borderWidth: 2,
            hoverBackgroundColor: [
              alpha(colors.completed, 0.8),
              alpha(colors.progress, 0.8),
              alpha(colors.overdue, 0.8),
            ],
            hoverBorderWidth: 3,
          },
        ],
      }
    }
  }, [value, colors, isMatrix])

  // Memoized chart options
  const chartOptions = useMemo(() => 
    getChartOptions(theme, animated, isMatrix), 
    [theme, animated, isMatrix]
  )

  // Calculate progress percentage
  const progressPercentage = useMemo(() => {
    if (isMatrix) {
      const matrixValue = value as MatrixChartData
      const { fullyCompleted = 0, totalUnits = 0 } = matrixValue
      return totalUnits > 0 ? Math.round((fullyCompleted / totalUnits) * 100) : 0
    } else {
      const standardValue = value as ChartData
      const { fullyCompleted = 0, totalSubUnits = 0 } = standardValue
      return totalSubUnits > 0 ? Math.round((fullyCompleted / totalSubUnits) * 100) : 0
    }
  }, [value, isMatrix])

  // Memoized legend data with average calculation
  const legendData = useMemo(() => {
    if (isMatrix) {
      const matrixValue = value as MatrixChartData
      const totalUnits = matrixValue.totalUnits || 0
      const items = [
        {
          label: 'Yet to Complete',
          value: matrixValue.yetToComplete || 0,
          color: colors.yetToComplete,
          icon: <WarningIcon sx={{ fontSize: 18 }} />,
        },
        {
          label: 'Fully Completed',
          value: matrixValue.fullyCompleted || 0,
          color: colors.completed,
          icon: <CheckCircleIcon sx={{ fontSize: 18 }} />,
        },
        {
          label: 'Work in Progress',
          value: matrixValue.workInProgress || 0,
          color: colors.workInProgress,
          icon: <PendingIcon sx={{ fontSize: 18 }} />,
        },
      ]
      
      // Calculate average for each item
      return items.map(item => ({
        ...item,
        average: totalUnits > 0 ? ((item.value / totalUnits) * 100).toFixed(1) : '0.0'
      }))
    } else {
      const standardValue = value as ChartData
      const totalSubUnits = standardValue.totalSubUnits || 0
      const items = [
        {
          label: 'Completed',
          value: standardValue.fullyCompleted || 0,
          color: colors.completed,
          icon: <CheckCircleIcon sx={{ fontSize: 14 }} />,
        },
        {
          label: 'In Progress',
          value: standardValue.partiallyCompleted || 0,
          color: colors.progress,
          icon: <PendingIcon sx={{ fontSize: 14 }} />,
        },
        {
          label: 'Not Started',
          value: standardValue.notStarted || 0,
          color: colors.overdue,
          icon: <WarningIcon sx={{ fontSize: 14 }} />,
        },
      ]
      
      // Calculate average for each item
      return items.map(item => ({
        ...item,
        average: totalSubUnits > 0 ? ((item.value / totalSubUnits) * 100).toFixed(1) : '0.0'
      }))
    }
  }, [value, colors, isMatrix])

  // Event handlers
  const handleChartClick = useCallback((event: any, elements: any[]) => {
    if (elements.length > 0) {
      const element = elements[0]
      console.log('Chart segment clicked:', {
        index: element.index,
        label: chartData.labels[element.index],
        value: chartData.datasets[0].data[element.index],
      })
    }
  }, [chartData])

  // Loading state
  if (!value || Object.values(value).every(val => val === 0)) {
    return (
      <StyledChartContainer className={className}>
        <CircularProgress size={40} />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
          No data available
        </Typography>
      </StyledChartContainer>
    )
  }

  return (
    <Fade in={true} timeout={1000}>
      <StyledChartContainer className={className}>
        {/* {isMatrix && (
          <StyledMatrixTitle variant="subtitle2">
            {matrixTitle}
          </StyledMatrixTitle>
        )} */}
        {title && !isMatrix && (
          <StyledChartTitle variant="subtitle2">
            {title}
          </StyledChartTitle>
        )}
        
        <Box sx={{ position: 'relative', width: size, height: size }}>
          <Doughnut
            data={chartData}
            options={{
              ...chartOptions,
              onClick: handleChartClick as any,
            }}
            width={size}
            height={size}
          />
          
          {/* Center progress indicator */}
          <StyledProgressContainer>
            <StyledProgressText variant="h6">
              {Math.max(0, (value as MatrixChartData).dayPending || 0)}
            </StyledProgressText>
            <StyledProgressLabel variant="caption">
              days left
            </StyledProgressLabel>
          </StyledProgressContainer>
        </Box>

        {/* Legend */}
        {showLabels && (
          <StyledLegendContainer>
            {legendData.map((item, index) => (
              <MuiTooltip 
                key={index}
                title={`${item.label}: ${item.value} units (${item.average}%)`}
                arrow
              >
                <StyledLegendItem>
                  <StyledLegendColor color={item.color} />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, width: '100%', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {item.icon}
                      <StyledLegendText>
                        {item.value}
                      </StyledLegendText>
                    </Box>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: 'text.secondary',
                        fontSize: '1rem',
                        fontWeight: 500
                      }}
                    >
                      {item.average}%
                    </Typography>
                  </Box>
                </StyledLegendItem>
              </MuiTooltip>
            ))}
          </StyledLegendContainer>
        )}

        {/* Progress chip */}
        <Chip
          icon={<TrendingUpIcon />}
          label={
            isMatrix 
              ? `${(value as MatrixChartData).fullyCompleted || 0}/${(value as MatrixChartData).totalUnits || 0} Complete`
              : `${(value as ChartData).fullyCompleted || 0}/${(value as ChartData).totalSubUnits || 0} Complete`
          }
          size="small"
          color="primary"
          variant="outlined"
          sx={{ 
            mt: 1, 
            fontSize: '1.2rem',
            height: 24,
          }}
        />

        {/* Click to explore more button */}
        {showExploreButton && (
          <Box 
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              mt: 2,
              px: 2,
              py: 1,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
              cursor: 'pointer',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.2),
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[4],
                '& .explore-arrow': {
                  transform: 'translateX(4px)'
                }
              }
            }}
            onClick={() => {
              if (onExploreClick) {
                onExploreClick()
              } else {
                console.log('Explore more clicked')
              }
            }}
          >
            <Typography 
              variant='body2' 
              sx={{ 
                color: theme.palette.primary.main,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}
            >
              🎯 Click to explore more
            </Typography>
            <Typography 
              className="explore-arrow"
              variant='body2' 
              sx={{ 
                color: theme.palette.primary.main,
                fontSize: '1.2rem',
                transition: 'transform 0.3s ease-in-out'
              }}
            >
              →
            </Typography>
          </Box>
        )}
      </StyledChartContainer>

        

    </Fade>
  )
}

export default DoughnutChart
