import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
  // 表格数据状态管理
  const [dataSource, setDataSource] = useState<PrepaymentItem[]>(prepaymentData);
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>(
    prepaymentData.map(i => String(i.id ?? ''))
  );

  // 监听 prepaymentData 变化，同步更新内部状态
  useEffect(() => {
    setDataSource(prepaymentData);
    setEditableRowKeys(prepaymentData.map(i => String(i.id ?? '')));
  }, [prepaymentData]);

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

  // 表格列配置（摊销明细）
  const columns: ProColumns<PrepaymentItem>[] = useMemo(() => [
    {
      title: '预提/摊销期间',
      dataIndex: 'amortizationPeriod',
      key: 'amortizationPeriod',
      valueType: 'text',
      width: 150,
      formItemProps: {
        rules: [
          { required: true, message: '请输入预提/摊销期间' },
        ],
      },
      render: (_: any, record: PrepaymentItem) => (record.amortizationPeriod || ''),
    },
    {
      title: '入账期间',
      dataIndex: 'accountingPeriod',
      key: 'accountingPeriod',
      valueType: 'text',
      width: 150,
      formItemProps: {
        rules: [
          { required: true, message: '请输入入账期间' },
        ],
      },
      render: (_: any, record: PrepaymentItem) => (record.accountingPeriod || ''),
    },
    {
      title: '摊销金额',
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
      render: (_: any, record: PrepaymentItem) => `¥${record.amount.toFixed(2)}`,
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
    const invalidRows = dataSource.filter(item => 
      !item.amortizationPeriod || !item.accountingPeriod || !item.amount || item.amount <= 0
    );

    if (invalidRows.length > 0) {
      message.error('请完善所有行的数据信息');
      return;
    }
    onConfirm(dataSource);
  }, [dataSource, onConfirm]);

  // 取消按钮处理
  const handleCancel = useCallback(() => {
    // 重置数据到初始状态
    setDataSource(prepaymentData);
    setEditableRowKeys(prepaymentData.map(i => String(i.id ?? '')));
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
        {/* 合同信息部分 */}
        {contractInfo && (
          <div className={styles.contractInfo}>
            <div className={styles.infoRow}>
              <span className={styles.label}>合同附件名称：</span>
              <span className={styles.value}>{contractInfo.attachmentName}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>供应商名称：</span>
              <span className={styles.value}>{contractInfo.vendorName}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>合同总金额：</span>
              <span className={styles.value}>¥{contractInfo.totalAmount.toFixed(2)}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>合同期限：</span>
              <span className={styles.value}>{contractInfo.startDate} 至 {contractInfo.endDate}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>税率：</span>
              <span className={styles.value}>{(contractInfo.taxRate * 100).toFixed(2)}%</span>
            </div>
          </div>
        )}

        {/* 摊销明细表部分 */}
        <div className={styles.prepaymentTable}>
          <EditableProTable<PrepaymentItem>
            rowKey="id"
            headerTitle="摊销明细表"
            columns={columns}
            value={dataSource}
            onChange={handleDataSourceChange}
            // 使用内置新增入口，显示在表格底部
            recordCreatorProps={{
              position: 'bottom',
              record: () => ({
                id: generateId() as any,
                amortizationPeriod: '',
                accountingPeriod: '',
                amount: 0,
                status: 'PENDING',
              } as PrepaymentItem),
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
