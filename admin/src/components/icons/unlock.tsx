// @ts-nocheck

import React from "react";

const initSize = 330;

const UnlockIcon = ({ width, height, size = 16 }) => (
  <svg
    width={width || size}
    height={height || size}
    viewBox={`0 0 ${width || size} ${height || size}`}
    style={{ width: `${width || size}px`, height: `${height || size}px` }}
    xmlns="http://www.w3.org/2000/svg"
  >
    <g style={{ transform: `scale(${(width || size) / initSize})` }}>
      <path
        d="M15,160c8.283,0,15-6.716,15-15V85c0-30.327,24.672-55,55-55c30.326,0,55,24.673,55,55v42.893
      c-24.479,21.105-40,52.327-40,87.107c0,63.411,51.588,115,115,115c63.41,0,115-51.589,115-115s-51.59-115-115-115
      c-15.961,0-31.172,3.271-45,9.174V85c0-46.869-38.131-85-85-85S0,38.131,0,85v60C0,153.284,6.715,160,15,160z"
      />
    </g>
  </svg>
);

export default UnlockIcon;
