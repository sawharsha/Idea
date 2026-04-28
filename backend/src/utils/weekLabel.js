const {
  getWeekOfMonth,
  getCurrentCycleWindow,
} = require("./cycleWindow");

const getCycleLabel = (date = new Date()) =>
  getCurrentCycleWindow(date).cycleLabel;

const getWeekLabel = getCycleLabel;

const getPreviousWeekLabel = (date = new Date()) =>
  getCurrentCycleWindow(date).winnerCycleLabel || getCycleLabel(date);

module.exports = {
  getWeekOfMonth,
  getCycleLabel,
  getWeekLabel,
  getPreviousWeekLabel,
};
