import { useState } from 'react';
import {
  Panel, PanelHeader, PanelHeaderBack, Group, FormItem, Input, Textarea, Button, Div
} from '@vkontakte/vkui';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import api from '../api/client';

export const CreateEvent = ({ id }: { id: string }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [loading, setLoading] = useState(false);
  const routeNavigator = useRouteNavigator();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/events', {
        title,
        description,
        date: new Date(date).toISOString(),
        location,
        max_participants: maxParticipants ? parseInt(maxParticipants) : null,
      });
      routeNavigator.back();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Ошибка создания');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Panel id={id}>
      <PanelHeader before={<PanelHeaderBack onClick={() => routeNavigator.back()} />}>
        Новое мероприятие
      </PanelHeader>
      <Group>
        <form onSubmit={handleSubmit}>
          <FormItem top="Название" required>
            <Input value={title} onChange={e => setTitle(e.target.value)} />
          </FormItem>
          <FormItem top="Описание">
            <Textarea value={description} onChange={e => setDescription(e.target.value)} />
          </FormItem>
          <FormItem top="Дата и время" required>
            <Input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} />
          </FormItem>
          <FormItem top="Место">
            <Input value={location} onChange={e => setLocation(e.target.value)} />
          </FormItem>
          <FormItem top="Макс. участников">
            <Input type="number" value={maxParticipants} onChange={e => setMaxParticipants(e.target.value)} placeholder="Без ограничений" />
          </FormItem>
          <Div>
            <Button size="l" stretched type="submit" loading={loading}>Опубликовать</Button>
          </Div>
        </form>
      </Group>
    </Panel>
  );
};