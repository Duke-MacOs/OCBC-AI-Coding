import React from 'react';
import { Typography, Space, Button, Table } from 'antd';

const { Title, Text } = Typography;

const ContractDetail: React.FC = () => {
  // 占位：后续从接口或路由参数获取合同信息
  const contractName = '示例合同名称';

  // 预提时间表表头（保持 Antd 默认样式）
  const columns = [
    { title: '预提时间', dataIndex: 'prepaymentDate', key: 'prepaymentDate' },
    { title: '入账时间', dataIndex: 'accountingDate', key: 'accountingDate' },
    { title: '金额', dataIndex: 'amount', key: 'amount' },
    { title: '备注', dataIndex: 'remark', key: 'remark' },
    { title: '操作', key: 'action' },
  ];

  // 空数据源
  const dataSource: any[] = [];

  // 按钮事件占位（后续接入具体交互）
  const onViewContract = () => console.log('查看合同信息');
  const onViewAccrualEntries = () => console.log('查看预提会计分录');
  const onViewPaymentEntries = () => console.log('查看付款会计分录');

  return (
    <div style={{ padding: 24 }}>
      <Title level={4} style={{ marginBottom: 16 }}>合同详情</Title>

      <div style={{ marginBottom: 12 }}>
        <Text>合同名称：{contractName}</Text>
      </div>

      <Space size="middle" style={{ marginBottom: 16 }} wrap>
        <Button type="primary" onClick={onViewContract}>查看合同信息</Button>
        <Button type="primary" onClick={onViewAccrualEntries}>查看预提会计分录</Button>
        <Button type="primary" onClick={onViewPaymentEntries}>查看付款会计分录</Button>
      </Space>

      <Table
        rowKey={(r) => `${r.prepaymentDate || ''}-${r.accountingDate || ''}-${r.amount || ''}`}
        columns={columns as any}
        dataSource={dataSource}
        pagination={false}
      />
    </div>
  );
};

export default ContractDetail;
