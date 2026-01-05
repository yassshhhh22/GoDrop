import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Label,
  Select,
  Text,
  Loader,
  MessageBox,
} from '@adminjs/design-system';
import { ApiClient } from 'adminjs';

const api = new ApiClient();

const AssignPartner = (props) => {
  const { record, resource } = props;
  const [partners, setPartners] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch available delivery partners
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setLoading(true);

        // Call AdminJS API to get delivery partners
        const response = await api.resourceAction({
          resourceId: 'DeliveryPartner',
          actionName: 'list',
        });

        const availablePartners = response.data.records
          .filter((p) => p.params.isAvailable === true)
          .map((p) => ({
            value: p.params._id,
            label: `${p.params.name || 'Unnamed'} - ${p.params.phone || 'No phone'}`,
          }));

        setPartners(availablePartners);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching partners:', err);
        setError('Failed to load delivery partners');
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  // Handle assignment
  const handleAssign = async () => {
    if (!selectedPartner) {
      setError('Please select a delivery partner');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const orderId = record.params.orderId;

      // ✅ CHANGE: Better fetch with proper error handling
      const response = await fetch('/api/admin/assign-partner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for AdminJS session
        body: JSON.stringify({
          orderId: orderId,
          deliveryPartnerId: selectedPartner,
        }),
      });

      // ✅ CHANGE: Proper error response handling
      if (!response.ok) {
        const data = await response.json().catch(() => ({
          message: `Server error: ${response.status}`,
        }));
        throw new Error(data.message || 'Failed to assign partner');
      }

      const data = await response.json();
      setSuccess('Delivery partner assigned successfully!');
      setLoading(false);

      // ✅ CHANGE: Better redirect to show page
      setTimeout(() => {
        window.location.href = `/admin/resources/Order/records/${record.id}/show`;
      }, 2000);
    } catch (err) {
      console.error('Assignment error:', err);
      setError(err.message || 'Failed to assign delivery partner');
      setLoading(false);
    }
  };

  // Check if already assigned
  // ✅ CHANGE: Better check for already assigned partner
  const isAssigned = record.params.deliveryPartner && 
    record.params.deliveryPartner.toString().length > 0;

  if (isAssigned) {
    return (
      <Box margin="lg">
        <MessageBox
          message="This order is already assigned to a delivery partner"
          variant="info"
        />
      </Box>
    );
  }

  return (
    <Box margin="lg">
      <Box marginBottom="xl">
        <Text fontSize="h4" fontWeight="bold">
          Assign Delivery Partner
        </Text>
        <Text fontSize="sm" color="grey60" marginTop="sm">
          Select an available delivery partner to assign this order
        </Text>
      </Box>

      <Box
        marginBottom="xl"
        padding="default"
        bg="grey20"
        borderRadius="default"
      >
        <Text fontSize="sm" fontWeight="bold">
          Order ID: {record.params.orderId}
        </Text>
        <Text fontSize="sm" color="grey60">
          Customer: {record.populated?.customer?.params?.name || 'N/A'}
        </Text>
        <Text fontSize="sm" color="grey60">
          Total: ₹{record.params.totalPrice}
        </Text>
      </Box>

      {error && (
        <Box marginBottom="lg">
          <MessageBox message={error} variant="danger" />
        </Box>
      )}

      {success && (
        <Box marginBottom="lg">
          <MessageBox message={success} variant="success" />
        </Box>
      )}

      {loading && !success ? (
        <Box display="flex" justifyContent="center" padding="xxl">
          <Loader />
        </Box>
      ) : (
        <>
          <Box marginBottom="xl">
            <Label required>Select Delivery Partner</Label>
            {/* ✅ FIX: Use proper Select component props */}
            <Select
              value={partners.find((p) => p.value === selectedPartner)}
              onChange={(selected) => {
                console.log('Selected partner:', selected);
                setSelectedPartner(selected?.value || '');
              }}
              options={partners}
              placeholder="Choose a delivery partner..."
              isDisabled={loading || !!success}
              isClearable={false}
            />

            {partners.length === 0 && !loading && (
              <Text fontSize="sm" color="grey60" marginTop="sm">
                No available delivery partners found
              </Text>
            )}

            {/* ✅ DEBUG: Show selected value */}
            {selectedPartner && (
              <Text fontSize="sm" color="primary" marginTop="sm">
                Selected: {partners.find((p) => p.value === selectedPartner)?.label}
              </Text>
            )}
          </Box>

          <Box display="flex" gap="default">
            <Button
              variant="primary"
              onClick={handleAssign}
              disabled={
                loading ||
                !selectedPartner ||
                !!success ||
                partners.length === 0
              }
            >
              {loading ? 'Assigning...' : 'Assign Partner'}
            </Button>
            <Button
              variant="text"
              onClick={() => window.history.back()}
              disabled={loading}
            >
              Cancel
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default AssignPartner;
