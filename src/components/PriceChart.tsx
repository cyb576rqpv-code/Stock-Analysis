interface PriceChartProps {
  data: number[]
  width?: number
  height?: number
}

export function PriceChart({ data, width = 120, height = 40 }: PriceChartProps) {
  if (data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const isUp = data[data.length - 1] >= data[0]

  const points = data
    .map((price, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - ((price - min) / range) * (height - 4) - 2
      return `${x},${y}`
    })
    .join(' ')

  const color = isUp ? '#22c55e' : '#ef4444'

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}
