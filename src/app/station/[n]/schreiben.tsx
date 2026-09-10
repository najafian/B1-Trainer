import { useLocalSearchParams } from 'expo-router';

import { WritingScreen } from '@/modules/content/1-presentation/controller/writing-screen';

export default function WritingRoute() {
  const { n } = useLocalSearchParams<{ n: string }>();
  return <WritingScreen station={Number(n)} />;
}
