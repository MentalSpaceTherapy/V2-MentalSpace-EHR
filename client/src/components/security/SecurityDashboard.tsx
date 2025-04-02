import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Table, Tag, Button, Modal, Input, DatePicker, Select, Alert, Spin, Card, Statistic, Row, Col } from 'antd';
import { SearchOutlined, CheckCircleOutlined, ExclamationCircleOutlined, WarningOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';

// Types for security audit logs
interface SecurityAuditLog {
  id: number;
  userId: number;
  username: string;
  action: string;
  ipAddress: string;
  timestamp: string;
  details: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  isResolved: boolean;
  resolvedBy?: number;
  resolvedAt?: string;
}

// Types for security statistics
interface SecurityStats {
  totalEvents: number;
  highSeverity: number;
  unresolvedEvents: number;
  loginFailures: number;
  ipAddressCount: number;
  recentFailedLogins: {
    username: string;
    count: number;
    lastAttempt: string;
  }[];
}

const SecurityDashboard: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<SecurityAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedLog, setSelectedLog] = useState<SecurityAuditLog | null>(null);
  const [stats, setStats] = useState<SecurityStats | null>(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    action: '',
    severity: '',
    username: '',
    startDate: null as moment.Moment | null,
    endDate: null as moment.Moment | null,
    isResolved: ''
  });
  
  // Fetch audit logs
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'administrator') {
      setError('You do not have permission to access this page.');
      setLoading(false);
      return;
    }
    
    const fetchAuditLogs = async () => {
      try {
        setLoading(true);
        
        // Fetch security logs
        const response = await axios.get('/api/security/audit-logs');
        setAuditLogs(response.data);
        setFilteredLogs(response.data);
        
        // Fetch security statistics
        const statsResponse = await axios.get('/api/security/stats');
        setStats(statsResponse.data);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load security audit logs.');
        setLoading(false);
      }
    };
    
    fetchAuditLogs();
  }, [isAuthenticated, user]);
  
  // Apply filters
  useEffect(() => {
    let result = [...auditLogs];
    
    if (filters.action) {
      result = result.filter(log => log.action === filters.action);
    }
    
    if (filters.severity) {
      result = result.filter(log => log.severity === filters.severity);
    }
    
    if (filters.username) {
      result = result.filter(log => 
        log.username.toLowerCase().includes(filters.username.toLowerCase())
      );
    }
    
    if (filters.startDate) {
      result = result.filter(log => 
        moment(log.timestamp).isAfter(filters.startDate)
      );
    }
    
    if (filters.endDate) {
      result = result.filter(log => 
        moment(log.timestamp).isBefore(filters.endDate)
      );
    }
    
    if (filters.isResolved) {
      const isResolved = filters.isResolved === 'resolved';
      result = result.filter(log => log.isResolved === isResolved);
    }
    
    setFilteredLogs(result);
  }, [filters, auditLogs]);
  
  // Handle resolving an audit log
  const handleResolveLog = async (logId: number) => {
    try {
      await axios.post(`/api/security/audit-logs/${logId}/resolve`);
      
      // Update the log in the local state
      setAuditLogs(prevLogs => 
        prevLogs.map(log => 
          log.id === logId 
            ? { ...log, isResolved: true, resolvedBy: user?.id, resolvedAt: new Date().toISOString() } 
            : log
        )
      );
      
      // Close modal if open
      if (selectedLog?.id === logId) {
        setSelectedLog({ 
          ...selectedLog, 
          isResolved: true, 
          resolvedBy: user?.id, 
          resolvedAt: new Date().toISOString() 
        });
      }
    } catch (err) {
      setError('Failed to resolve the audit log.');
    }
  };
  
  // Handle viewing log details
  const handleViewDetails = (log: SecurityAuditLog) => {
    setSelectedLog(log);
    setDetailsModalVisible(true);
  };
  
  // Render security severity tag
  const renderSeverityTag = (severity: string) => {
    switch (severity) {
      case 'HIGH':
        return <Tag color="red">High</Tag>;
      case 'MEDIUM':
        return <Tag color="orange">Medium</Tag>;
      case 'LOW':
        return <Tag color="green">Low</Tag>;
      default:
        return <Tag color="blue">{severity}</Tag>;
    }
  };
  
  // Table columns
  const columns = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (text: string) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
      sorter: (a: SecurityAuditLog, b: SecurityAuditLog) => 
        moment(a.timestamp).valueOf() - moment(b.timestamp).valueOf(),
      defaultSortOrder: 'descend' as 'descend'
    },
    {
      title: 'User',
      dataIndex: 'username',
      key: 'username'
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action'
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      key: 'ipAddress'
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      render: (text: string) => renderSeverityTag(text)
    },
    {
      title: 'Status',
      key: 'status',
      render: (text: string, record: SecurityAuditLog) => (
        record.isResolved 
          ? <Tag color="success">Resolved</Tag> 
          : <Tag color="processing">Pending</Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text: string, record: SecurityAuditLog) => (
        <div>
          <Button 
            type="link" 
            onClick={() => handleViewDetails(record)}
          >
            View Details
          </Button>
          {!record.isResolved && (
            <Button 
              type="link" 
              onClick={() => handleResolveLog(record.id)}
            >
              Resolve
            </Button>
          )}
        </div>
      )
    }
  ];
  
  // Format details for display
  const formatDetails = (details: string) => {
    try {
      const parsed = JSON.parse(details);
      return (
        <ul>
          {Object.entries(parsed).map(([key, value]) => (
            <li key={key}>
              <strong>{key}:</strong> {String(value)}
            </li>
          ))}
        </ul>
      );
    } catch (e) {
      return details;
    }
  };
  
  // Render statistics cards
  const renderStatCards = () => {
    if (!stats) return null;
    
    return (
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Security Events"
              value={stats.totalEvents}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="High Severity Events"
              value={stats.highSeverity}
              valueStyle={{ color: stats.highSeverity > 0 ? '#cf1322' : '#3f8600' }}
              prefix={stats.highSeverity > 0 ? <ExclamationCircleOutlined /> : null}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Unresolved Events"
              value={stats.unresolvedEvents}
              valueStyle={{ color: stats.unresolvedEvents > 0 ? '#fa8c16' : '#3f8600' }}
              prefix={stats.unresolvedEvents > 0 ? <WarningOutlined /> : <CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Failed Logins (24h)"
              value={stats.loginFailures}
              valueStyle={{ color: stats.loginFailures > 10 ? '#cf1322' : '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>
    );
  };
  
  // Filters component
  const renderFilters = () => (
    <div className="mb-6 bg-gray-100 p-4 rounded">
      <Row gutter={16}>
        <Col span={6}>
          <Input
            placeholder="Username"
            prefix={<SearchOutlined />}
            value={filters.username}
            onChange={e => setFilters({ ...filters, username: e.target.value })}
            className="mb-2"
          />
        </Col>
        <Col span={6}>
          <Select
            placeholder="Action"
            value={filters.action}
            onChange={value => setFilters({ ...filters, action: value })}
            className="w-full mb-2"
            allowClear
          >
            <Select.Option value="LOGIN">Login</Select.Option>
            <Select.Option value="LOGOUT">Logout</Select.Option>
            <Select.Option value="PASSWORD_RESET">Password Reset</Select.Option>
            <Select.Option value="IP_CHANGE">IP Change</Select.Option>
            <Select.Option value="ACCOUNT_LOCKED">Account Locked</Select.Option>
          </Select>
        </Col>
        <Col span={6}>
          <Select
            placeholder="Severity"
            value={filters.severity}
            onChange={value => setFilters({ ...filters, severity: value })}
            className="w-full mb-2"
            allowClear
          >
            <Select.Option value="HIGH">High</Select.Option>
            <Select.Option value="MEDIUM">Medium</Select.Option>
            <Select.Option value="LOW">Low</Select.Option>
          </Select>
        </Col>
        <Col span={6}>
          <Select
            placeholder="Status"
            value={filters.isResolved}
            onChange={value => setFilters({ ...filters, isResolved: value })}
            className="w-full mb-2"
            allowClear
          >
            <Select.Option value="resolved">Resolved</Select.Option>
            <Select.Option value="unresolved">Unresolved</Select.Option>
          </Select>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <DatePicker
            placeholder="Start Date"
            onChange={(date) => setFilters({ ...filters, startDate: date })}
            className="w-full"
          />
        </Col>
        <Col span={12}>
          <DatePicker
            placeholder="End Date"
            onChange={(date) => setFilters({ ...filters, endDate: date })}
            className="w-full"
          />
        </Col>
      </Row>
    </div>
  );
  
  if (!isAuthenticated || user?.role !== 'administrator') {
    return (
      <div className="p-6">
        <Alert
          message="Access Denied"
          description="You do not have permission to access this security dashboard."
          type="error"
          showIcon
        />
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Security Dashboard</h1>
      
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          className="mb-4"
        />
      )}
      
      {/* Security Statistics */}
      {renderStatCards()}
      
      {/* Filters */}
      {renderFilters()}
      
      {/* Audit Logs Table */}
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={filteredLogs}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Spin>
      
      {/* Details Modal */}
      <Modal
        title="Security Event Details"
        open={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailsModalVisible(false)}>
            Close
          </Button>,
          !selectedLog?.isResolved && (
            <Button 
              key="resolve" 
              type="primary" 
              onClick={() => {
                if (selectedLog) {
                  handleResolveLog(selectedLog.id);
                }
              }}
            >
              Mark as Resolved
            </Button>
          )
        ]}
        width={600}
      >
        {selectedLog && (
          <div>
            <p><strong>ID:</strong> {selectedLog.id}</p>
            <p><strong>User:</strong> {selectedLog.username}</p>
            <p><strong>Action:</strong> {selectedLog.action}</p>
            <p><strong>IP Address:</strong> {selectedLog.ipAddress}</p>
            <p><strong>Timestamp:</strong> {moment(selectedLog.timestamp).format('YYYY-MM-DD HH:mm:ss')}</p>
            <p><strong>Severity:</strong> {renderSeverityTag(selectedLog.severity)}</p>
            <p><strong>Status:</strong> {selectedLog.isResolved ? 'Resolved' : 'Pending'}</p>
            
            {selectedLog.isResolved && (
              <>
                <p><strong>Resolved By:</strong> {selectedLog.resolvedBy}</p>
                <p><strong>Resolved At:</strong> {moment(selectedLog.resolvedAt).format('YYYY-MM-DD HH:mm:ss')}</p>
              </>
            )}
            
            <div className="mt-4">
              <h3 className="font-bold">Details:</h3>
              {formatDetails(selectedLog.details)}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SecurityDashboard; 