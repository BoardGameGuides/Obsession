import React from 'react';
import { useLocation } from 'react-router-dom';
import { images, imagesDimensions } from '../contentFiles';
import { resolveRoute } from '../shared/path';

/**
 * @typedef Rect
 * @property {number} x 
 * @property {number} y 
 * @property {number} width
 * @property {number} height
 * @property {number} [rx] 
 * @property {number} [ry] 
 */

/**
 * Draws a rectangle using path syntax.
 * @param {Rect} r 
 */
function rect({ x, y, width: w, height: h, rx, ry }) {
  if (rx && ry) {
    return `M ${x + w - rx} ${y} ` +
      `a ${rx} ${ry} 0 0 1 ${+rx} ${+ry} v ${+h - 2 * ry} ` +
      `a ${rx} ${ry} 0 0 1 ${-rx} ${+ry} h ${-w + 2 * rx} ` +
      `a ${rx} ${ry} 0 0 1 ${-rx} ${-ry} v ${-h + 2 * ry} ` +
      `a ${rx} ${ry} 0 0 1 ${+rx} ${-ry} z`;
  }
  return `M ${x} ${y} h ${w} v ${h} h ${-w} z`;
}

/**
 * Draws an image with one or more sections highlighted.
 * @param {{absoluteSrc?: string; src?: string; highlights: { x: number; y: number; width: number; height: number; }[];}} props 
 */
export default function Highlight(props) {
  const location = useLocation();
  const currentRoute = location.pathname;
  const imageRoute = props.absoluteSrc || resolveRoute('.' + currentRoute, props.src);
  const width = imagesDimensions[imageRoute].width;
  const height = imagesDimensions[imageRoute].height;
  const highlightPath = props.highlights.map(x => rect(x)).join(' ');
  const path = rect({ x: 0, y: 0, width, height }) + ' ' + highlightPath;
  return (
    <p>
      <svg width={width} height={height} style={{ display: "block", margin: "0 auto" }} className="img-fluid" viewBox={`0 0 ${width} ${height}`}>
        <image xlinkHref={images[imageRoute].src} />
        <path d={path} fill="black" fillOpacity="0.5" fillRule="evenodd" />
        <path d={highlightPath} stroke="red" fill="none" strokeWidth="3" strokeLinejoin="round" />
      </svg>
    </p>
  );
}
