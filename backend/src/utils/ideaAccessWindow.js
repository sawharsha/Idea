const isIdeaSubmissionWindowOpen = () => {
  const now = new Date();

  const day = now.getDay(); 
  // Sunday = 0, Monday = 1, Tuesday = 2, Wednesday = 3, Thursday = 4, Friday = 5, Saturday = 6

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTimeInMinutes = hours * 60 + minutes;

  const mondayStart = 6 * 60; // 6:00 AM
  const fridayEnd = 15 * 60; // 3:00 PM

  if (day === 0 || day === 6) {
    return false;
  }

  if (day === 1 && currentTimeInMinutes < mondayStart) {
    return false;
  }

  if (day === 5 && currentTimeInMinutes > fridayEnd) {
    return false;
  }

  return true;
};

module.exports = {
  isIdeaSubmissionWindowOpen,
};