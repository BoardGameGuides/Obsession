import React from 'react';
import { resolveRoute } from '../shared/path';
import { images, imagesDimensions } from '../contentFiles';

function rectPoint(x1, y1, x2, y2) {
  return `M ${x1} ${y1} L ${x1} ${y2} L ${x2} ${y2} L ${x2} ${y1} L ${x1} ${y1} z`;
}

function rect(x, y, w, h) {
  return rectPoint(x, y, x + w, y + h);
}

/**
 * 
 * @param {{route: string; src: string;}} props 
 */
export default function TileVp(props) {
  const imageRoute = resolveRoute(props.route, props.src);
  const h = imagesDimensions[imageRoute].importedModule.height;
  const w = imagesDimensions[imageRoute].importedModule.width;
  const darken = rect(0, 0, w, h);
  const highlight = rectPoint(128, 130, 153, 156);
  return (
    <svg height={h} width={w} style={{display: "block", margin: "0 auto"}}>
      <image xlinkHref={images[imageRoute].importedModule} />
      <path d={`${darken} ${highlight}`} fill="black" fillOpacity="0.5" fillRule="evenodd" />
    </svg>
  );
}