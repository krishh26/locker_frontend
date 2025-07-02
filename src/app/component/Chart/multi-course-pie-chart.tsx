import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface CourseDataItem {
  name: 'Completed' | 'Progress' | 'Overdue';
  value: number;
}

interface Course {
  name: string;
  data: CourseDataItem[];
}

const COLORS: Record<CourseDataItem['name'], string> = {
  Completed: '#4caf50',
  Progress: '#ff9800',
  Overdue: '#f44336',
};

const courses: Course[] = [
  {
    name: 'Course A',
    data: [
      { name: 'Completed', value: 50 },
      { name: 'Progress', value: 30 },
      { name: 'Overdue', value: 20 },
    ],
  },
  {
    name: 'Course B',
    data: [
      { name: 'Completed', value: 40 },
      { name: 'Progress', value: 35 },
      { name: 'Overdue', value: 25 },
    ],
  },
  {
    name: 'Course C',
    data: [
      { name: 'Completed', value: 60 },
      { name: 'Progress', value: 20 },
      { name: 'Overdue', value: 20 },
    ],
  },
];

// Custom Tooltip Component
const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: any[];
}) => {
  if (active && payload && payload.length > 0) {
    const { name, value } = payload[0].payload;
    const courseName = payload[0].payload.courseName;
    return (
      <div
        style={{
          background: '#fff',
          border: '1px solid #ccc',
          padding: '8px',
          borderRadius: 4,
        }}
      >
        <strong>{courseName}</strong>
        <div>{name}: {value}</div>
      </div>
    );
  }

  return null;
};

const MultiCoursePieChart: React.FC = () => {
  const centerX = 200;
  const centerY = 200;
  const radiusStep = 30;
  const baseRadius = 40;

  // Inject courseName into each data entry
  const getCourseDataWithLabel = (course: Course) =>
    course.data.map((item) => ({
      ...item,
      courseName: course.name,
    }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Tooltip content={<CustomTooltip />} />
        {courses.map((course, index) => (
          <Pie
            key={course.name}
            data={getCourseDataWithLabel(course)}
            dataKey="value"
            nameKey="name"
            cx={centerX}
            cy={centerY}
            innerRadius={baseRadius + index * radiusStep}
            outerRadius={baseRadius + (index + 1) * radiusStep - 5}
            label={false}
          >
            {course.data.map((entry, i) => (
              <Cell key={`cell-${index}-${i}`} fill={COLORS[entry.name]} />
            ))}
          </Pie>
        ))}
      </PieChart>
    </ResponsiveContainer>
  );
};

export default MultiCoursePieChart;
