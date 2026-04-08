import React, { useState, useEffect } from 'react';
import {
  Panel,
  PanelHeader,
  PanelHeaderBack,
  Group,
  Div,
  Button,
  Title,
  Text,
  Header,
} from '@vkontakte/vkui';
import { useParams, useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import QRCode from 'react-qr-code';
import api from '../api/client';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  max_participants: number | null;
}

export const EventDetails = ({ id }: { id: string }) => {
  const params = useParams();
  const eventId = params?.eventId; // безопасное обращение
  const routeNavigator = useRouteNavigator();
  const [event, setEvent] = useState<Event | null>(null);
  const [ticketCode, setTicketCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    if (!eventId) {
      setLoading(false);
      return;
    }
    Promise.all([
      api.get('/events').then(res => res.data.find((e: Event) => e.id === Number(eventId))),
      api.get(`/events/${eventId}/my-ticket`).then(res => res.data.ticketCode)
    ]).then(([ev, ticket]) => {
      setEvent(ev || null);
      setTicketCode(ticket);
    }).catch(console.error).finally(() => setLoading(false));
  }, [eventId]);

  const handleRegister = async () => {
    if (!eventId) return;
    setRegistering(true);
    try {
      const res = await api.post(`/events/${eventId}/register`);
      setTicketCode(res.data.ticketCode);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Не удалось записаться');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <Panel id={id}>
        <PanelHeader before={<PanelHeaderBack onClick={() => routeNavigator.back()} />}>
          Загрузка...
        </PanelHeader>
        <Div>Загрузка...</Div>
      </Panel>
    );
  }

  if (!event) {
    return (
      <Panel id={id}>
        <PanelHeader before={<PanelHeaderBack onClick={() => routeNavigator.back()} />}>
          Ошибка
        </PanelHeader>
        <Div>Мероприятие не найдено</Div>
      </Panel>
    );
  }

  return (
    <Panel id={id}>
      <PanelHeader before={<PanelHeaderBack onClick={() => routeNavigator.back()} />}>
        {event.title}
      </PanelHeader>
      <Group>
        <Div>
          <Title level="1" weight="1">{event.title}</Title>
          <Text style={{ marginTop: 8, color: 'var(--vkui--color_text_secondary)' }}>
            {new Date(event.date).toLocaleString()}
          </Text>
          {event.location && <Text>📍 {event.location}</Text>}
          {event.max_participants && <Text>👥 Мест: {event.max_participants}</Text>}
        </Div>
        {event.description && <Div><Text>{event.description}</Text></Div>}
      </Group>

      <Group header={<Header>Ваш билет</Header>}>
        {ticketCode ? (
          <Div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <QRCode value={ticketCode} size={200} />
            <Text style={{ marginTop: 12 }}>Покажите этот код организатору</Text>
            <Text weight="2" style={{ wordBreak: 'break-all' }}>{ticketCode}</Text>
          </Div>
        ) : (
          <Div>
            <Button size="l" stretched onClick={handleRegister} loading={registering}>
              Записаться на мероприятие
            </Button>
          </Div>
        )}
      </Group>
    </Panel>
  );
};