import { ArrowUpIcon, ArrowDownIcon } from '@/components/icons';

export default function KpiCard({ title, value, icon: Icon, trend = 0, ...props }) {
  // Determinar color basado en tendencia
  const trendColor = trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-gray-500';
  const trendIcon = trend > 0 ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />;

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
      {...props}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </h3>
        {Icon && <Icon className="h-5 w-5 text-gray-400 dark:text-gray-300" />}
      </div>
      
      <div className="flex items-end justify-between">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </div>
        
        {trend !== 0 && (
          <div className={`flex items-center ${trendColor}`}>
            {trendIcon}
            <span className="ml-1 text-xs font-medium">
              {Math.abs(trend)}%
            </span>
          </div>
        )}
      </div>
      
      <div className="mt-4 h-1 w-full bg-gray-200 dark:bg-gray-700 rounded">
        <div 
          className={`h-1 rounded ${trend >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
          style={{ width: `${Math.min(Math.abs(trend) * 5, 100)}%` }}
        ></div>
      </div>
    </div>
  );
}