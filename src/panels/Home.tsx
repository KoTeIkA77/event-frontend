import { useState, useEffect } from 'react';
import { Panel, PanelHeader, Group, SimpleCell, Div, Button, Header, Counter } from '@vkontakte/vkui';
import api from '../api/client';

interface EcoAction {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  max_participants: number | null;
  points_per_participant: number;
  participants_count: number;
}

export const Home = ({ id }: { id: string }) => {
  const [actions, setActions] = useState<EcoAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/actions')
      .then(res => setActions(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Panel id={id}>
      <PanelHeader>ЭкоДесант 🌿</PanelHeader>
      <Group header={<Header>Ближайшие акции</Header>}>
        {loading && <Div>Загрузка...</Div>}
        {!loading && actions.length === 0 && (
          <Div>Пока нет акций. Создайте первую!</Div>
        )}
        {actions.map(action => (
          <SimpleCell
            key={action.id}
            subtitle={`${new Date(action.date).toLocaleString()} · ${action.location || 'Онлайн'}`}
            onClick={() => { window.location.hash = `#/action/${action.id}`; }}
            chevron="auto"
            after={
              <Counter mode="primary" size="s">
                {action.participants_count || 0}
              </Counter>
            }
          >
            {action.title}
          </SimpleCell>
        ))}
      </Group>
      <Div>
        <Button size="l" stretched onClick={() => { window.location.hash = '#/create-action'; }}>
          + Создать акцию
        </Button>
      </Div>
    </Panel>
  );
};