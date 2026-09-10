import { useLocalSearchParams } from 'expo-router';

import { ReadingScreen } from '@/modules/content/1-presentation/controller/reading-screen';

export default function ReadingRoute() {
  const { n } = useLocalSearchParams<{ n: string }>();
  return <ReadingScreen station={Number(n)} />;
}
