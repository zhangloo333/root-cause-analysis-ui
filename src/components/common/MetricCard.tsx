import React from 'react';
import { Card, Statistic, Spin } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, MinusOutlined } from '@ant-design/icons';
import { MetricCardProps } from '../../types';
import { formatNumber, formatPercentage } from '../../utils/formatters';

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, trend, loading = false }) => {
  const getTrendIcon = () => {
    if (trend === 'up' || (change && change > 0)) {
      return <ArrowUpOutlined />;
    }
    if (trend === 'down' || (change && change < 0)) {
      return <ArrowDownOutlined />;
    }
    return <MinusOutlined />;
  };

  const getTrendColorValue = () => {
    if (trend === 'up' || (change && change > 0)) {
      return '#52c41a';
    }
    if (trend === 'down' || (change && change < 0)) {
      return '#ff4d4f';
    }
    return '#faad14';
  };

  if (loading) {
    return (
      <Card className="metric-card">
        <div className="flex items-center justify-center h-24">
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="metric-card">
      <Statistic
        title={title}
        value={formatNumber(value)}
        precision={0}
        valueStyle={{
          color: '#1890ff',
          fontSize: '24px',
          fontWeight: 'bold',
        }}
        suffix={
          change !== undefined && (
            <span
              style={{
                color: getTrendColorValue(),
                fontSize: '14px',
                marginLeft: '8px',
              }}
            >
              {getTrendIcon()} {formatPercentage(change)}
            </span>
          )
        }
      />
    </Card>
  );
};

export default MetricCard;
