export const getWeekFromDate = (dateString: string) => {
  const [year, month, day] = dateString.split('-');
  const d = new Date(Number(year), Number(month) - 1, Number(day));
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
};

export const getCurrentWeek = () => {
  const d = new Date();
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
};

export const getDatesFromWeek = (weekString: string) => {
  const [yearStr, weekStr] = weekString.split('-W');
  const year = parseInt(yearStr);
  const week = parseInt(weekStr);

  // Start with Jan 4th of that year (which is always in ISO week 1)
  const jan4 = new Date(year, 0, 4);
  const dayOfWeek = jan4.getDay() || 7; // 1 (Mon) to 7 (Sun)
  const mondayWeek1 = new Date(jan4.getTime() - (dayOfWeek - 1) * 86400000);
  
  const monday = new Date(mondayWeek1.getTime() + (week - 1) * 7 * 86400000);
  const sunday = new Date(monday.getTime() + 6 * 86400000);

  const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' };
  const formatter = new Intl.DateTimeFormat('es-MX', options);

  return `${formatter.format(monday)} - ${formatter.format(sunday)}`;
};
