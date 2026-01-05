import React from 'react';
import { Box } from '@adminjs/design-system';

const CustomTopBar = () => {
  return (
    <Box bg="red" height="navbarHeight" px="xl" py="lg">
      <h2 style={{color: 'white'}}>Test: Custom Top Bar Loaded</h2>
    </Box>
  );
};

export default CustomTopBar;