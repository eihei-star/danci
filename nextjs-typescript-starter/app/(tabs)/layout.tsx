import { TabBar } from 'app/components/tab-bar';

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pb-[calc(3.5rem+env(safe-area-inset-bottom))]">
      {children}
      <TabBar />
    </div>
  );
}