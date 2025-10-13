import React, { useState, useCallback, useEffect } from 'react';
import { 
  Upload, 
  Table, 
  Button, 
  Space, 
  message, 
  Spin,
  Empty,
  Typography
} from 'antd';
import { 
  InboxOutlined, 
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';
import { PageAProps, ContractData } from './types';
import { getAllContracts } from '../../api';
import styles from './styles.module.css';
import ContractConfirmModal from '../../components/ContractConfirmModal';
import type { ContractInfo, PrepaymentItem } from '../../components/ContractConfirmModal/types';

const { Dragger } = Upload;
const { Title } = Typography;

const PageA: React.FC<PageAProps> = () => {
  // 状态管理
  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([]);
  const [contractList, setContractList] = useState<ContractData[]>([]);
  const [loading, setLoading] = useState(false);
  
  // 加载合同列表
  useEffect(() => {
    const fetchContracts = async () => {
      setLoading(true);
      try {
        const response = await getAllContracts();
        setContractList(response.contracts);
        message.success(response.message || '合同列表加载成功');
      } catch (error) {
        console.error('获取合同列表失败:', error);
        message.error('合同列表加载失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, []);
  
  // 合同确认弹窗：默认打开以便检查样式
  const [confirmVisible, setConfirmVisible] = useState<boolean>(false);
  const contractInfo: ContractInfo = {
    id: 'demo-1',
    name: '演示合同-样式检查',
  };
  const [prepaymentData, setPrepaymentData] = useState<PrepaymentItem[]>([
    {
      id: 'prepayment_1',
      prepaymentDate: '2024-01-01',
      accountingDate: '2024-01-31',
      amount: 1000,
    },
    {
      id: 'prepayment_2',
      prepaymentDate: '2024-02-01',
      accountingDate: '2024-02-28',
      amount: 2000,
    },
  ]);

  // 处理文件上传变化
  function handleUploadChange(info: any) {
    const { status } = info.file;
    
    if (status !== 'uploading') {
      console.log(info.file, info.fileList);
    }
    
    if (status === 'done') {
      message.success(`${info.file.name} 文件上传成功`);
      // 文件上传成功后，重新加载合同列表
      // TODO: 实际应该调用后端上传接口，然后刷新列表
    } else if (status === 'error') {
      message.error(`${info.file.name} 文件上传失败`);
    }
    
    setUploadedFiles(info.fileList);
  }

  // 处理拖拽放置
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    console.log('Dropped files', e.dataTransfer.files);
  }, []);

  // 表格列配置
  const columns: ColumnsType<ContractData> = [
    {
      title: '合同附件',
      dataIndex: 'attachmentName',
      key: 'attachmentName',
      width: '25%',
      render: (text: string) => (
        <Space>
          <FileTextOutlined style={{ color: '#1890ff' }} />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: '供应商',
      dataIndex: 'vendorName',
      key: 'vendorName',
      width: '15%',
    },
    {
      title: '合同金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: '12%',
      render: (amount: number) => `¥${amount.toFixed(2)}`,
    },
    {
      title: '合同期限',
      key: 'dateRange',
      width: '18%',
      render: (_, record: ContractData) => (
        <span>
          {record.startDate} 至 {record.endDate}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: '10%',
      render: (status: string) => (
        <span style={{ color: status === 'ACTIVE' ? '#52c41a' : '#999' }}>
          {status === 'ACTIVE' ? '激活' : '非激活'}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: '20%',
      render: (_, record: ContractData) => (
        <Space className={styles.actionButtons}>
          <Button 
            type="primary" 
            size="small"
            icon={<EyeOutlined />}
            className={styles.actionButton}
            onClick={() => handleView(record)}
          >
            查看
          </Button>
          <Button 
            size="small"
            icon={<EditOutlined />}
            className={styles.actionButton}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button 
            danger 
            size="small"
            icon={<DeleteOutlined />}
            className={styles.actionButton}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  // 操作处理函数
  const handleView = useCallback((record: ContractData) => {
    message.info(`查看合同: ${record.attachmentName}`);
    // TODO: 实现文件预览或跳转到详情页
  }, []);

  const handleEdit = useCallback((record: ContractData) => {
    message.info(`编辑合同: ${record.attachmentName}`);
    // TODO: 实现编辑功能，比如打开编辑弹窗
  }, []);

  const handleDelete = useCallback((record: ContractData) => {
    setLoading(true);
    // 模拟删除操作
    setTimeout(() => {
      setContractList(prev => prev.filter(item => item.contractId !== record.contractId));
      message.success(`已删除合同: ${record.attachmentName}`);
      setLoading(false);
    }, 1000);
  }, []);

  // 合同确认弹窗回调
  const handleConfirmModalConfirm = useCallback((data: PrepaymentItem[]) => {
    setPrepaymentData(data);
    message.success('合同确认已提交');
    setConfirmVisible(false);
  }, []);

  const handleConfirmModalCancel = useCallback(() => {
    setConfirmVisible(false);
  }, []);

    // 文件上传配置
    const uploadProps: UploadProps = {
        name: 'file',
        multiple: true,
        action: '/api/upload', // 这里应该是实际的上传接口
        accept: '.pdf,.doc,.docx,.txt,.xlsx,.xls',
        maxCount: 10,
        onChange: handleUploadChange,
        onDrop: handleDrop,
        fileList: uploadedFiles,
        showUploadList: {
          showDownloadIcon: true,
          showRemoveIcon: true,
          showPreviewIcon: true,
        },
      };

  return (
    <div className={styles.pageContainer}>
      {/* 区域A - 文件上传区域 */}
      <div className={styles.uploadArea}>
        <Dragger {...uploadProps} className={styles.uploadDragger}>
          <p className={styles.uploadIcon}>
            <InboxOutlined />
          </p>
          <p className={styles.uploadText}>
            点击或拖拽文件到此区域上传
          </p>
          <p className={styles.uploadHint}>
            支持单个或批量上传，支持 PDF、Word、Excel、TXT 格式
          </p>
        </Dragger>
      </div>

      {/* 区域B - 合同列表区域 */}
      <div className={styles.contractTableArea}>
        <div className={styles.tableContainer}>
          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={contractList}
              rowKey="id"
              pagination={false}
              locale={{
                emptyText: (
                  <div className={styles.emptyState}>
                    <FileTextOutlined className={styles.emptyIcon} />
                    <div className={styles.emptyText}>暂无合同数据</div>
                    <div className={styles.emptyHint}>请先上传合同文件</div>
                  </div>
                )
              }}
            />
            
          </Spin>
        </div>
      </div>
      {/* 合同确认弹窗（默认打开用于样式检查） */}
      <ContractConfirmModal
        visible={confirmVisible}
        contractInfo={contractInfo}
        prepaymentData={prepaymentData}
        onConfirm={handleConfirmModalConfirm}
        onCancel={handleConfirmModalCancel}
      />
    </div>
  );
};

export default PageA;
