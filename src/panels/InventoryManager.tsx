import { useState, useEffect } from 'react';
import {
  Panel,
  PanelHeader,
  PanelHeaderBack,
  Group,
  FormItem,
  Input,
  Button,
  Div,
  SimpleCell,
  Header,
  Counter,
} from '@vkontakte/vkui';
import api from '../api/client';

interface InventoryItem {
  id: number;
  name: string;
  quantity_required: number;
  quantity_promised: number;
}

export const InventoryManager = ({ id, actionId, onBack }: { id: string; actionId: string; onBack: () => void }) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [newName, setNewName] = useState('');
  const [newQty, setNewQty] = useState('1');
  const [loading, setLoading] = useState(false);

  const fetchItems = () => {
    api.get(`/inventory/action/${actionId}`).then(res => setItems(res.data)).catch(console.error);
  };

  useEffect(() => {
    fetchItems();
  }, [actionId]);

  const addItem = async () => {
    if (!newName) return;
    setLoading(true);
    try {
      await api.post(`/inventory/action/${actionId}`, {
        name: newName,
        quantity_required: parseInt(newQty) || 1,
      });
      setNewName('');
      setNewQty('1');
      fetchItems();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Ошибка добавления');
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (itemId: number) => {
    if (!confirm('Удалить предмет?')) return;
    try {
      await api.delete(`/inventory/item/${itemId}`);
      fetchItems();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Ошибка удаления');
    }
  };

  return (
    <Panel id={id}>
      <PanelHeader before={<PanelHeaderBack onClick={onBack} />}>
        Управление инвентарём
      </PanelHeader>
      <Group header={<Header>Добавить предмет</Header>}>
        <form onSubmit={(e) => { e.preventDefault(); addItem(); }}>
          <FormItem top="Название">
            <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Перчатки, мешки..." />
          </FormItem>
          <FormItem top="Количество">
            <Input type="number" value={newQty} onChange={e => setNewQty(e.target.value)} />
          </FormItem>
          <Div>
            <Button size="l" stretched onClick={addItem} loading={loading}>Добавить</Button>
          </Div>
        </form>
      </Group>
      <Group header={<Header>Текущий инвентарь</Header>}>
        {items.length === 0 && <Div>Нет предметов</Div>}
        {items.map(item => (
          <SimpleCell
            key={item.id}
            after={
              <>
                <Counter mode="primary" size="s">{item.quantity_promised}/{item.quantity_required}</Counter>
                <Button mode="tertiary" onClick={() => deleteItem(item.id)}>Удалить</Button>
              </>
            }
          >
            {item.name}
          </SimpleCell>
        ))}
      </Group>
    </Panel>
  );
};