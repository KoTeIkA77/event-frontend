import { useState, useEffect } from 'react';
import { AppRoot, SplitLayout, SplitCol, View } from '@vkontakte/vkui';
import { Home } from './panels/Home';
import { CreateAction } from './panels/CreateAction';
import { ActionDetails } from './panels/ActionDetails';
import { InventoryManager } from './panels/InventoryManager';
import '@vkontakte/vkui/dist/vkui.css';

const App = () => {
  const [activePanel, setActivePanel] = useState('home');
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash.startsWith('/action/')) {
        const id = hash.split('/')[2];
        setActionId(id);
        setActivePanel('action-details');
      } else if (hash === '/create-action') {
        setActivePanel('create-action');
      } else if (hash.startsWith('/inventory/')) {
        const id = hash.split('/')[2];
        setActionId(id);
        setActivePanel('inventory-manager');
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
            <CreateAction id="create-action" />
            <ActionDetails id="action-details" actionId={actionId} />
            <InventoryManager
              id="inventory-manager"
              actionId={actionId || ''}
              onBack={() => { window.location.hash = `#/action/${actionId}`; }}
            />
          </View>
        </SplitCol>
      </SplitLayout>
    </AppRoot>
  );
};

export default App;