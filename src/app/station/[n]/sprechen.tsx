import { useLocalSearchParams } from 'expo-router';

import { PictureScreen } from '@/modules/content/1-presentation/controller/picture-screen';

/** The Sprechen line's exercise is the exam's picture description. */
export default function SpeakingRoute() {
  const { n } = useLocalSearchParams<{ n: string }>();
  return <PictureScreen station={Number(n)} />;
}
