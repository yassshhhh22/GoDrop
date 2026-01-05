import React, { useState, useEffect } from 'react';
import { Box, Button, Label, Text, Icon, Loader } from '@adminjs/design-system';
import axios from 'axios';

const ImageUpload = (props) => {
  const { property, record, onChange } = props;

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState([]);
  const [localImages, setLocalImages] = useState([]);

  const maxImages = property.custom?.maxImages || 5;

  useEffect(() => {
    const existingImages = record.params.images || [];
    setLocalImages(existingImages);
  }, [record.params.images]);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (files.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const invalidFiles = files.filter((f) => !allowedTypes.includes(f.type));
    if (invalidFiles.length > 0) {
      setError('Only JPEG, PNG, and WebP images are allowed');
      return;
    }

    const largeFiles = files.filter((f) => f.size > 5 * 1024 * 1024);
    if (largeFiles.length > 0) {
      setError('All files must be less than 5MB');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(new Array(files.length).fill(0));

    try {
      const uploadedUrls = [];
      const uploadedPublicIds = [];

      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('image', files[i]);

        const baseURL = window.location.origin;
        const response = await axios.post(
          `${baseURL}/api/admin/upload-image`,
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
            withCredentials: true,
            onUploadProgress: (progressEvent) => {
              const percent = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress((prev) => {
                const newProgress = [...prev];
                newProgress[i] = percent;
                return newProgress;
              });
            },
          }
        );

        if (response.data?.data) {
          uploadedUrls.push(response.data.data.url);
          uploadedPublicIds.push(response.data.data.publicId);
        }
      }

      setLocalImages(uploadedUrls);
      onChange('images', uploadedUrls);
      onChange('imagePublicIds', uploadedPublicIds);
      onChange('_imagesReplaced', true);

      setError(null);
    } catch (err) {
      console.error('Upload error:', err);
      setError(
        err.response?.data?.message || 'Upload failed. Please try again.'
      );
    } finally {
      setUploading(false);
      setUploadProgress([]);
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = localImages.filter((_, i) => i !== index);
    const newPublicIds = (record.params.imagePublicIds || []).filter(
      (_, i) => i !== index
    );

    setLocalImages(newImages);
    onChange('images', newImages);
    onChange('imagePublicIds', newPublicIds);
    onChange('_imagesReplaced', true);
  };

  const handleRemoveAll = () => {
    setLocalImages([]);
    onChange('images', []);
    onChange('imagePublicIds', []);
    onChange('_imagesReplaced', true);
    setError(null);
  };

  return (
    <Box marginBottom="xl">
      <Label>
        {property.label} {property.isRequired && <Text color="error">*</Text>}
      </Label>
      <Text fontSize="sm" color="grey60" marginBottom="default">
        Upload up to {maxImages} images. First image will be the primary image.
      </Text>

      {localImages.length > 0 && (
        <Box marginBottom="lg">
          <Box
            display="grid"
            gridTemplateColumns="repeat(auto-fill, minmax(150px, 1fr))"
            gap="default"
          >
            {localImages.map((url, index) => (
              <Box key={index} position="relative">
                <img
                  src={url}
                  alt={`Image ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '150px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    border:
                      index === 0 ? '3px solid #4CAF50' : '1px solid #e0e0e0',
                  }}
                />
                {index === 0 && (
                  <Box
                    position="absolute"
                    top="4px"
                    left="4px"
                    bg="success"
                    color="white"
                    padding="xs"
                    fontSize="xs"
                    borderRadius="2px"
                  >
                    Primary
                  </Box>
                )}
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleRemoveImage(index)}
                  disabled={uploading}
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    padding: '4px 8px',
                  }}
                >
                  <Icon icon="Trash" />
                </Button>
              </Box>
            ))}
          </Box>
          <Box marginTop="default">
            <Button
              size="sm"
              variant="text"
              onClick={handleRemoveAll}
              disabled={uploading}
            >
              Remove All Images
            </Button>
          </Box>
        </Box>
      )}

      {error && (
        <Box
          marginBottom="default"
          padding="default"
          bg="errorLight"
          borderRadius="4px"
        >
          <Text color="error" fontSize="sm">
            {error}
          </Text>
        </Box>
      )}

      {uploading && (
        <Box marginBottom="default">
          <Text fontSize="sm" marginBottom="sm">
            Uploading images...
          </Text>
          {uploadProgress.map((progress, i) => (
            <Box key={i} marginBottom="xs">
              <Text fontSize="xs">
                Image {i + 1}: {progress}%
              </Text>
              <Box bg="grey40" height="4px" borderRadius="2px">
                <Box
                  bg="primary"
                  height="4px"
                  borderRadius="2px"
                  style={{ width: `${progress}%` }}
                />
              </Box>
            </Box>
          ))}
        </Box>
      )}

      <Box marginTop="default">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleFileChange}
          disabled={uploading || localImages.length >= maxImages}
          id={`upload-${property.path}`}
          style={{ display: 'none' }}
        />

        <label htmlFor={`upload-${property.path}`}>
          <Button
            as="span"
            disabled={uploading || localImages.length >= maxImages}
            variant={localImages.length > 0 ? 'light' : 'primary'}
          >
            {uploading ? (
              <>
                <Loader /> Uploading...
              </>
            ) : (
              <>
                <Icon icon="Add" />
                {localImages.length > 0
                  ? ' Replace All Images'
                  : ' Upload Images'}
              </>
            )}
          </Button>
        </label>
      </Box>

      <Text fontSize="xs" color="grey60" marginTop="sm">
        {localImages.length}/{maxImages} images uploaded
      </Text>
    </Box>
  );
};

export default ImageUpload;
