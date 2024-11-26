import React from 'react';

const ImagePreview = ({ imageUrl, label }) => {
  if (!imageUrl) return null;

  const displayUrl = typeof imageUrl === 'string' 
    ? imageUrl 
    : URL.createObjectURL(imageUrl);

  return (
    <div className="mt-2">
      <img
        src={displayUrl}
        alt={`Preview ${label}`}
        className="max-w-xs h-auto rounded-lg shadow-md"
      />
    </div>
  );
};

export default ImagePreview;