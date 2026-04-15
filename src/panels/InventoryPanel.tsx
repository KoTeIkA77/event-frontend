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
} from '@vkontakte/vkui';
import api from '../api/client';

interface InventoryItem {
  id: number;
  name: string;
  total_quantity: number;
  available_quantity: number;
}

export const InventoryPanel = ({ id, actionId, onBack }: { id: string; actionId: string; onBack: () => void }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [newName, setNewName] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

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

  useEffect(() => {
    fetchInventory();
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