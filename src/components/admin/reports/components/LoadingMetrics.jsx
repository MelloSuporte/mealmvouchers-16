import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

const LoadingMetrics = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-32" />
      ))}
    </div>
  );
};

export default LoadingMetrics;