import { AppRoot, SplitLayout, SplitCol, View } from '@vkontakte/vkui';
import { RouterProvider, createHashRouter } from '@vkontakte/vk-mini-apps-router';
import { Home } from './panels/Home';
import { CreateEvent } from './panels/CreateEvent';
import { EventDetails } from './panels/EventDetails';
import '@vkontakte/vkui/dist/vkui.css';

const router = createHashRouter([
  { path: '/', panel: 'home', view: 'main' },
  { path: '/create-event', panel: 'create-event', view: 'main' },
  { path: '/event/:eventId', panel: 'event-details', view: 'main' },
]);

// Для отладки в консоли
(window as any).__vk_router__ = router;

const App = () => (
  <AppRoot>
    <SplitLayout>
      <SplitCol>
        <RouterProvider router={router}>
          <View id="main" activePanel="home">
            <Home id="home" />
            <CreateEvent id="create-event" />
            <EventDetails id="event-details" />
          </View>
        </RouterProvider>
      </SplitCol>
    </SplitLayout>
  </AppRoot>
);

export default App;