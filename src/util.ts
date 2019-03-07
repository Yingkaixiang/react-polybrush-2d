interface Vector {
  x: number;
  y: number;
}

export function crossMul(v1: Vector, v2: Vector) {
  return v1.x * v2.y - v1.y * v2.x;
}

// p1 p2 为一条线段 p3 p4 为一条线段
export function checkIntersect(p1: Vector, p2: Vector, p3: Vector, p4: Vector) {
  let v1 = { x: p1.x - p3.x, y: p1.y - p3.y };
  let v2 = { x: p2.x - p3.x, y: p2.y - p3.y };
  let v3 = { x: p4.x - p3.x, y: p4.y - p3.y };
  const v = crossMul(v1, v3) * crossMul(v2, v3);
  v1 = { x: p3.x - p1.x, y: p3.y - p1.y };
  v2 = { x: p4.x - p1.x, y: p4.y - p1.y };
  v3 = { x: p2.x - p1.x, y: p2.y - p1.y };
  return v <= 0 && crossMul(v1, v3) * crossMul(v2, v3) <= 0 ? true : false;
}

export function calArea(p0: any, p1: any, p2: any) {
  let area = 0.0;
  area =
    p0[0] * p1[1] +
    p1[0] * p2[1] +
    p2[0] * p0[1] -
    p1[0] * p0[1] -
    p2[0] * p1[1] -
    p0[0] * p2[1];
  return area / 2;
}

// line 249 计算polygon的质心
export function getPolygonAreaCenter(points: number[][]) {
  let sum_x = 0;
  let sum_y = 0;
  let sum_area = 0;
  let p1 = points[1];
  for (let i = 2; i < points.length; i++) {
    const p2 = points[i];
    const area = calArea(points[0], p1, p2);
    sum_area += area;
    sum_x += (points[0][0] + p1[0] + p2[0]) * area;
    sum_y += (points[0][1] + p1[1] + p2[1]) * area;
    p1 = p2;
  }
  const xx = sum_x / sum_area / 3;
  const yy = sum_y / sum_area / 3;
  return [Math.round(xx), Math.round(yy)];
}
