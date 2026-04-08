import { useState, useEffect } from 'react';
import { AppRoot, SplitLayout, SplitCol, View } from '@vkontakte/vkui';
import { Home } from './panels/Home';
import { CreateEvent } from './panels/CreateEvent';
import { EventDetails } from './panels/EventDetails';
import '@vkontakte/vkui/dist/vkui.css';

const App = () => {
  const [activePanel, setActivePanel] = useState('home');
  const [eventId, setEventId] = useState<string | null>(null);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash.startsWith('/event/')) {
        const id = hash.split('/')[2];
        setEventId(id);
        setActivePanel('event-details');
      } else if (hash === '/create-event') {
        setActivePanel('create-event');
      } else {
        setActivePanel('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <AppRoot>
      <SplitLayout>
        <SplitCol>
          <View id="main" activePanel={activePanel}>
            <Home id="home" />
            <CreateEvent id="create-event" />
            <EventDetails id="event-details" eventId={eventId} />
          </View>
        </SplitCol>
      </SplitLayout>
    </AppRoot>
  );
};

export default App;