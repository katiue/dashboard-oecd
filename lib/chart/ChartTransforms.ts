// filepath: d:/ai-chatbot/lib/chart/ChartTransforms.ts

// Functions to convert raw CSV-parsed data into formats suitable for different Nivo charts
export const transformForBarChart = (data: any[]) => {
  if (!data || !Array.isArray(data) || data.length === 0 || !data[0]) return [];
  const keys = Object.keys(data[0] || {}).filter(
    (key) => key && !['id', 'name', 'country'].includes(key),
  );
  const groupKey =
    Object.keys(data[0] || {}).find((key) =>
      ['id', 'name', 'country'].includes(key),
    ) ||
    Object.keys(data[0] || {})[0] ||
    'index';
  return data.map((item, index) => {
    if (!item) return { [groupKey]: `item-${index}` };
    const result: any = { [groupKey]: item[groupKey] || `item-${index}` };
    (keys || []).forEach((k) => {
      if (k) result[k] = Number.parseFloat(item[k]) || 0;
    });
    return result;
  });
};

export const transformForLineChart = (data: any[], meta?: any) => {
  if (!data || !Array.isArray(data) || data.length === 0 || !data[0]) return [];
  const xKey =
    Object.keys(data[0] || {}).find((k) => ['x', 'date', 'time'].includes(k)) ||
    Object.keys(data[0] || {})[0] ||
    'x';
  const keys = Object.keys(data[0] || {}).filter((k) => k !== xKey);
  
  if (keys.length === 0) return [];
  
  return keys.map((key) => ({
    id: key || 'value',
    data: data.map((item) => {
      if (!item) return { x: 'unknown', y: 0 };
      return {
        x: item[xKey] || 'unknown',
        y: Number.parseFloat(item[key]) || 0,
      };
    }),
  }));
};

export const transformForPieChart = (data: any[]) => {
  if (!data || !Array.isArray(data) || data.length === 0 || !data[0]) return [];
  const labelKey =
    Object.keys(data[0] || {}).find((k) => ['id', 'name', 'label'].includes(k)) ||
    Object.keys(data[0] || {})[0] ||
    'label';
  const valueKey =
    Object.keys(data[0] || {}).find((k) =>
      ['value', 'count', 'amount'].includes(k),
    ) || Object.keys(data[0] || {})[1] || 'value';
  return data.map((item, idx) => {
    if (!item) return { id: `item-${idx}`, label: `item-${idx}`, value: 0 };
    return {
      id: item[labelKey] ?? `item-${idx}`,
      label: item[labelKey] ?? `item-${idx}`,
      value: Number.parseFloat(item[valueKey]) || 0,
    };
  });
};

export const transformForHeatmapChart = (data: any[]) => {
  if (!data || !Array.isArray(data) || data.length === 0 || !data[0]) return [];
  const xKey =
    Object.keys(data[0] || {}).find((k) => ['x', 'country'].includes(k)) ||
    Object.keys(data[0] || {})[0] ||
    'x';
  const yKey =
    Object.keys(data[0] || {}).find((k) => ['y', 'month'].includes(k)) ||
    Object.keys(data[0] || {})[1] ||
    'y';
  const valueKey =
    Object.keys(data[0] || {}).find((k) =>
      ['value', 'count', 'amount'].includes(k),
    ) || Object.keys(data[0] || {})[2] || 'value';
  const grouped: Record<string, any> = {};
  (data || []).forEach((item) => {
    if (!item) return;
    const xVal = item[xKey] || 'unknown';
    const yVal = item[yKey] || 'unknown';
    const val = Number.parseFloat(item[valueKey]) || 0;
    if (!grouped[xVal]) grouped[xVal] = { [xKey]: xVal };
    grouped[xVal][yVal] = val;
  });
  return Object.values(grouped);
};

export const transformForRadarChart = (data: any[]) => {
  if (!data || !Array.isArray(data) || data.length === 0 || !data[0]) return [];
  const labelKey =
    Object.keys(data[0] || {}).find((k) =>
      ['key', 'taste', 'attribute'].includes(k),
    ) || Object.keys(data[0] || {})[0] || 'attribute';
  const keys = Object.keys(data[0] || {}).filter((k) => k !== labelKey);
  
  if (keys.length === 0) return [];
  
  return data.map((item, index) => {
    if (!item) return { [labelKey]: `item-${index}` };
    const result: any = { [labelKey]: item[labelKey] || `item-${index}` };
    (keys || []).forEach((k) => {
      if (k) result[k] = Number.parseFloat(item[k]) || 0;
    });
    return result;
  });
};

export const transformForScatterChart = (data: any[]) => {
  if (!data || !Array.isArray(data) || data.length === 0 || !data[0]) return [];
  
  const seriesKey =
    Object.keys(data[0] || {}).find((k) =>
      ['series', 'group', 'category'].includes(k),
    ) || 'series';
    
  // Create a default series if none exists
  const seriesSet = new Set<string>();
  data.forEach(d => {
    if (d) seriesSet.add(d[seriesKey] || 'default');
  });
  
  if (seriesSet.size === 0) return [{ id: 'default', data: [] }];
  
  return Array.from(seriesSet).map((series) => ({
    id: series,
    data: data
      .filter((d) => d && (d[seriesKey] === series || (!d[seriesKey] && series === 'default')))
      .map((item) => ({
        x: Number.parseFloat(item?.x || item?.xValue) || 0,
        y: Number.parseFloat(item?.y || item?.yValue) || 0,
      })),
  }));
};

export const transformForAreaBumpChart = (data: any[], meta?: any) => {
  if (!data || !Array.isArray(data) || data.length === 0 || !data[0]) return [];
  const xKey =
    Object.keys(data[0] || {}).find((k) => ['x', 'date', 'time'].includes(k)) ||
    Object.keys(data[0] || {})[0] ||
    'x';
  const keys = Object.keys(data[0] || {}).filter((k) => k !== xKey);
  
  if (keys.length === 0) return [];
  
  return keys.map((key) => ({
    id: key || 'value',
    data: data.map((item, index) => {
      if (!item) return { x: `point-${index}`, y: 0 };
      return {
        x: item[xKey] || `point-${index}`,
        y: Number.parseFloat(item[key]) || 0,
      };
    }),
  }));
};
