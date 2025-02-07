const formatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Singapore',  // 設定 UTC+8 的時區
  month: '2-digit',
  day: '2-digit'
});

function addDays(date, offset) {
  const result = new Date(date);
  result.setDate(result.getDate() + offset);
  return result;
}


function formateTaipeiZone(date) {
  const formattedDate = formatter.format(date);
  return formattedDate.replace(/\//g, '/');
}

/**
 * 格式化日期字符串
 * @param {string} date - 格式為 "MM-DD" 的日期字符串
 * @returns {string|null} 格式化後的日期字符串，格式錯誤時返回 null
 */
function formatDate(date) {
    const datePattern = /^\d{2}-\d{2}$/;
    if (datePattern.test(date)) {
        return date.replace(/\-/g, '/');
    } else {
        console.warn(`date format error: ${date}`);
        return null;
    }
}

module.exports = { addDays, formateTaipeiZone, formatDate };

