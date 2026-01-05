export const getISTTime = () => {
  const options = {
    timeZone: 'Asia/Kolkata',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  };

  return new Intl.DateTimeFormat('en-IN', options).format(new Date());
};

export const getLogTimestamp = () => {
  const time = getISTTime();
  const [date, timeStr] = time.split(', ');
  return `[${date} ${timeStr} IST]`;
};

export const formatDateIST = (date = new Date()) => {
  const options = {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  };

  return new Intl.DateTimeFormat('en-IN', options).format(date);
};
