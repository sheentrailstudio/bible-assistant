function addDays(date, offset) {
  const result = new Date(date);
  result.setDate(result.getDate() + offset);
  return result;
}

// UTC+8
function getToday() {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Singapore',  // 設定 UTC+8 的時區
    month: '2-digit',
    day: '2-digit'
  });

  const now = new Date();
  const formattedDate = formatter.format(now);
  return formattedDate.replace(/\//g, '/');
}

function formateTaipeiZone(date) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Singapore',  // 設定 UTC+8 的時區
    month: '2-digit',
    day: '2-digit'
  });
  const formattedDate = formatter.format(date);
  return formattedDate.replace(/\//g, '/');
}

module.exports = { addDays, getToday, formateTaipeiZone };

