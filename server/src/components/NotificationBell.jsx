import React, { useEffect, useState } from 'react';
import {
  Icon,
  Badge,
  DropDown,
  DropDownItem,
  H3,
  Text,
} from '@adminjs/design-system';
import { ApiClient } from 'adminjs';
import { io } from 'socket.io-client';

const NotificationBell = () => {
  const [count, setCount] = useState(0);
  const api = new ApiClient();

  useEffect(() => {
    // Fetch initial count of pending orders
    api
      .get('/orders/pending/count')
      .then((response) => {
        setCount(response.data.data.count);
      })
      .catch((error) =>
        console.error('Error fetching pending order count:', error)
      );

    // Connect to the Socket.IO server
    // Make sure the URL points to your backend server
    const socket = io('http://localhost:5000', {
      transports: ['websocket'],
      withCredentials: true,
    });

    socket.on('connect', () => {
      console.log('AdminJS Socket.IO Connected');
      socket.emit('joinAdminDashboard');
    });

    const handleNewOrder = (data) => {
      setCount((prevCount) => prevCount + 1);
    };

    // Listen for new order events
    socket.on('newOrder', handleNewOrder);
    socket.on('newPrintOrder', handleNewOrder);
    socket.on('paymentVerified', handleNewOrder); // From payment controller

    // Cleanup on component unmount
    return () => {
      socket.off('newOrder', handleNewOrder);
      socket.off('newPrintOrder', handleNewOrder);
      socket.off('paymentVerified', handleNewOrder);
      socket.disconnect();
    };
  }, []);

  const ordersLink = '/admin/resources/Order?filters.status=pending';

  return (
    <div style={{ position: 'relative', margin: '0 16px' }}>
      <DropDown>
        <DropDown.Trigger>
          <Icon icon="Bell" size={24} color="gray100" />
          {count > 0 && (
            <Badge
              variant="danger"
              style={{ position: 'absolute', top: '-5px', right: '-5px' }}
            >
              {count}
            </Badge>
          )}
        </DropDown.Trigger>
        <DropDown.Content>
          {count > 0 ? (
            <DropDownItem as="a" href={ordersLink}>
              <Text>You have {count} new orders waiting for approval.</Text>
            </DropDownItem>
          ) : (
            <DropDownItem>
              <Text>No new notifications.</Text>
            </DropDownItem>
          )}
        </DropDown.Content>
      </DropDown>
    </div>
  );
};

export default NotificationBell;
