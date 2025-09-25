import { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';

export const useD3 = (renderChartFn: (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) => void, dependencies: any[]) => {
  const ref = useRef<SVGSVGElement>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedRenderFn = useCallback(renderChartFn, dependencies);

  useEffect(() => {
    if (ref.current) {
      const svg = d3.select(ref.current);
      memoizedRenderFn(svg);
    }
  }, [memoizedRenderFn]);

  return ref;
};

export default useD3; 