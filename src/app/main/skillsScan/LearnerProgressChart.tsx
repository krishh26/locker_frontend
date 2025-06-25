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


interface SubTopic {
  description: string
}

interface SubUnit {
  subTitle: string
  subTopic: SubTopic[]
  quarter_review?: {
    [key: string]: number
  }
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
    } else {
      setLines([])
    }
  }, [selectedTopic, learnerData])

  return (
    <ResponsiveContainer width='100%' height={400}>
      {graphData.length === 0 ? (
        <div className='flex items-center justify-center h-full'>
          <p className='text-gray-500'>No data available for this topic.</p>
        </div>
      ) : (
          <LineChart data={graphData}>
            <XAxis
              dataKey='date'
              tickFormatter={(value) => {
                const labelMap: Record<string, string> = {
                  induction: 'Induction',
                  first: 'First Review',
                  second: 'Second Review',
                  third: 'Third Review',
                }
                return labelMap[value] || value
              }}
            />
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
            {lines.length > 0 && <Legend />}

            {lines.map((lineKey, idx) => (
              <Line
                key={idx}
                type='monotone'
                dataKey={lineKey}
                stroke={`hsl(${(idx * 60) % 360}, 70%, 50%)`}
              />
            ))}
          </LineChart>
      )}
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
        const reviewPhases = sub.quarter_review || {}

        Object.entries(reviewPhases).forEach(([phase, rating]) => {
          // if (phase === 'induction') return

          if (!dateMap[phase]) {
            dateMap[phase] = { date: phase }
          }
          dateMap[phase][label] = rating
        })
      })
    }
  })

  const reviewOrder = ['induction','first', 'second', 'third']
  return Object.values(dateMap).sort(
    (a, b) =>
      reviewOrder.indexOf(a.date.toString()) -
      reviewOrder.indexOf(b.date.toString())
  )
}
