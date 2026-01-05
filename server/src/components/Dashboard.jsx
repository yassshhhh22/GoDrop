import React, { useEffect, useState } from 'react';
import {
  Box,
  H2,
  H5,
  Text,
  Button,
  Icon,
  Section,
  Loader,
} from '@adminjs/design-system';
import { ApiClient } from 'adminjs';
import { io } from 'socket.io-client';

// This is the new alert component for cancelled orders.
const CancelledOrderAlert = ({ order, onDismiss }) => {
  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      width="100%"
      height="100vh"
      bg="rgba(0, 0, 0, 0.6)"
      zIndex={1000}
      onClick={onDismiss}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Box
        bg="white"
        borderRadius="lg"
        p="xxl"
        width={{ base: '90%', sm: '400px' }}
        boxShadow="overlay"
        onClick={(e) => e.stopPropagation()}
      >
        <Box textAlign="center">
          <Icon icon="XCircle" color="red" size={48} />
          <H2 my="lg">Order Cancelled</H2>
          <Text fontSize="xl" mb="md">
            Order #{order.orderId}
          </Text>
          <Text color="grey80">Customer: {order.customerName}</Text>
          <Text color="grey80" mt="md">
            Reason: "{order.cancellationReason}"
          </Text>
          <Button variant="primary" onClick={onDismiss} size="lg" mt="lg">
            Acknowledge
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

// This is the existing alert component for new orders.
const NewOrderAlert = ({ order, onDismiss }) => {
  return (
    // The semi-transparent background overlay
    <Box
      position="fixed"
      top={0}
      left={0}
      width="100%"
      height="100vh"
      bg="rgba(0, 0, 0, 0.6)"
      zIndex={1000}
      onClick={onDismiss} // Dismiss when clicking the background
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Box
        bg="white"
        borderRadius="lg"
        p="xxl"
        width={{ base: '90%', sm: '400px' }}
        boxShadow="overlay"
        onClick={(e) => e.stopPropagation()} // Prevents clicks inside the card from closing it
      >
        <Box textAlign="center">
          <Icon icon="ShoppingCart" color="primary100" size={48} />
          <H2 my="lg">New Order Received!</H2>
          <Text fontSize="xl" mb="md">
            Order #{order.orderId}
          </Text>
          <Text color="grey80">Customer: {order.customerName}</Text>
          <Text color="grey80" fontSize="xxl" fontWeight="bold" my="md">
            ₹{order.totalPrice?.toFixed(2) || '0.00'}
          </Text>
          <Button variant="primary" onClick={onDismiss} size="lg" mt="lg">
            Acknowledge
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

const Dashboard = () => {
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [latestOrders, setLatestOrders] = useState([]);
  const [latestCancelledOrders, setLatestCancelledOrders] = useState([]); // ✅ New state for cancelled orders
  const [loading, setLoading] = useState(true);
  const [newOrderAlert, setNewOrderAlert] = useState(null);
  const [cancelledOrderAlert, setCancelledOrderAlert] = useState(null); // ✅ New state for cancelled alert
  const api = new ApiClient();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // ✅ CRITICAL: Fetch initial data
    const fetchDashboardData = async () => {
      try {
        const response = await api.getDashboard();
        console.log('📊 Dashboard data:', response.data);

        setPendingOrdersCount(response.data.pendingCount || 0);

        // ✅ Format orders from response
        const formattedOrders = (response.data.recentOrders || []).map(
          (order) => ({
            orderId: order.orderId,
            _id: order._id,
            customerName: order.customer?.name || 'Unknown',
            totalPrice: order.totalPrice || 0,
            status: order.status,
            createdAt: order.createdAt,
          })
        );

        setLatestOrders(formattedOrders);
        setLoading(false);
      } catch (err) {
        console.error('❌ Error fetching dashboard data:', err);
        setLoading(false);
      }
    };

    fetchDashboardData();

    // ✅ Connect to Socket.IO
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket'],
      withCredentials: true,
    });

    newSocket.on('connect', () => {
      console.log('✅ Dashboard Socket.IO Connected');
      newSocket.emit('joinAdminDashboard');
    });

    // ✅ CRITICAL: Handle new order with proper structure
    const handleNewOrder = (newOrderData) => {
      console.log('🔔 New order received via socket:', newOrderData);

      // ✅ Create properly formatted order object
      const displayOrder = {
        orderId: newOrderData.orderId,
        _id: newOrderData._id || newOrderData.orderId,
        customerName:
          newOrderData.customerName ||
          newOrderData.customer?.name ||
          'Unknown Customer',
        totalPrice: newOrderData.totalPrice || 0,
        status: newOrderData.status || 'pending',
        createdAt: new Date().toISOString(),
      };

      console.log('📝 Formatted order:', displayOrder);

      // ✅ Show alert
      setNewOrderAlert(displayOrder);

      // ✅ Update count
      setPendingOrdersCount((prevCount) => prevCount + 1);

      // ✅ Add to list at the top and limit to 5
      setLatestOrders((prevOrders) => {
        const updated = [displayOrder, ...prevOrders];
        return updated.slice(0, 5); // Keep only 5 latest
      });
    };

    // ✅ New handler for cancelled orders
    const handleOrderCancelled = (cancelledOrderData) => {
      console.log('🔔 Order cancelled via socket:', cancelledOrderData);
      const displayOrder = {
        orderId: cancelledOrderData.orderId,
        _id: cancelledOrderData._id || cancelledOrderData.orderId,
        customerName: cancelledOrderData.customerName || 'Unknown Customer',
        cancellationReason: cancelledOrderData.cancellationReason,
      };

      setCancelledOrderAlert(displayOrder);

      setLatestCancelledOrders((prevOrders) => {
        const updated = [displayOrder, ...prevOrders];
        return updated.slice(0, 5);
      });
    };

    newSocket.on('newOrder', handleNewOrder);
    newSocket.on('newPrintOrder', handleNewOrder);
    newSocket.on('paymentVerified', handleNewOrder);
    newSocket.on('orderCancelled', handleOrderCancelled); // ✅ Listen for the new event

    newSocket.on('disconnect', () => {
      console.log('❌ Dashboard Socket.IO Disconnected');
    });

    setSocket(newSocket);

    // ✅ Cleanup on unmount
    return () => {
      if (newSocket) {
        newSocket.off('orderCancelled', handleOrderCancelled); // ✅ Cleanup the new listener
        newSocket.disconnect();
      }
    };
  }, []);

  const handleDismissAlert = () => {
    setNewOrderAlert(null);
    setCancelledOrderAlert(null); // ✅ Dismiss cancelled alert as well
  };

  const handleCardClick = () => {
    window.location.href = '/admin/resources/Order?filters.status=pending';
  };

  if (loading) {
    return (
      <Section>
        <Loader />
      </Section>
    );
  }

  return (
    <Box>
      {/* ✅ Show alert overlay when new order arrives */}
      {newOrderAlert && (
        <NewOrderAlert order={newOrderAlert} onDismiss={handleDismissAlert} />
      )}
      {/* ✅ Show alert overlay when an order is cancelled */}
      {cancelledOrderAlert && (
        <CancelledOrderAlert
          order={cancelledOrderAlert}
          onDismiss={handleDismissAlert}
        />
      )}

      {/* Existing Dashboard Content */}
      <Section>
        <H2>Welcome, Admin!</H2>
        <Text>Here is a summary of your store's activity.</Text>
      </Section>

      <Section>
        <Box
          display="flex"
          flexDirection={{ base: 'column', md: 'row' }}
          style={{ gap: '24px' }}
        >
          {/* Pending Orders Card */}
          <Box
            variant="white"
            p="xxl"
            flex="1"
            boxShadow="card"
            onClick={handleCardClick}
            style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)')
            }
          >
            <Text fontSize="xl" color="grey60">
              Total Pending Orders
            </Text>
            <H2 fontSize="xxl" my="md">
              {pendingOrdersCount}
            </H2>
            <Text>
              You have <strong>{pendingOrdersCount}</strong> total orders that
              need your attention.
            </Text>
            <Button variant="primary" mt="lg">
              <Icon icon="ShoppingCart" />
              View All Pending Orders
            </Button>
          </Box>

          {/* Latest Cancelled Orders Card */}
          <Box variant="white" p="xxl" flex="2" boxShadow="card">
            <H5 mb="lg">Latest Cancelled Orders</H5>
            {latestCancelledOrders.length > 0 ? (
              <Box>
                {latestCancelledOrders.map((order) => (
                  <Box
                    key={order._id || order.orderId}
                    display="flex"
                    justifyContent="space-between"
                    py="md"
                    borderBottom="1px solid #EEE"
                    alignItems="center"
                  >
                    <Box>
                      <Text fontWeight="bold">Order #{order.orderId}</Text>
                      <Text fontSize="sm" color="grey60">
                        {order.customerName}
                      </Text>
                    </Box>
                    <Box textAlign="right">
                      <Text fontSize="sm" color="red">
                        Cancelled
                      </Text>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Text textAlign="center" p="xl" color="grey60">
                No recent cancellations.
              </Text>
            )}
          </Box>
        </Box>
      </Section>

      {/* Existing Latest Incoming Orders Section */}
      <Section>
        <Box variant="white" p="xxl" boxShadow="card">
            <H5 mb="lg">Latest Incoming Orders</H5>

            {latestOrders && latestOrders.length > 0 ? (
              <Box>
                {latestOrders.map((order) => (
                  <Box
                    key={order._id || order.orderId}
                    display="flex"
                    justifyContent="space-between"
                    py="md"
                    borderBottom="1px solid #EEE"
                    alignItems="center"
                  >
                    <Box flex="1">
                      <Text fontWeight="bold">Order #{order.orderId}</Text>
                      <Text fontSize="sm" color="grey60">
                        {order.customerName}
                      </Text>
                    </Box>
                    <Box textAlign="right">
                      <Text fontWeight="bold" fontSize="lg">
                        ₹{order.totalPrice?.toFixed(2) || '0.00'}
                      </Text>
                      <Text fontSize="sm" color="grey60">
                        {order.status}
                      </Text>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Text textAlign="center" p="xl" color="grey60">
                Waiting for new orders...
              </Text>
            )}
          </Box>
      </Section>
    </Box>
  );
};

export default Dashboard;
