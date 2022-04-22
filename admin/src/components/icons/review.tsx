// @ts-nocheck

import React from "react";

const initSize = 16;

const ReviewIcon = ({ width, height, size = 16 }) => (
  <svg
    width={width || size}
    height={height || size}
    viewBox={`0 0 ${width || size} ${height || size}`}
    style={{ width: `${width || size}px`, height: `${height || size}px` }}
    xmlns="http://www.w3.org/2000/svg"
  >
    <g style={{ transform: `scale(${(width || size) / initSize})` }}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 4a4 4 0 014-4h8a4 4 0 014 4v8a4 4 0 01-4 4H4a4 4 0 01-4-4V4zm6.996.165a1.017 1.017 0 112.012 0L8 11 6.996 4.165zM8 11a1 1 0 110 2 1 1 0 010-2z"
      />
    </g>
  </svg>
);

export default ReviewIcon;
