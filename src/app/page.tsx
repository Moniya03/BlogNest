import { App } from '@/components/App';

export default function Home() {
  // Force redeployment to pick up environment variables
  return <App />;
}
