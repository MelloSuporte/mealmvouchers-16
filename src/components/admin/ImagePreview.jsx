import React from 'react';

const ImagePreview = ({ imageUrl, label }) => {
  if (!imageUrl) return null;

  return (
    <div className="mt-2">
      <img
        src={imageUrl}
        alt={`Preview ${label}`}
        className="max-w-sm h-auto rounded-lg shadow-sm border border-gray-100"
      />
    </div>
  );
};

export default ImagePreview;