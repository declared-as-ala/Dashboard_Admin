import { format, parseISO } from "date-fns";

export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "MMM dd, yyyy");
};

export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "MMM dd, yyyy HH:mm");
};

export const formatDateForInput = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "yyyy-MM-dd");
};

export const getMonthsArray = (): string[] => {
  return [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
};

export const groupDataByMonth = (data: { date: string; value: number }[]): { date: string; value: number }[] => {
  const monthlyData: { [key: string]: number } = {};
  
  data.forEach(item => {
    const date = parseISO(item.date);
    const monthYear = format(date, "MMM yyyy");
    
    monthlyData[monthYear] = (monthlyData[monthYear] || 0) + item.value;
  });
  
  return Object.entries(monthlyData).map(([date, value]) => ({ date, value }));
};