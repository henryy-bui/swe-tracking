import React from 'react';
import ReactDOM from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import App from '@/App';
import Overview from '@/pages/Overview';
import Weeks from '@/pages/Weeks';
import WeekDetail from '@/pages/WeekDetail';
import StudyLog from '@/pages/StudyLog';
import FollowUps from '@/pages/FollowUps';
import Problems from '@/pages/Problems';
import Milestones from '@/pages/Milestones';
import Today from '@/pages/Today';
import Projects from '@/pages/Projects';
import Resources from '@/pages/Resources';
import Settings from '@/pages/Settings';
import { initSync } from '@/store/sync';
import '@/styles.css';

initSync();

const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Overview /> },
      { path: 'today', element: <Today /> },
      { path: 'weeks', element: <Weeks /> },
      { path: 'weeks/:n', element: <WeekDetail /> },
      { path: 'log', element: <StudyLog /> },
      { path: 'followups', element: <FollowUps /> },
      { path: 'dsa', element: <Problems /> },
      { path: 'milestones', element: <Milestones /> },
      { path: 'projects', element: <Projects /> },
      { path: 'resources', element: <Resources /> },
      { path: 'settings', element: <Settings /> },
      { path: '*', element: <Overview /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
