'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import LeftPanel from '@/components/panels/LeftPanel';
import CenterPanel from '@/components/panels/CenterPanel';
import RightPanel from '@/components/panels/RightPanel';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function Home() {
  return (
    <DashboardLayout
      left={
        <ErrorBoundary>
          <LeftPanel />
        </ErrorBoundary>
      }
      center={
        <ErrorBoundary>
          <CenterPanel />
        </ErrorBoundary>
      }
      right={
        <ErrorBoundary>
          <RightPanel />
        </ErrorBoundary>
      }
    />
  );
}
