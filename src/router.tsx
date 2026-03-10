import { createBrowserRouter } from 'react-router-dom';
import Layout from './pages/Layout';
import ServersPage from './pages/ServersPage';
import OAuth2ProvidersPage from './pages/OAuth2ProvidersPage';
import DestinationsPage from './pages/DestinationsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <ServersPage />,
      },
      {
        path: 'oauth2-providers',
        element: <OAuth2ProvidersPage />,
      },
      {
        path: 'destinations',
        element: <DestinationsPage />,
      },
    ],
  },
]);
