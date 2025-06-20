import React, { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

// Define types
interface ProgressEntry {
  date: string
  rating: number
}

interface SubTopic {
  description: string
}

interface SubUnit {
  subTitle: string
  subTopic: SubTopic[]
  progressByDate: ProgressEntry[]
}

interface Unit {
  subUnit: SubUnit[]
  title: string
}

interface LearnerData {
  units: Unit[]
}

interface ChartData {
  date: string
  [key: string]: string | number
}

interface Props {
  learnerData: LearnerData
  selectedTopic: string
}

const LearnerProgressChart: React.FC<Props> = ({
  learnerData,
  selectedTopic,
}) => {
  const [graphData, setGraphData] = useState<ChartData[]>([])
  const [lines, setLines] = useState<string[]>([])

  useEffect(() => {
    if (!selectedTopic) return

    const data = transformProgressDataByTopic(learnerData, selectedTopic)
    setGraphData(data)

    if (data.length > 0) {
      const keys = Object.keys(data[0]).filter((key) => key !== 'date')
      setLines(keys)
    }
  }, [selectedTopic, learnerData])

  return (
      <ResponsiveContainer width='100%' height={400}>
        <LineChart data={graphData}>
          <XAxis dataKey='date' />
          <YAxis
            domain={[1, 4]}
            ticks={[1, 2, 3, 4]}
            tickFormatter={(value) => {
              const emojiMap: Record<number, string> = {
                1: '☹️',
                2: '😖',
                3: '🙂',
                4: '😁',
              }
              return emojiMap[value as number] || value
            }}
          />
          <Tooltip />
          {
            lines.length > 0 &&  <Legend />
          }

          {lines.map((lineKey, idx) => (
            <Line
              key={idx}
              type='monotone'
              dataKey={lineKey}
              stroke={`hsl(${(idx * 60) % 360}, 70%, 50%)`}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
  )
}

export default LearnerProgressChart

const transformProgressDataByTopic = (
  json: LearnerData,
  selectedTopic: string
): ChartData[] => {
  const dateMap: Record<string, ChartData> = {}

  json.units.forEach((unit) => {
    if (unit.title === selectedTopic) {
      unit.subUnit.forEach((sub) => {
        const label = sub.subTitle

        if (Array.isArray(sub.progressByDate)) {
          sub.progressByDate.forEach((entry) => {
            const date = entry.date

            if (!dateMap[date]) {
              dateMap[date] = { date }
            }

            dateMap[date][label] = entry.rating
          })
        }
      })
    }
  })

  return Object.values(dateMap).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )
}
