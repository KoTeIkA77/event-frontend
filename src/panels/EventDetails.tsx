import { useState, useEffect } from 'react';
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

export const EventDetails = ({ id, eventId }: { id: string; eventId: string | null }) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [ticketCode, setTicketCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    if (!eventId) return;
    Promise.all([
      api.get<Event[]>('/events').then(res => res.data.find((e) => e.id === Number(eventId))),
      api.get<{ ticketCode: string | null }>(`/events/${eventId}/my-ticket`).then(res => res.data.ticketCode)
    ]).then(([ev, ticket]) => {
      setEvent(ev || null);
      setTicketCode(ticket);
    }).catch(console.error).finally(() => setLoading(false));
  }, [eventId]);

  const handleRegister = async () => {
    if (!eventId) return;
    setRegistering(true);
    try {
      const res = await api.post<{ ticketCode: string }>(`/events/${eventId}/register`);
      setTicketCode(res.data.ticketCode);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Не удалось записаться');
    } finally {
      setRegistering(false);
    }
  };

  const handleBack = () => {
    window.location.hash = '#/';
  };

  if (loading) {
    return (
      <Panel id={id}>
        <PanelHeader before={<PanelHeaderBack onClick={handleBack} />}>
          Загрузка...
        </PanelHeader>
        <Div>Загрузка...</Div>
      </Panel>
    );
  }

  if (!event) {
    return (
      <Panel id={id}>
        <PanelHeader before={<PanelHeaderBack onClick={handleBack} />}>
          Ошибка
        </PanelHeader>
        <Div>Мероприятие не найдено</Div>
      </Panel>
    );
  }

  return (
    <Panel id={id}>
      <PanelHeader before={<PanelHeaderBack onClick={handleBack} />}>
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