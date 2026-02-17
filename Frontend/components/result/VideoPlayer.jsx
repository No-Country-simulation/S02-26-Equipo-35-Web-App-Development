import React from "react";
import { ShortVideo } from "./ShortVideo";

export const VideoPlayer = ({ shorts }) => {
  return (
    <div className='d-flex gap-4 flex-wrap justify-content-center'>
      {shorts && shorts.length > 0 ? (
        shorts.map((short) => <ShortVideo key={short.id} short={short} />)
      ) : (
        <p>No shorts available</p>
      )}
    </div>
  );
};
