import React, { useMemo } from 'react';
import { InventoryItem, Category } from '../types';

interface CellStockChartProps {
  items: InventoryItem[];
}

const CellStockChart: React.FC<CellStockChartProps> = ({ items }) => {
  const chartData = useMemo(() => {
    const cellItems = items.filter(i => i.category === Category.CELL_STOCK);
    const grouped = cellItems.reduce((acc, item) => {
      if (!acc[item.name]) {
        acc[item.name] = [];
      }
      acc[item.name].push(item);
      return acc;
    }, {} as Record<string, InventoryItem[]>);

    const data = Object.keys(grouped).map(name => {
      // Sort by passage ascending (low passage at bottom)
      const sortedBatches = grouped[name].sort((a, b) => (a.passage || 0) - (b.passage || 0));
      const totalQty = sortedBatches.reduce((sum, i) => sum + i.quantity, 0);
      return {
        name,
        totalQty,
        batches: sortedBatches
      };
    });

    return data.sort((a, b) => b.totalQty - a.totalQty); // Sort bars by total quantity
  }, [items]);

  if (chartData.length === 0) return null;

  const maxQty = Math.max(...chartData.map(d => d.totalQty)) * 1.1; // Add 10% headroom
  const chartHeight = 200;
  const barWidth = 40;
  const gap = 30;
  const chartWidth = Math.max(chartData.length * (barWidth + gap), 300);

  // Function to generate color based on passage
  // Uses a spectrum: Green (Young) -> Blue -> Yellow -> Orange -> Red (Old)
  const getPassageColor = (passage: number = 0) => {
    if (passage < 5) return '#10b981'; // Emerald 500 (Fresh)
    if (passage < 10) return '#3b82f6'; // Blue 500 (Stable)
    if (passage < 15) return '#f59e0b'; // Amber 500 (Aging)
    if (passage < 20) return '#f97316'; // Orange 500 (Old)
    return '#ef4444'; // Red 500 (Very Old)
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
      <h3 className="font-semibold text-gray-800 mb-4">세포주 재고 분포 (Passage 별)</h3>
      <div className="relative min-w-[300px]">
        <svg width={chartWidth} height={chartHeight + 40} className="mx-auto">
          {/* Y Axis Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
            const y = chartHeight - (chartHeight * tick);
            return (
              <g key={tick}>
                <line x1="0" y1={y} x2={chartWidth} y2={y} stroke="#f3f4f6" strokeDasharray="4 4" />
                <text x="0" y={y - 5} fontSize="10" fill="#9ca3af">{Math.round(maxQty * tick)}</text>
              </g>
            );
          })}

          {chartData.map((data, index) => {
            const x = index * (barWidth + gap) + 20;
            let currentY = chartHeight;

            return (
              <g key={data.name}>
                {/* Bars */}
                {data.batches.map((batch) => {
                  const barHeight = (batch.quantity / maxQty) * chartHeight;
                  currentY -= barHeight; // Stack up
                  return (
                    <g key={batch.id} className="group">
                      <rect
                        x={x}
                        y={currentY}
                        width={barWidth}
                        height={barHeight}
                        fill={getPassageColor(batch.passage)}
                        className="transition-opacity hover:opacity-80 cursor-pointer"
                        rx={2}
                        stroke="#fff"
                        strokeWidth="1"
                      />
                      <title>Passage {batch.passage} - {batch.quantity} vials</title>
                    </g>
                  );
                })}
                {/* Label */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 20}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#4b5563"
                  fontWeight="500"
                  style={{ textTransform: 'capitalize' }}
                >
                  {data.name.length > 8 ? data.name.substring(0,6) + '..' : data.name}
                </text>
                {/* Total Count on Top */}
                <text
                  x={x + barWidth / 2}
                  y={currentY - 5}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#6b7280"
                >
                  {data.totalQty}
                </text>
              </g>
            );
          })}
        </svg>
        <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs text-gray-500">
            <div className="flex items-center gap-1"><span className="w-3 h-3 bg-[#10b981] rounded"></span> P&lt;5 (신선)</div>
            <div className="flex items-center gap-1"><span className="w-3 h-3 bg-[#3b82f6] rounded"></span> P5-9</div>
            <div className="flex items-center gap-1"><span className="w-3 h-3 bg-[#f59e0b] rounded"></span> P10-14</div>
            <div className="flex items-center gap-1"><span className="w-3 h-3 bg-[#f97316] rounded"></span> P15-19</div>
            <div className="flex items-center gap-1"><span className="w-3 h-3 bg-[#ef4444] rounded"></span> P20+ (노화)</div>
        </div>
      </div>
    </div>
  );
};

export default CellStockChart;