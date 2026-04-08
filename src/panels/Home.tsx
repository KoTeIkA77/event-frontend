import React, { useState, useEffect } from 'react';
import {
  Panel,
  PanelHeader,
  Group,
  SimpleCell,
  Div,
  Button,
  Header,
} from '@vkontakte/vkui';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import api from '../api/client';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  max_participants: number | null;
}

export const Home = ({ id }: { id: string }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const routeNavigator = useRouteNavigator();

  useEffect(() => {
    api.get('/events')
      .then(res => setEvents(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Panel id={id}>
      <PanelHeader>Мероприятия MAX</PanelHeader>
      <Group header={<Header>Ближайшие события</Header>}>
        {loading && <Div>Загрузка...</Div>}
        {!loading && events.length === 0 && (
          <Div>Пока нет мероприятий. Создайте первое!</Div>
        )}
        {events.map(event => (
          <SimpleCell
            key={event.id}
            subtitle={`${new Date(event.date).toLocaleString()} · ${event.location || 'Онлайн'}`}
            onClick={() => routeNavigator.push(`/event/${event.id}`)}
            chevron="auto"
          >
            {event.title}
          </SimpleCell>
        ))}
      </Group>
      <Div>
        <Button
          size="l"
          stretched
          onClick={() => routeNavigator.push('/create-event')}
        >
          + Создать мероприятие
        </Button>
      </Div>
    </Panel>
  );
};