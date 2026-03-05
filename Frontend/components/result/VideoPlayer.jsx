import React from "react";
import { ShortCard } from "../common/ShortCard";

export const VideoPlayer = ({ shorts }) => {
  return (
    <div className='container py-4'>
      {shorts && shorts.length > 0 ? (
        <div className='row g-3 justify-content-center'>
          {shorts.map((short) => (
            <div
              key={short.id}
              className='col-12 col-sm-6 col-md-4 col-lg-3 d-flex justify-content-center'
            >
              <div style={{ width: "100%", maxWidth: "260px" }}>
                <ShortCard short={short} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className='text-center text-muted'>No shorts available</p>
      )}
    </div>
  );
};
