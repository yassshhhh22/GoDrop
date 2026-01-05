import React from 'react';
import { Box, Text } from '@adminjs/design-system';
const ImageGallery = (props) => {
  const { record } = props;
  
  // Unflatten the params
  const images = [];
  let index = 0;
  while (record.params[`images.${index}`] !== undefined) {
    images.push(record.params[`images.${index}`]);
    index++;
  }

  if (images.length === 0) {
    return <Text>No images uploaded</Text>;
  }
  return (
    <Box>
      <Text fontSize="sm" marginBottom="default" color="grey60">
        {images.length} image(s) - First image is primary
      </Text>
      <Box
        display="grid"
        gridTemplateColumns="repeat(auto-fill, minmax(200px, 1fr))"
        gap="default"
      >
        {images.map((url, index) => (
          <Box key={index} position="relative">
            <a href={url} target="_blank" rel="noopener noreferrer">
              <img
                src={url}
                alt={`Image ${index + 1}`}
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                  borderRadius: '4px',
                  border:
                    index === 0 ? '3px solid #4CAF50' : '1px solid #e0e0e0',
                  cursor: 'pointer',
                }}
              />
            </a>
            {index === 0 && (
              <Box
                position="absolute"
                top="8px"
                left="8px"
                bg="success"
                color="white"
                padding="xs"
                fontSize="xs"
                borderRadius="4px"
              >
                Primary
              </Box>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default ImageGallery;
