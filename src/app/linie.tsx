import { LinieMapScreen } from '@/modules/curriculum/1-presentation/controller/linie-map-screen';

/**
 * Expo Router owns this path, so the route file stays a thin shell: it renders
 * the module's controller and holds no logic of its own.
 */
export default function LinieRoute() {
  return <LinieMapScreen />;
}
