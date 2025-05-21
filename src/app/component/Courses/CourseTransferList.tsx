import React, { useState, useEffect } from 'react';
import {
  Grid,
  List,
  Card,
  CardHeader,
  ListItem,
  ListItemText,
  Checkbox,
  Button,
  Divider,
  Typography,
  Box
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';

// Define the interface for a course item
interface CourseItem {
  id: string;
  name: string;
}

interface CourseTransferListProps {
  availableCourses: CourseItem[];
  assignedCourses: CourseItem[];
  onCoursesAssigned: (assigned: CourseItem[], remaining: CourseItem[]) => void;
  disabled?: boolean;
  leftTitle?: string;
  rightTitle?: string;
}

function not(a: CourseItem[], b: CourseItem[]): CourseItem[] {
  return a.filter((value) => b.findIndex(item => item.id === value.id) === -1);
}

function intersection(a: CourseItem[], b: CourseItem[]): CourseItem[] {
  return a.filter((value) => b.findIndex(item => item.id === value.id) !== -1);
}

function union(a: CourseItem[], b: CourseItem[]): CourseItem[] {
  return [...a, ...not(b, a)];
}

const CourseTransferList: React.FC<CourseTransferListProps> = ({
  availableCourses,
  assignedCourses,
  onCoursesAssigned,
  disabled = false,
  leftTitle = 'Unassigned Standard Courses',
  rightTitle = 'Assigned Standard Courses'
}) => {
  const [checked, setChecked] = useState<CourseItem[]>([]);
  const [left, setLeft] = useState<CourseItem[]>(availableCourses);
  const [right, setRight] = useState<CourseItem[]>(assignedCourses);

  // Update internal state when props change
  useEffect(() => {
    setLeft(availableCourses);
    setRight(assignedCourses);
  }, [availableCourses, assignedCourses]);

  // Notify parent component when assigned courses change
  useEffect(() => {
    onCoursesAssigned(right, left);
  }, [right, left, onCoursesAssigned]);

  const leftChecked = intersection(checked, left);
  const rightChecked = intersection(checked, right);

  const handleToggle = (value: CourseItem) => () => {
    const currentIndex = checked.findIndex(item => item.id === value.id);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const numberOfChecked = (items: CourseItem[]) => intersection(checked, items).length;

  const handleToggleAll = (items: CourseItem[]) => () => {
    if (numberOfChecked(items) === items.length) {
      setChecked(not(checked, items));
    } else {
      setChecked(union(checked, items));
    }
  };

  const handleCheckedRight = () => {
    const newRight = [...right, ...leftChecked];
    const newLeft = not(left, leftChecked);
    setRight(newRight);
    setLeft(newLeft);
    setChecked(not(checked, leftChecked));
    // Immediately notify parent to ensure UI is updated
    onCoursesAssigned(newRight, newLeft);
  };

  const handleCheckedLeft = () => {
    const newLeft = [...left, ...rightChecked];
    const newRight = not(right, rightChecked);
    setLeft(newLeft);
    setRight(newRight);
    setChecked(not(checked, rightChecked));
    onCoursesAssigned(newRight, newLeft);
  };

  const handleAllRight = () => {
    const newRight = [...right, ...left];
    setRight(newRight);
    setLeft([]);
    onCoursesAssigned(newRight, []);
  };

  const handleAllLeft = () => {
    const newLeft = [...left, ...right];
    setLeft(newLeft);
    setRight([]);
    onCoursesAssigned([], newLeft);
  };

  const customList = (title: React.ReactNode, items: CourseItem[], side: 'left' | 'right') => (
    <Card variant="outlined" sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        sx={{ px: 2, py: 1 }}
        title={
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1" fontWeight="bold">
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {numberOfChecked(items)}/{items.length} selected
            </Typography>
          </Box>
        }
        subheader={
          <Box mt={1}>
            {!disabled && (
              <Button
                size="small"
                variant="text"
                onClick={handleToggleAll(items)}
                disabled={items.length === 0}
              >
                {numberOfChecked(items) === items.length ? 'Unselect all' : 'Select all'}
              </Button>
            )}
          </Box>
        }
      />
      <Divider />
      <List
        sx={{
          width: '100%',
          height: 230,
          bgcolor: 'background.paper',
          overflow: 'auto',
          flexGrow: 1
        }}
        dense
        component="div"
        role="list"
      >
        {items.length === 0 ? (
          <ListItem>
            <ListItemText
              primary={
                <Typography variant="body2" color="text.secondary" align="center" sx={{ fontStyle: 'italic', py: 2 }}>
                  {side === 'left' ? 'No available courses' : 'No courses assigned'}
                </Typography>
              }
            />
          </ListItem>
        ) : (
          items.map((course) => {
            const labelId = `transfer-list-all-item-${course.id}-label`;
            return (
              <ListItem
                key={course.id}
                role="listitem"
                button
                onClick={!disabled ? handleToggle(course) : undefined}
                sx={{
                  cursor: disabled ? 'default' : 'pointer',
                  '&:hover': {
                    bgcolor: disabled ? 'transparent' : 'action.hover'
                  }
                }}
              >
                {!disabled && (
                  <Checkbox
                    checked={checked.findIndex(item => item.id === course.id) !== -1}
                    tabIndex={-1}
                    disableRipple
                    inputProps={{
                      'aria-labelledby': labelId,
                    }}
                  />
                )}
                <ListItemText id={labelId} primary={course.name} />
              </ListItem>
            );
          })
        )}
      </List>
    </Card>
  );

  return (
    <Grid container spacing={2} justifyContent="center" alignItems="center">
      <Grid item xs={5}>
        {customList(leftTitle, left, 'left')}
      </Grid>
      <Grid item xs={2}>
        <Grid container direction="column" alignItems="center" spacing={2}>
          <Grid item>
            <Button
              variant="outlined"
              size="small"
              onClick={handleCheckedRight}
              disabled={leftChecked.length === 0 || disabled}
              aria-label="move selected right"
              sx={{ minWidth: '40px' }}
            >
              <ArrowForwardIcon />
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              size="small"
              onClick={handleCheckedLeft}
              disabled={rightChecked.length === 0 || disabled}
              aria-label="move selected left"
              sx={{ minWidth: '40px' }}
            >
              <ArrowBackIcon />
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              size="small"
              onClick={handleAllRight}
              disabled={left.length === 0 || disabled}
              aria-label="move all right"
              sx={{ minWidth: '40px' }}
            >
              <DoubleArrowIcon />
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              size="small"
              onClick={handleAllLeft}
              disabled={right.length === 0 || disabled}
              aria-label="move all left"
              sx={{ minWidth: '40px', transform: 'rotate(180deg)' }}
            >
              <DoubleArrowIcon />
            </Button>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={5}>
        {customList(rightTitle, right, 'right')}
      </Grid>
    </Grid>
  );
};

export default CourseTransferList;
