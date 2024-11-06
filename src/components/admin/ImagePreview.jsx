import React from 'react';

const ImagePreview = ({ imageUrl, label }) => {
  if (!imageUrl) return null;

  return (
    <div className="mt-2">
      <img
        src={imageUrl}
        alt={`Preview ${label}`}
        className="max-w-xs h-auto rounded-lg shadow-md"
      />
    </div>
  );
};

export default ImagePreview;