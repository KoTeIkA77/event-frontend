import { useState, useEffect } from 'react';
import {
  Panel,
  PanelHeader,
  PanelHeaderBack,
  Group,
  Div,
  Button,
  FormItem,
  Input,
  Header,
  SimpleCell,
  Text,
  Select,
} from '@vkontakte/vkui';
import api from '../api/client';

interface InventoryItem {
  id: number;
  name: string;
  total_quantity: number;
  available_quantity: number;
}

interface Participant {
  participation_id: number;
  vk_id: number;
  name: string;
}

export const InventoryManager = ({ id, actionId, onBack }: { id: string; actionId: string; onBack: () => void }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newName, setNewName] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [issuing, setIssuing] = useState(false);

  const [selectedParticipantId, setSelectedParticipantId] = useState<number | null>(null);
  const [selectedInventoryId, setSelectedInventoryId] = useState<number | null>(null);
  const [issueQuantity, setIssueQuantity] = useState('1');

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/actions/${actionId}/inventory`);
      setInventory(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async () => {
    try {
      const res = await api.get(`/actions/${actionId}/participants`);
      setParticipants(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchParticipants();
  }, [actionId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      await api.post(`/actions/${actionId}/inventory`, {
        name: newName,
        total_quantity: parseInt(newQuantity),
      });
      setNewName('');
      setNewQuantity('');
      fetchInventory();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Ошибка добавления');
    } finally {
      setAdding(false);
    }
  };

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParticipantId || !selectedInventoryId) {
      alert('Выберите участника и инвентарь');
      return;
    }
    const quantity = parseInt(issueQuantity);
    if (quantity <= 0) {
      alert('Количество должно быть положительным');
      return;
    }
    setIssuing(true);
    try {
      await api.post(`/actions/${actionId}/inventory/issue`, {
        participation_id: selectedParticipantId,
        inventory_id: selectedInventoryId,
        quantity,
      });
      alert('Инвентарь успешно выдан');
      setSelectedParticipantId(null);
      setSelectedInventoryId(null);
      setIssueQuantity('1');
      fetchInventory();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Ошибка выдачи');
    } finally {
      setIssuing(false);
    }
  };

  const handleDownloadReport = async () => {
    try {
      const res = await api.get(`/actions/${actionId}/report`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `action_${actionId}_report.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      alert('Ошибка скачивания отчёта');
    }
  };

  // Формируем опции для Select
  const participantOptions = participants.map(p => ({
    label: p.name || `ID ${p.vk_id}`,
    value: p.participation_id,
  }));

  const inventoryOptions = inventory
    .filter(i => i.available_quantity > 0)
    .map(i => ({
      label: `${i.name} (доступно ${i.available_quantity})`,
      value: i.id,
    }));

  return (
    <Panel id={id}>
      <PanelHeader before={<PanelHeaderBack onClick={onBack} />}>
        Инвентарь акции
      </PanelHeader>

      <Group header={<Header>Скачать отчёт</Header>}>
        <Div>
          <Button size="l" stretched onClick={handleDownloadReport}>
            📊 Скачать CSV-отчёт по участникам
          </Button>
        </Div>
      </Group>

      <Group header={<Header>Выдать инвентарь участнику</Header>}>
        <form onSubmit={handleIssue}>
          <FormItem top="Участник">
            <Select
              value={selectedParticipantId ?? undefined}
              onChange={(e) => setSelectedParticipantId(Number(e.target.value))}
              placeholder="Выберите участника"
              options={participantOptions}
            />
          </FormItem>
          <FormItem top="Инвентарь">
            <Select
              value={selectedInventoryId ?? undefined}
              onChange={(e) => setSelectedInventoryId(Number(e.target.value))}
              placeholder="Выберите инвентарь"
              options={inventoryOptions}
            />
          </FormItem>
          <FormItem top="Количество">
            <Input
              type="number"
              value={issueQuantity}
              onChange={(e) => setIssueQuantity(e.target.value)}
              min="1"
              required
            />
          </FormItem>
          <Div>
            <Button size="l" stretched type="submit" loading={issuing}>
              Выдать инвентарь
            </Button>
          </Div>
        </form>
      </Group>

      <Group header={<Header>Добавить инвентарь</Header>}>
        <form onSubmit={handleAdd}>
          <FormItem top="Название">
            <Input value={newName} onChange={e => setNewName(e.target.value)} required />
          </FormItem>
          <FormItem top="Количество">
            <Input type="number" value={newQuantity} onChange={e => setNewQuantity(e.target.value)} required />
          </FormItem>
          <Div>
            <Button size="l" stretched type="submit" loading={adding}>Добавить</Button>
          </Div>
        </form>
      </Group>

      <Group header={<Header>Текущий инвентарь</Header>}>
        {loading && <Div>Загрузка...</Div>}
        {!loading && inventory.length === 0 && <Div>Инвентарь не добавлен</Div>}
        {inventory.map((item: InventoryItem) => (
          <SimpleCell key={item.id}>
            <Text weight="2">{item.name}</Text>
            <Text style={{ marginTop: 4 }}>Всего: {item.total_quantity} | Доступно: {item.available_quantity}</Text>
          </SimpleCell>
        ))}
      </Group>
    </Panel>
  );
};