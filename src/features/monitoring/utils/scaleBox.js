export const scaleBox = (box, videoSize, renderSize) => {
  if (!box || !videoSize || !renderSize) return null;
  const sx = renderSize.width / videoSize.width;
  const sy = renderSize.height / videoSize.height;
  return {
    x: box.left * sx,
    y: box.top * sy,
    width: (box.right - box.left) * sx,
    height: (box.bottom - box.top) * sy,
  };
};

export const scaleRect = (rect, videoSize, renderSize) => {
  if (!rect || !videoSize || !renderSize) return null;
  const sx = renderSize.width / videoSize.width;
  const sy = renderSize.height / videoSize.height;
  return {
    x: rect.x1 * sx,
    y: rect.y1 * sy,
    width: (rect.x2 - rect.x1) * sx,
    height: (rect.y2 - rect.y1) * sy,
  };
};
