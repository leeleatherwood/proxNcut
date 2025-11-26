import { ReactNode } from 'react';

export default function DashboardLayout({
  left,
  center,
  right
}: {
  left: ReactNode;
  center: ReactNode;
  right: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[420px_1fr_300px] h-screen w-screen overflow-hidden">
      <aside className="h-full overflow-hidden">
        {left}
      </aside>
      <main className="h-full overflow-hidden relative">
        {center}
      </main>
      <aside className="h-full overflow-hidden">
        {right}
      </aside>
    </div>
  );
}
