import { memo, type CSSProperties } from "react";
import type { SpriteDef } from "./sprites";

interface Props {
  def: SpriteDef;
  scale?: number;
  className?: string;
  style?: CSSProperties;
}

export const Sprite = memo(function Sprite({ def, scale = 4, className, style }: Props) {
  const h = def.rows.length;
  const w = Math.max(...def.rows.map((r) => r.length));
  const rects: React.ReactNode[] = [];
  def.rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      if (ch === "." || !def.pal[ch]) {
        x++;
        continue;
      }
      let e = x;
      while (e < row.length && row[e] === ch) e++;
      rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={e - x} height={1} fill={def.pal[ch]} />);
      x = e;
    }
  });
  return (
    <svg
      width={w * scale}
      height={h * scale}
      viewBox={`0 0 ${w} ${h}`}
      shapeRendering="crispEdges"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {rects}
    </svg>
  );
});
