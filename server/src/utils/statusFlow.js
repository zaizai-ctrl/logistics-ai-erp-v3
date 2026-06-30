export const STATUS_FLOW = ['待入库', '已入库', '待收款', '已收款', '待打款', '已完成'];

export function isValidStatus(status) {
  return STATUS_FLOW.includes(status);
}

export function getNextStatus(status) {
  const currentIndex = STATUS_FLOW.indexOf(status);
  return STATUS_FLOW[currentIndex + 1] || null;
}

export function canTransition(currentStatus, nextStatus) {
  if (currentStatus === nextStatus) {
    return true;
  }
  return getNextStatus(currentStatus) === nextStatus;
}

