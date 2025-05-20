// filepath: d:/ai-chatbot/lib/chart/ChartTransforms.ts

// Functions to convert raw CSV-parsed data into formats suitable for different Nivo charts
export const transformForBarChart = (data: any[]) => {
  if (!data || data.length === 0 || !data[0]) return [];
  const keys = Object.keys(data[0]).filter(
    (key) => key && !['id', 'name', 'country'].includes(key),
  );
  const groupKey =
    Object.keys(data[0]).find((key) =>
      ['id', 'name', 'country'].includes(key),
    ) ||
    Object.keys(data[0])[0] ||
    'index';
  return data.map((item, index) => {
    const result: any = { [groupKey]: item[groupKey] || `item-${index}` };
    (keys || []).forEach((k) => {
      result[k] = Number.parseFloat(item[k]) || 0;
    });
    return result;
  });
};

export const transformForLineChart = (data: any[], meta?: any) => {
  if (!data || data.length === 0 || !data[0]) return [];
  const xKey =
    Object.keys(data[0]).find((k) => ['x', 'date', 'time'].includes(k)) ||
    Object.keys(data[0])[0];
  const keys = Object.keys(data[0]).filter((k) => k !== xKey);
  return keys.map((key) => ({
    id: key,
    data: data.map((item) => ({
      x: item[xKey],
      y: Number.parseFloat(item[key]) || 0,
    })),
  }));
};

export const transformForPieChart = (data: any[]) => {
  if (!data || data.length === 0 || !data[0]) return [];
  const labelKey =
    Object.keys(data[0]).find((k) => ['id', 'name', 'label'].includes(k)) ||
    Object.keys(data[0])[0];
  const valueKey =
    Object.keys(data[0]).find((k) =>
      ['value', 'count', 'amount'].includes(k),
    ) || Object.keys(data[0])[1];
  return data.map((item, idx) => ({
    id: item[labelKey] ?? `item-${idx}`,
    label: item[labelKey] ?? `item-${idx}`,
    value: Number.parseFloat(item[valueKey]) || 0,
  }));
};

export const transformForHeatmapChart = (data: any[]) => {
  if (!data || data.length === 0 || !data[0]) return [];
  const xKey =
    Object.keys(data[0]).find((k) => ['x', 'country'].includes(k)) ||
    Object.keys(data[0])[0];
  const yKey =
    Object.keys(data[0]).find((k) => ['y', 'month'].includes(k)) ||
    Object.keys(data[0])[1];
  const valueKey =
    Object.keys(data[0]).find((k) =>
      ['value', 'count', 'amount'].includes(k),
    ) || Object.keys(data[0])[2];
  const grouped: Record<string, any> = {};
  (data || []).forEach((item) => {
    const xVal = item[xKey];
    const yVal = item[yKey];
    const val = Number.parseFloat(item[valueKey]) || 0;
    if (!grouped[xVal]) grouped[xVal] = { [xKey]: xVal };
    grouped[xVal][yVal] = val;
  });
  return Object.values(grouped);
};

export const transformForRadarChart = (data: any[]) => {
  if (!data || data.length === 0 || !data[0]) return [];
  const labelKey =
    Object.keys(data[0]).find((k) =>
      ['key', 'taste', 'attribute'].includes(k),
    ) || Object.keys(data[0])[0];
  const keys = Object.keys(data[0]).filter((k) => k !== labelKey);
  return data.map((item) => {
    const result: any = { [labelKey]: item[labelKey] };
    (keys || []).forEach((k) => {
      result[k] = Number.parseFloat(item[k]) || 0;
    });
    return result;
  });
};

export const transformForScatterChart = (data: any[]) => {
  if (!data || data.length === 0 || !data[0]) return [];
  const seriesKey =
    Object.keys(data[0]).find((k) =>
      ['series', 'group', 'category'].includes(k),
    ) || 'series';
  const seriesSet = Array.from(new Set(data.map((d) => d[seriesKey])));
  return seriesSet.map((series) => ({
    id: series,
    data: data
      .filter((d) => d[seriesKey] === series)
      .map((item) => ({
        x: Number.parseFloat(item.x || item.xValue) || 0,
        y: Number.parseFloat(item.y || item.yValue) || 0,
      })),
  }));
};

export const transformForAreaBumpChart = (data: any[], meta?: any) => {
  if (!data || data.length === 0 || !data[0]) return [];
  const xKey =
    Object.keys(data[0]).find((k) => ['x', 'date', 'time'].includes(k)) ||
    Object.keys(data[0])[0];
  const keys = Object.keys(data[0]).filter((k) => k !== xKey);
  return keys.map((key) => ({
    id: key,
    data: data.map((item) => ({
      x: item[xKey],
      y: Number.parseFloat(item[key]) || 0,
    })),
  }));
};
