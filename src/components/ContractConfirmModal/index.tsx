import React, { useState, useCallback, useMemo } from 'react';
import { Modal, Button, message } from 'antd';
import { EditableProTable } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
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
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);

  // 生成新的ID
  const generateId = useCallback(() => {
    return `prepayment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // 第五步核心功能：新增行功能
  const handleAddRow = useCallback(() => {
    const newId = generateId();
    const newRow: PrepaymentItem = {
      id: newId,
      prepaymentDate: '',
      accountingDate: '',
      amount: 0,
    };
    
    setDataSource(prev => [...prev, newRow]);
    setEditableRowKeys(prev => [...prev, newId]);
    message.success('已添加新行，请填写相关信息');
  }, [generateId]);

  // 第五步核心功能：删除行功能
  const handleDeleteRow = useCallback((record: PrepaymentItem) => {
    setDataSource(prev => prev.filter(item => item.id !== record.id));
    setEditableRowKeys(prev => prev.filter(key => key !== record.id));
    message.success('删除成功');
  }, []);

  // 第五步核心功能：批量删除选中行
  const handleBatchDelete = useCallback((selectedRows: PrepaymentItem[]) => {
    const selectedIds = selectedRows.map(row => row.id);
    setDataSource(prev => prev.filter(item => !selectedIds.includes(item.id)));
    setEditableRowKeys(prev => prev.filter(key => !selectedIds.includes(key as string)));
    message.success(`已删除 ${selectedRows.length} 行数据`);
  }, []);

  // 表格列配置（前4步的基础功能 + 第五步的删除操作列）
  const columns: ProColumns<PrepaymentItem>[] = useMemo(() => [
    {
      title: '预提时间',
      dataIndex: 'prepaymentDate',
      key: 'prepaymentDate',
      valueType: 'date',
      width: 150,
      formItemProps: {
        rules: [
          {
            required: true,
            message: '请选择预提时间',
          },
        ],
      },
      fieldProps: {
        format: 'YYYY-MM-DD',
      },
    },
    {
      title: '入账时间',
      dataIndex: 'accountingDate',
      key: 'accountingDate',
      valueType: 'date',
      width: 150,
      formItemProps: {
        rules: [
          {
            required: true,
            message: '请选择入账时间',
          },
        ],
      },
      fieldProps: {
        format: 'YYYY-MM-DD',
      },
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      valueType: 'money',
      width: 150,
      formItemProps: {
        rules: [
          {
            required: true,
            message: '请输入金额',
          },
          {
            type: 'number',
            min: 0.01,
            message: '金额必须大于0',
          },
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
      width: 100,
      render: (text, record, _, action) => [
        <Button
          key="delete"
          type="link"
          size="small"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteRow(record)}
          className={styles.deleteButton}
        >
          删除
        </Button>,
      ],
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
      newData.splice(index, 1, {
        ...item,
        ...record,
      });
      setDataSource(newData);
    }
  }, [dataSource]);

  // 确认按钮处理
  const handleConfirm = useCallback(() => {
    // 验证所有行数据是否完整
    const invalidRows = dataSource.filter(item => 
      !item.prepaymentDate || !item.accountingDate || !item.amount || item.amount <= 0
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
    setEditableRowKeys([]);
    onCancel();
  }, [prepaymentData, onCancel]);

  // 处理表格数据变化的包装函数
  const handleDataSourceChange = useCallback((value: readonly PrepaymentItem[]) => {
    // 将只读数组转换为可变数组
    setDataSource([...value]);
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
            recordCreatorProps={false} // 禁用默认的新增按钮，使用自定义按钮
            editable={{
              type: 'multiple',
              editableKeys,
              onSave: handleSave,
              onChange: setEditableRowKeys,
            }}
            toolBarRender={() => [
              // 第五步核心功能：新增行按钮
              <Button
                key="add"
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddRow}
                className={styles.addButton}
              >
                新增行
              </Button>,
            ]}
            tableAlertRender={({ selectedRowKeys, selectedRows, onCleanSelected }) => (
              <span>
                已选择 {selectedRowKeys.length} 项
                <Button
                  type="link"
                  size="small"
                  onClick={onCleanSelected}
                  style={{ marginLeft: 8 }}
                >
                  取消选择
                </Button>
                {selectedRowKeys.length > 0 && (
                  <Button
                    type="link"
                    size="small"
                    danger
                    onClick={() => handleBatchDelete(selectedRows)}
                    style={{ marginLeft: 8 }}
                  >
                    批量删除
                  </Button>
                )}
              </span>
            )}
            rowSelection={{
              type: 'checkbox',
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
