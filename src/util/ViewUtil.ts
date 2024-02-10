import ScreenCoordinate from './ScreenCoordinate'
import GridCoordinate from './GridCoordinate'
import Konva from 'konva'

export function gridToScreen(gridCoord : GridCoordinate) {
    return new ScreenCoordinate( (gridCoord.x) * (<any>window).POLY_ROW_WIDTH + (<any>window).X_MIN +(<any>window).POLY_WIDTH/2,  (gridCoord.y+ (gridCoord.x%2)/2) * (<any>window).POLY_HEIGHT + (<any>window).Y_MIN);
}

//From https://konvajs.org/docs/posts/Position_vs_Offset.html
const rotatePoint = ({ x, y }, rad) => {
  const rcos = Math.cos(rad);
  const rsin = Math.sin(rad);
  return { x: x * rcos - y * rsin, y: y * rcos + x * rsin };
};

export function rotateAroundCenter(node : any, rotation : number) {
  const topLeft = { x: -node.width() / 2, y: -node.height() / 2 };
  const current = rotatePoint(topLeft, Konva.getAngle(node.rotation()));
  const rotated = rotatePoint(topLeft, Konva.getAngle(rotation));
  const dx = rotated.x - current.x,
    dy = rotated.y - current.y;

  node.rotation(rotation);
  node.x(node.x() + dx);
  node.y(node.y() + dy);
}


