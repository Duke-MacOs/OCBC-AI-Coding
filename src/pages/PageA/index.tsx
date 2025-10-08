import React, { useState, useCallback } from 'react';
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
import styles from './styles.module.css';

const { Dragger } = Upload;
const { Title } = Typography;

const PageA: React.FC<PageAProps> = () => {
  // 状态管理
  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([]);
  const [contractList, setContractList] = useState<ContractData[]>([
    {
      id: '1',
      contractName: '供应商合同A.pdf',
      createTime: '2024-01-15',
      status: 'active',
      fileUrl: '/files/contract-a.pdf',
      description: '供应商服务合同'
    },
    {
      id: '2',
      contractName: '客户合同B.docx',
      createTime: '2024-01-10',
      status: 'active',
      fileUrl: '/files/contract-b.docx',
      description: '客户服务协议'
    },
    {
      id: '3',
      contractName: '租赁合同C.pdf',
      createTime: '2024-01-05',
      status: 'inactive',
      fileUrl: '/files/contract-c.pdf',
      description: '办公室租赁合同'
    }
  ]);
  const [loading, setLoading] = useState(false);

  // 处理文件上传变化
  function handleUploadChange(info: any) {
    const { status } = info.file;
    
    if (status !== 'uploading') {
      console.log(info.file, info.fileList);
    }
    
    if (status === 'done') {
      message.success(`${info.file.name} 文件上传成功`);
      // 模拟添加到合同列表
      const newContract: ContractData = {
        id: Date.now().toString(),
        contractName: info.file.name,
        createTime: new Date().toISOString().split('T')[0],
        status: 'active',
        fileUrl: info.file.response?.url || '#',
        description: '新上传的合同文件'
      };
      setContractList(prev => [newContract, ...prev]);
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
      title: '合同名称',
      dataIndex: 'contractName',
      key: 'contractName',
      width: '70%',
      render: (text: string, record: ContractData) => (
        <Space>
          <FileTextOutlined style={{ color: '#1890ff' }} />
          <span>{text}</span>
          {record.status === 'inactive' && (
            <span style={{ color: '#999', fontSize: '12px' }}>(已停用)</span>
          )}
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: '30%',
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
    message.info(`查看合同: ${record.contractName}`);
    // 这里可以实现文件预览或跳转到详情页
    if (record.fileUrl && record.fileUrl !== '#') {
      window.open(record.fileUrl, '_blank');
    }
  }, []);

  const handleEdit = useCallback((record: ContractData) => {
    message.info(`编辑合同: ${record.contractName}`);
    // 这里可以实现编辑功能，比如打开编辑弹窗
  }, []);

  const handleDelete = useCallback((record: ContractData) => {
    setLoading(true);
    // 模拟删除操作
    setTimeout(() => {
      setContractList(prev => prev.filter(item => item.id !== record.id));
      message.success(`已删除合同: ${record.contractName}`);
      setLoading(false);
    }, 1000);
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
    </div>
  );
};

export default PageA;
