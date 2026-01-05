import React from 'react';
import { Box } from '@adminjs/design-system';

const ImageThumbnail = (props) => {
  const { record } = props;

  // Get first image from flattened property
  const primaryImage = record.params['images.0'];

  if (!primaryImage) {
    return <Box>No image</Box>;
  }

  return (
    <img
      src={primaryImage}
      alt="Product"
      style={{
        width: '60px',
        height: '60px',
        objectFit: 'cover',
        borderRadius: '4px',
      }}
    />
  );
};

export default ImageThumbnail;
