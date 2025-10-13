import React, { useState, useCallback, useMemo } from 'react';
import { Modal, Button, message } from 'antd';
import { EditableProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { DeleteOutlined } from '@ant-design/icons';
import { ContractConfirmModalProps, PrepaymentItem, ContractInfo } from './types';
import styles from './styles.module.css';

const ContractConfirmModal: React.FC<ContractConfirmModalProps> = ({
  visible,
  contractInfo,
  prepaymentData,
  onConfirm,
  onCancel,
}) => {
  // 工具：通用格式化（不依赖第三方库）。
  // 若值为字符串直接返回；若是具有 format 方法的对象（例如日期类库实例），尝试调用其 format('YYYY-MM-DD')，否则返回空串。
  const formatDateValue = useCallback((v: any): string => {
    if (!v) return '';
    if (typeof v === 'string') return v;
    if (typeof v === 'object' && typeof (v as any).format === 'function') {
      try {
        return (v as any).format('YYYY-MM-DD');
      } catch {
        return '';
      }
    }
    return '';
  }, []);
  // 表格数据状态管理
  const [dataSource, setDataSource] = useState<PrepaymentItem[]>(prepaymentData);
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>(prepaymentData.map(i => i.id));

  // 生成新的ID
  const generateId = useCallback(() => {
    return `prepayment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // 新增行由 EditableProTable 内置的 recordCreatorProps 提供（显示在表格底部）

  // 第五步核心功能：删除行功能
  const handleDeleteRow = useCallback((record: PrepaymentItem) => {
    setDataSource(prev => prev.filter(item => item.id !== record.id));
    setEditableRowKeys(prev => prev.filter(key => key !== record.id));
    message.success('删除成功');
  }, []);

  // 已移除批量选择与批量删除功能

  // 表格列配置（前4步的基础功能 + 第五步的删除操作列）
  const columns: ProColumns<PrepaymentItem>[] = useMemo(() => [
    {
      title: '预提时间',
      dataIndex: 'prepaymentDate',
      key: 'prepaymentDate',
      valueType: 'text',
      width: 150,
      formItemProps: {
        rules: [
          { required: true, message: '请选择预提时间' },
        ],
      },
      render: (_: any, record: PrepaymentItem) => (record.prepaymentDate || ''),
      renderFormItem: (_: any, { value, onChange }: any) => (
        <input
          type="date"
          style={{ width: '100%', height: 32, padding: '4px 8px', boxSizing: 'border-box' }}
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange?.(e.target.value || '')}
        />
      ),
    },
    {
      title: '入账时间',
      dataIndex: 'accountingDate',
      key: 'accountingDate',
      valueType: 'text',
      width: 150,
      formItemProps: {
        rules: [
          { required: true, message: '请选择入账时间' },
        ],
      },
      render: (_: any, record: PrepaymentItem) => (record.accountingDate || ''),
      renderFormItem: (_: any, { value, onChange }: any) => (
        <input
          type="date"
          style={{ width: '100%', height: 32, padding: '4px 8px', boxSizing: 'border-box' }}
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange?.(e.target.value || '')}
        />
      ),
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      valueType: 'money',
      width: 150,
      formItemProps: {
        rules: [
          { required: true, message: '请输入金额' },
          { type: 'number', min: 0.01, message: '金额必须大于0' },
        ],
      },
      fieldProps: {
        precision: 2,
        min: 0,
        placeholder: '请输入金额',
      },
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      width: 120,
      render: (_text: any, record: PrepaymentItem) => (
        <Button
          size="small"
          type="primary"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteRow(record)}
        >
          删除
        </Button>
      ),
    },
  ], [handleDeleteRow]);

  // 数据保存处理
  const handleSave = useCallback(async (
    key: React.Key | React.Key[], 
    record: PrepaymentItem & { index?: number },
    _originRow?: PrepaymentItem & { index?: number }
  ) => {
    const newData = [...dataSource];
    // 处理单个key的情况
    const recordKey = Array.isArray(key) ? key[0] : key;
    const index = newData.findIndex(item => recordKey === item.id);
    
    if (index > -1) {
      const item = newData[index];
      // 直接合并保存（我们保持字符串日期）
      const merged: any = {
        ...item,
        ...record,
      };
      newData.splice(index, 1, merged);
      setDataSource(newData);
    }
  }, [dataSource]);

  // 确认按钮处理
  const handleConfirm = useCallback(() => {
    // 验证所有行数据是否完整
    const normalized = dataSource.map((row: any) => ({
      ...row,
      prepaymentDate: formatDateValue(row.prepaymentDate),
      accountingDate: formatDateValue(row.accountingDate),
    }));
    const invalidRows = normalized.filter(item => 
      !item.prepaymentDate || !item.accountingDate || !item.amount || item.amount <= 0
    );

    if (invalidRows.length > 0) {
      message.error('请完善所有行的数据信息');
      return;
    }
    onConfirm(normalized as PrepaymentItem[]);
  }, [dataSource, onConfirm, formatDateValue]);

  // 取消按钮处理
  const handleCancel = useCallback(() => {
    // 重置数据到初始状态
    setDataSource(prepaymentData);
    setEditableRowKeys(prepaymentData.map(i => i.id));
    onCancel();
  }, [prepaymentData, onCancel]);

  // 处理表格数据变化的包装函数
  const handleDataSourceChange = useCallback((value: readonly PrepaymentItem[]) => {
    // 将只读数组转换为可变数组，不做字符串化，保持编辑兼容
    const next = [...value] as any[];
    setDataSource(next as PrepaymentItem[]);
    // 自动使新行进入可编辑状态
    const ids = next.map(i => i.id as React.Key);
    setEditableRowKeys(prev => {
      const set = new Set(prev);
      let changed = false;
      ids.forEach(id => {
        if (!set.has(id)) {
          set.add(id);
          changed = true;
        }
      });
      return changed ? Array.from(set) : prev;
    });
  }, []);

  return (
    <Modal
      title="合同确认"
      open={visible}
      width={800}
      maskClosable={false}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          取消
        </Button>,
        <Button key="confirm" type="primary" onClick={handleConfirm}>
          确认
        </Button>,
      ]}
    >
      <div className={styles.modalContainer}>
        {/* 第二步：合同信息部分 */}
        <div className={styles.contractInfo}>
          <div className={styles.contractName}>
            合同名称：{contractInfo.name}
          </div>
        </div>

        {/* 第三步、第四步、第五步：预付时间表部分 */}
        <div className={styles.prepaymentTable}>
          <EditableProTable<PrepaymentItem>
            rowKey="id"
            headerTitle="预付时间表"
            columns={columns}
            value={dataSource}
            onChange={handleDataSourceChange}
            // 使用内置新增入口，显示在表格底部，符合官方文档样式
            recordCreatorProps={{
              position: 'bottom',
              record: () => ({
                id: generateId(),
                prepaymentDate: '',
                accountingDate: '',
                amount: 0,
              }),
            }}
            editable={{
              type: 'multiple',
              editableKeys,
              onSave: handleSave,
              onChange: setEditableRowKeys,
            }}
            pagination={false}
            scroll={{ x: 600 }}
            size="small"
          />
        </div>
      </div>
    </Modal>
  );
};
export default ContractConfirmModal;
