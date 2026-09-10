import { useLocalSearchParams } from 'expo-router';

import { StationScreen } from '@/modules/curriculum/1-presentation/controller/station-screen';

export default function StationRoute() {
  const { n } = useLocalSearchParams<{ n: string }>();
  return <StationScreen station={Number(n)} />;
}
