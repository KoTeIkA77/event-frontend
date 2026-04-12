import { useState, useEffect } from 'react';
import {
  Panel,
  PanelHeader,
  Group,
  SimpleCell,
  Div,
  Button,
  Header,
  Counter,
} from '@vkontakte/vkui';
import bridge from '@vkontakte/vk-bridge'; // или MAX bridge
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
  const [isOrganizer, setIsOrganizer] = useState(false);

  useEffect(() => {
    // Загружаем список акций
    api.get('/actions')
      .then(res => setActions(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));

    // Проверяем роль пользователя (организатор или нет)
    api.get('/actions/my-role')
      .then(res => setIsOrganizer(res.data.role === 'organizer'))
      .catch(() => setIsOrganizer(false));
  }, []);

  const handleScanTicket = async () => {
    try {
      const data = await bridge.send('VKWebAppOpenCodeReader');
      if (data.code_data) {
        const res = await api.post('/actions/verify-ticket', {
          ticketCode: data.code_data,
        });
        alert(`✅ Участник подтверждён! Начислено ${res.data.points} эко-баллов.`);
      }
    } catch (err) {
      console.error('Сканирование отменено или ошибка:', err);
    }
  };

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
        <Button
          size="l"
          stretched
          onClick={() => { window.location.hash = '#/create-action'; }}
        >
          + Создать акцию
        </Button>
      </Div>
      {isOrganizer && (
        <Div>
          <Button
            size="l"
            stretched
            mode="secondary"
            onClick={handleScanTicket}
          >
            📷 Сканировать билет участника
          </Button>
        </Div>
      )}
    </Panel>
  );
};