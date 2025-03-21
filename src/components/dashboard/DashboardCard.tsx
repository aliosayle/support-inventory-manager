
import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface DashboardCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ComponentType<{ className?: string; size?: number }>;
  suffix?: string;
  trend?: {
    value: number;
    isUpward: boolean;
    label: string;
  };
  variant?: 'default' | 'success' | 'warning' | 'outline';
  link?: string;
  className?: string;
}

const DashboardCard = ({
  title,
  value,
  description,
  icon: Icon,
  suffix,
  trend,
  variant = 'default',
  link,
  className,
}: DashboardCardProps) => {
  const cardContent = (
    <Card className={cn(
      "overflow-hidden transition-all hover:shadow-md", 
      {
        "border-green-500 bg-green-50 dark:bg-green-950/20": variant === 'success',
        "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20": variant === 'warning',
        "bg-transparent": variant === 'outline'
      },
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && <div className="text-muted-foreground"><Icon size={16} /></div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value}{suffix}
        </div>
        {(description || trend) && (
          <p className="mt-2 text-xs text-muted-foreground flex items-center">
            {trend && (
              <span
                className={cn(
                  "inline-flex items-center mr-1 font-medium",
                  trend.isUpward ? "text-green-500" : "text-red-500"
                )}
              >
                {trend.isUpward ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
            )}
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (link) {
    return (
      <Link to={link} className="block hover:no-underline">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
};

export default DashboardCard;
