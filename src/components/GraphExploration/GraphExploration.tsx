import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Typography,
  Button,
  Row,
  Col,
  Select,
  Space,
  Spin,
  message,
  Drawer,
  Table,
  Tag,
  Tree,
  Statistic,
  Input,
  Checkbox,
  Slider,
  Divider,
  Badge,
} from 'antd';
import {
  NodeExpandOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  ReloadOutlined,
  HistoryOutlined,
  SearchOutlined,
  FilterOutlined,
  BarChartOutlined,
  BranchesOutlined,
  SettingOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import * as d3 from 'd3';
import { useD3 } from '../../hooks/useD3';
import { mockMetricData, mockHistoryData } from '../../services/mockData';

const { Title, Paragraph } = Typography;
const { Search } = Input;

interface TreeNode {
  id: string;
  name: string;
  value: number;
  change: number;
  level: number;
  children?: TreeNode[];
  parent?: string;
  category?: string;
  status?: 'healthy' | 'warning' | 'critical';
}

interface TreeData {
  nodes: TreeNode[];
  hierarchy: any;
}

const GraphExploration: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [treeData, setTreeData] = useState<TreeData | null>(null);
  const [historyDrawerVisible, setHistoryDrawerVisible] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('sessions_daily');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [searchValue, setSearchValue] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<string[]>(['root']);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showHealthyNodes, setShowHealthyNodes] = useState(true);
  const [showWarningNodes, setShowWarningNodes] = useState(true);
  const [showCriticalNodes, setShowCriticalNodes] = useState(true);
  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(100000000);
  const [isTreeView, setIsTreeView] = useState(true); // Toggle between tree and force-directed graph

  const svgRef = useD3(
    svg => {
      if (!treeData) return;

      const width = 900;
      const height = 700;
      const margin = { top: 40, right: 40, bottom: 40, left: 40 };

      // Clear previous content
      svg.selectAll('*').remove();

      // Create main group
      const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

      if (isTreeView) {
        // TREE LAYOUT
        const treeLayout = d3
          .tree<TreeNode>()
          .size([width - margin.left - margin.right, height - margin.top - margin.bottom])
          .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);

        const root = d3.hierarchy(treeData.hierarchy);
        const treeNodes = treeLayout(root);

        // Create links (edges)
        const linkGenerator = d3
          .linkHorizontal<any, any>()
          .x((d: any) => d.y)
          .y((d: any) => d.x);

        const links = g
          .selectAll('.link')
          .data(treeNodes.links())
          .enter()
          .append('path')
          .attr('class', 'link')
          .attr('d', linkGenerator)
          .attr('fill', 'none')
          .attr('stroke', '#ccc')
          .attr('stroke-width', 2);

        // Create nodes
        const nodes = g
          .selectAll('.node')
          .data(treeNodes.descendants())
          .enter()
          .append('g')
          .attr('class', 'node')
          .attr('transform', d => `translate(${d.y},${d.x})`)
          .style('cursor', 'pointer');

        // Add node circles
        nodes
          .append('circle')
          .attr('r', d => Math.max(8, Math.min(25, Math.sqrt((d.data as TreeNode).value / 1000000))))
          .attr('fill', d => {
            const node = d.data as TreeNode;
            if (node.status === 'critical') return '#ff4d4f';
            if (node.status === 'warning') return '#faad14';
            if (node.change > 0) return '#52c41a';
            if (node.change < 0) return '#ff7875';
            return '#1890ff';
          })
          .attr('stroke', d => (selectedNode?.id === (d.data as TreeNode).id ? '#722ed1' : '#fff'))
          .attr('stroke-width', d => (selectedNode?.id === (d.data as TreeNode).id ? 3 : 2));

        // Add node labels
        nodes
          .append('text')
          .attr('dy', '0.35em')
          .attr('x', d => (d.children ? -30 : 30))
          .style('text-anchor', d => (d.children ? 'end' : 'start'))
          .text(d => (d.data as TreeNode).name)
          .attr('font-size', '12px')
          .attr('fill', '#333');

        // Add value labels
        nodes
          .append('text')
          .attr('dy', '1.5em')
          .attr('x', d => (d.children ? -30 : 30))
          .style('text-anchor', d => (d.children ? 'end' : 'start'))
          .text(d => {
            const value = (d.data as TreeNode).value;
            if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
            if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
            return value.toString();
          })
          .attr('font-size', '10px')
          .attr('fill', '#666');

        // Add change indicators
        nodes
          .append('text')
          .attr('dy', '-1em')
          .attr('x', d => (d.children ? -30 : 30))
          .style('text-anchor', d => (d.children ? 'end' : 'start'))
          .text(d => {
            const change = (d.data as TreeNode).change;
            return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
          })
          .attr('font-size', '10px')
          .attr('fill', d => {
            const change = (d.data as TreeNode).change;
            return change > 0 ? '#52c41a' : change < 0 ? '#ff4d4f' : '#666';
          });

        // Add click handlers
        nodes.on('click', (event, d) => {
          const nodeData = d.data as TreeNode;
          setSelectedNode(nodeData);
          setSelectedKeys([nodeData.id]);
          message.info(`Selected: ${nodeData.name}`);
        });
      } else {
        // FORCE-DIRECTED GRAPH LAYOUT
        const flatNodes = treeData.nodes.map(node => ({ ...node }));
        const links = [];

        // Create links based on parent-child relationships
        for (const node of flatNodes) {
          if (node.children) {
            for (const child of node.children) {
              links.push({
                source: node.id,
                target: child.id,
                value: child.value / 1000000,
              });
            }
          }
        }

        // Create force simulation
        const simulation = d3
          .forceSimulation(flatNodes as any)
          .force(
            'link',
            d3
              .forceLink(links)
              .id((d: any) => d.id)
              .distance(100)
          )
          .force('charge', d3.forceManyBody().strength(-300))
          .force(
            'center',
            d3.forceCenter(
              (width - margin.left - margin.right) / 2,
              (height - margin.top - margin.bottom) / 2
            )
          )
          .force('collision', d3.forceCollide().radius(30));

        // Create links
        const linkElements = g
          .append('g')
          .selectAll('line')
          .data(links)
          .enter()
          .append('line')
          .attr('stroke', '#999')
          .attr('stroke-opacity', 0.6)
          .attr('stroke-width', d => Math.sqrt(d.value) + 1);

        // Create nodes
        const nodeElements = g
          .append('g')
          .selectAll('circle')
          .data(flatNodes)
          .enter()
          .append('circle')
          .attr('r', d => Math.max(8, Math.min(25, Math.sqrt(d.value / 1000000))))
          .attr('fill', d => {
            if (d.status === 'critical') return '#ff4d4f';
            if (d.status === 'warning') return '#faad14';
            if (d.change > 0) return '#52c41a';
            if (d.change < 0) return '#ff7875';
            return '#1890ff';
          })
          .attr('stroke', d => (selectedNode?.id === d.id ? '#722ed1' : '#fff'))
          .attr('stroke-width', d => (selectedNode?.id === d.id ? 3 : 2))
          .style('cursor', 'pointer')
          .call(
            d3
              .drag<any, any>()
              .on('start', (event, d) => {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
              })
              .on('drag', (event, d) => {
                d.fx = event.x;
                d.fy = event.y;
              })
              .on('end', (event, d) => {
                if (!event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
              })
          );

        // Add node labels
        const labelElements = g
          .append('g')
          .selectAll('text')
          .data(flatNodes)
          .enter()
          .append('text')
          .text(d => d.name)
          .attr('font-size', '12px')
          .attr('text-anchor', 'middle')
          .attr('dy', '0.35em')
          .attr('fill', '#333')
          .style('pointer-events', 'none');

        // Add click handlers
        nodeElements.on('click', (event, d) => {
          setSelectedNode(d);
          setSelectedKeys([d.id]);
          message.info(`Selected: ${d.name}`);
        });

        // Update positions on simulation tick
        simulation.on('tick', () => {
          linkElements
            .attr('x1', (d: any) => d.source.x)
            .attr('y1', (d: any) => d.source.y)
            .attr('x2', (d: any) => d.target.x)
            .attr('y2', (d: any) => d.target.y);

          nodeElements.attr('cx', (d: any) => d.x).attr('cy', (d: any) => d.y);

          labelElements.attr('x', (d: any) => d.x).attr('y', (d: any) => d.y);
        });
      }

      // Add zoom behavior (common for both layouts)
      const zoom = d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.1, 3])
        .on('zoom', event => {
          g.attr(
            'transform',
            `translate(${margin.left + event.transform.x},${margin.top + event.transform.y}) scale(${
              event.transform.k
            })`
          );
          setZoomLevel(event.transform.k);
        });

      svg.call(zoom);
    },
    [treeData, selectedNode, isTreeView]
  );

  const loadTreeData = async () => {
    try {
      setLoading(true);

      // Create hierarchical tree data
      const rootNode: TreeNode = {
        id: 'root',
        name: 'Detective System',
        value: 142587262,
        change: 2.5,
        level: 0,
        category: 'system',
        status: 'healthy',
        children: [
          {
            id: 'traffic',
            name: 'Traffic Sources',
            value: 85000000,
            change: 3.2,
            level: 1,
            category: 'traffic',
            status: 'healthy',
            children: [
              {
                id: 'organic',
                name: 'Organic Search',
                value: 45000000,
                change: 4.1,
                level: 2,
                category: 'traffic',
                status: 'healthy',
              },
              {
                id: 'direct',
                name: 'Direct Traffic',
                value: 25000000,
                change: 2.8,
                level: 2,
                category: 'traffic',
                status: 'healthy',
              },
              {
                id: 'social',
                name: 'Social Media',
                value: 15000000,
                change: -1.2,
                level: 2,
                category: 'traffic',
                status: 'warning',
              },
            ],
          },
          {
            id: 'geography',
            name: 'Geographic Distribution',
            value: 57587262,
            change: 1.8,
            level: 1,
            category: 'geography',
            status: 'healthy',
            children: [
              {
                id: 'north_america',
                name: 'North America',
                value: 35000000,
                change: 2.5,
                level: 2,
                category: 'geography',
                status: 'healthy',
                children: [
                  {
                    id: 'usa',
                    name: 'United States',
                    value: 28000000,
                    change: 2.8,
                    level: 3,
                    category: 'geography',
                    status: 'healthy',
                  },
                  {
                    id: 'canada',
                    name: 'Canada',
                    value: 7000000,
                    change: 1.5,
                    level: 3,
                    category: 'geography',
                    status: 'healthy',
                  },
                ],
              },
              {
                id: 'europe',
                name: 'Europe',
                value: 15000000,
                change: 0.8,
                level: 2,
                category: 'geography',
                status: 'warning',
              },
              {
                id: 'asia',
                name: 'Asia Pacific',
                value: 7587262,
                change: -2.1,
                level: 2,
                category: 'geography',
                status: 'critical',
              },
            ],
          },
          {
            id: 'devices',
            name: 'Device Types',
            value: 142587262,
            change: 0.5,
            level: 1,
            category: 'device',
            status: 'warning',
            children: [
              {
                id: 'mobile',
                name: 'Mobile Devices',
                value: 95000000,
                change: 5.2,
                level: 2,
                category: 'device',
                status: 'healthy',
              },
              {
                id: 'desktop',
                name: 'Desktop',
                value: 42000000,
                change: -3.8,
                level: 2,
                category: 'device',
                status: 'critical',
              },
              {
                id: 'tablet',
                name: 'Tablet',
                value: 5587262,
                change: -1.5,
                level: 2,
                category: 'device',
                status: 'warning',
              },
            ],
          },
        ],
      };

      const flattenNodes = (node: TreeNode, nodes: TreeNode[] = []): TreeNode[] => {
        nodes.push(node);
        if (node.children) {
          node.children.forEach(child => flattenNodes(child, nodes));
        }
        return nodes;
      };

      const allNodes = flattenNodes(rootNode);
      setTreeData({ nodes: allNodes, hierarchy: rootNode });
      message.success('Tree data loaded successfully');
    } catch (error) {
      message.error('Failed to load tree data');
    } finally {
      setLoading(false);
    }
  };

  const resetGraph = () => {
    setSelectedNode(null);
    setSelectedKeys([]);
    setZoomLevel(1);
    setSearchValue('');
    setExpandedKeys(['root']);
    loadTreeData();
  };

  const zoomIn = () => {
    const svg = d3.select(svgRef.current);
    svg.transition().call(d3.zoom<SVGSVGElement, unknown>().scaleBy as any, 1.5);
  };

  const zoomOut = () => {
    const svg = d3.select(svgRef.current);
    svg.transition().call(d3.zoom<SVGSVGElement, unknown>().scaleBy as any, 1 / 1.5);
  };

  const onTreeSelect = (selectedKeys: React.Key[], info: any) => {
    if (selectedKeys.length > 0) {
      const nodeId = selectedKeys[0] as string;
      const node = treeData?.nodes.find(n => n.id === nodeId);
      if (node) {
        setSelectedNode(node);
        setSelectedKeys([nodeId]);
      }
    }
  };

  const onTreeExpand = (expandedKeys: React.Key[]) => {
    setExpandedKeys(expandedKeys as string[]);
  };

  const buildTreeData = (nodes: TreeNode[]): any[] => {
    const buildNode = (node: TreeNode): any => ({
      title: (
        <div className="flex items-center justify-between">
          <span>{node.name}</span>
          <div className="flex items-center space-x-2">
            <Badge
              status={node.status === 'healthy' ? 'success' : node.status === 'warning' ? 'warning' : 'error'}
            />
            <span className="text-xs text-gray-500">
              {node.value >= 1000000
                ? `${(node.value / 1000000).toFixed(1)}M`
                : node.value >= 1000
                ? `${(node.value / 1000).toFixed(1)}K`
                : node.value.toString()}
            </span>
          </div>
        </div>
      ),
      key: node.id,
      children: node.children ? node.children.map(buildNode) : undefined,
    });

    return nodes.filter(n => n.level === 0).map(buildNode);
  };

  const getFilteredNodes = () => {
    if (!treeData) return [];

    return treeData.nodes.filter(node => {
      // Category filter
      if (filterCategory !== 'all' && node.category !== filterCategory) return false;

      // Status filter
      if (!showHealthyNodes && node.status === 'healthy') return false;
      if (!showWarningNodes && node.status === 'warning') return false;
      if (!showCriticalNodes && node.status === 'critical') return false;

      // Value range filter
      if (node.value < minValue || node.value > maxValue) return false;

      // Search filter
      if (searchValue && !node.name.toLowerCase().includes(searchValue.toLowerCase())) return false;

      return true;
    });
  };

  useEffect(() => {
    loadTreeData();
  }, [selectedMetric]);

  const historyColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      render: (value: number) => value.toLocaleString(),
    },
    {
      title: 'Change',
      dataIndex: 'change',
      key: 'change',
      render: (change: number) => (
        <Tag color={change > 0 ? 'green' : change < 0 ? 'red' : 'blue'}>
          {change > 0 ? '+' : ''}
          {change.toFixed(1)}%
        </Tag>
      ),
    },
  ];

  const historyData = mockHistoryData.map((item, index) => ({
    key: index,
    date: item.date,
    value: item.value,
    change: (Math.random() - 0.5) * 10,
  }));

  const getStatusCounts = () => {
    if (!treeData) return { healthy: 0, warning: 0, critical: 0 };

    return treeData.nodes.reduce(
      (acc, node) => {
        acc[node.status || 'healthy']++;
        return acc;
      },
      { healthy: 0, warning: 0, critical: 0 }
    );
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <Title level={2}>
          <BranchesOutlined className="mr-2" />
          Tree Structure Explorer
        </Title>
        <Paragraph>
          Interactive hierarchical tree visualization with advanced filtering and drill-down capabilities.
        </Paragraph>
      </div>

      <Row gutter={[24, 24]}>
        {/* Controls Panel */}
        <Col xs={24}>
          <Card title="Graph Controls" className="mb-6">
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={8} md={4}>
                <label className="block text-sm font-medium text-gray-700 mb-2">Metric Type</label>
                <Select
                  value={selectedMetric}
                  onChange={setSelectedMetric}
                  style={{ width: '100%' }}
                  options={[
                    { value: 'sessions_daily', label: 'Daily Sessions' },
                    { value: 'revenue_daily', label: 'Daily Revenue' },
                    { value: 'users_daily', label: 'Daily Users' },
                  ]}
                />
              </Col>
              <Col xs={24} sm={16} md={20}>
                <label className="block text-sm font-medium text-gray-700 mb-2">Actions</label>
                <Space wrap>
                  <Button
                    type={isTreeView ? 'default' : 'primary'}
                    icon={<SwapOutlined />}
                    onClick={() => setIsTreeView(!isTreeView)}
                  >
                    {isTreeView ? 'Switch to Interactive Graph' : 'Switch to Tree View'}
                  </Button>
                  <Button type="primary" icon={<ReloadOutlined />} onClick={resetGraph} loading={loading}>
                    {isTreeView ? 'Reset Tree' : 'Reset Graph'}
                  </Button>
                  <Button icon={<ZoomInOutlined />} onClick={zoomIn}>
                    Zoom In
                  </Button>
                  <Button icon={<ZoomOutOutlined />} onClick={zoomOut}>
                    Zoom Out
                  </Button>
                  <Button
                    icon={<HistoryOutlined />}
                    onClick={() => setHistoryDrawerVisible(true)}
                    disabled={!selectedNode}
                  >
                    View History
                  </Button>
                  <span className="text-sm text-gray-500">Zoom: {(zoomLevel * 100).toFixed(0)}%</span>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Tree Navigation Panel */}
        <Col xs={24} lg={6}>
          <Card
            title={
              <>
                <BranchesOutlined /> Tree Navigation
              </>
            }
            className="h-full"
          >
            <div className="mb-4">
              <Search
                placeholder="Search nodes..."
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            {treeData && (
              <Tree
                showLine
                showIcon={false}
                expandedKeys={expandedKeys}
                selectedKeys={selectedKeys}
                onSelect={onTreeSelect}
                onExpand={onTreeExpand}
                treeData={buildTreeData(treeData.nodes)}
                height={400}
              />
            )}
          </Card>
        </Col>

        {/* Main Visualization */}
        <Col xs={24} lg={12}>
          <Card
            title={isTreeView ? 'Tree Structure Visualization' : 'Interactive Graph Visualization'}
            className="chart-container"
          >
            {loading ? (
              <div className="text-center py-12">
                <Spin size="large" />
                <p className="text-gray-500 mt-4">Loading {isTreeView ? 'tree' : 'graph'} data...</p>
              </div>
            ) : (
              <div className="relative">
                <svg
                  ref={svgRef}
                  width={900}
                  height={700}
                  style={{ border: '1px solid #d9d9d9', borderRadius: '6px' }}
                />
                <div className="absolute top-4 left-4 bg-white p-3 rounded shadow text-xs max-w-xs">
                  <p>
                    <strong>{isTreeView ? 'Tree Navigation:' : 'Graph Navigation:'}</strong>
                  </p>
                  <p>• Click nodes to select and view details</p>
                  <p>• Use mouse wheel to zoom in/out</p>
                  <p>• Drag to pan around the {isTreeView ? 'tree' : 'graph'}</p>
                  {!isTreeView && <p>• Drag nodes to reposition them</p>}
                  <p>• Colors indicate health status and trends</p>
                </div>
              </div>
            )}
          </Card>
        </Col>

        {/* Filters and Metrics Panel */}
        <Col xs={24} lg={6}>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {/* Filters Card */}
            <Card
              title={
                <>
                  <FilterOutlined /> Filters
                </>
              }
              size="small"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <Select
                    value={filterCategory}
                    onChange={setFilterCategory}
                    style={{ width: '100%' }}
                    size="small"
                    options={[
                      { value: 'all', label: 'All Categories' },
                      { value: 'system', label: 'System' },
                      { value: 'traffic', label: 'Traffic' },
                      { value: 'geography', label: 'Geography' },
                      { value: 'device', label: 'Device' },
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <div className="space-y-2">
                    <Checkbox
                      checked={showHealthyNodes}
                      onChange={e => setShowHealthyNodes(e.target.checked)}
                    >
                      <Badge status="success" /> Healthy ({statusCounts.healthy})
                    </Checkbox>
                    <Checkbox
                      checked={showWarningNodes}
                      onChange={e => setShowWarningNodes(e.target.checked)}
                    >
                      <Badge status="warning" /> Warning ({statusCounts.warning})
                    </Checkbox>
                    <Checkbox
                      checked={showCriticalNodes}
                      onChange={e => setShowCriticalNodes(e.target.checked)}
                    >
                      <Badge status="error" /> Critical ({statusCounts.critical})
                    </Checkbox>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Value Range</label>
                  <Slider
                    range
                    min={0}
                    max={100000000}
                    step={1000000}
                    value={[minValue, maxValue]}
                    onChange={([min, max]) => {
                      setMinValue(min);
                      setMaxValue(max);
                    }}
                    tooltip={{
                      formatter: value => `${(value! / 1000000).toFixed(1)}M`,
                    }}
                  />
                </div>
              </div>
            </Card>

            {/* Node Details Card */}
            <Card
              title={
                <>
                  <BarChartOutlined /> Node Details
                </>
              }
              size="small"
            >
              {selectedNode ? (
                <div className="space-y-3">
                  <div>
                    <Title level={5} className="mb-2">
                      {selectedNode.name}
                    </Title>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Value:</span>
                        <span className="font-semibold">{selectedNode.value.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Change:</span>
                        <Tag
                          color={selectedNode.change > 0 ? 'green' : selectedNode.change < 0 ? 'red' : 'blue'}
                        >
                          {selectedNode.change > 0 ? '+' : ''}
                          {selectedNode.change.toFixed(1)}%
                        </Tag>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Level:</span>
                        <span>{selectedNode.level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="capitalize">{selectedNode.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <Badge
                          status={
                            selectedNode.status === 'healthy'
                              ? 'success'
                              : selectedNode.status === 'warning'
                              ? 'warning'
                              : 'error'
                          }
                          text={selectedNode.status}
                        />
                      </div>
                      {selectedNode.children && selectedNode.children.length > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Children:</span>
                          <span>{selectedNode.children.length}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  <NodeExpandOutlined style={{ fontSize: '32px', marginBottom: '8px' }} />
                  <p className="text-sm">Select a node to view details</p>
                </div>
              )}
            </Card>

            {/* Summary Statistics */}
            <Card
              title={
                <>
                  <SettingOutlined /> Summary
                </>
              }
              size="small"
            >
              <Row gutter={[8, 8]}>
                <Col span={12}>
                  <Statistic
                    title="Total Nodes"
                    value={treeData?.nodes.length || 0}
                    valueStyle={{ fontSize: '16px' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Filtered"
                    value={getFilteredNodes().length}
                    valueStyle={{ fontSize: '16px' }}
                  />
                </Col>
                <Col span={24}>
                  <Divider style={{ margin: '8px 0' }} />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Healthy"
                    value={statusCounts.healthy}
                    valueStyle={{ fontSize: '14px', color: '#52c41a' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Warning"
                    value={statusCounts.warning}
                    valueStyle={{ fontSize: '14px', color: '#faad14' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Critical"
                    value={statusCounts.critical}
                    valueStyle={{ fontSize: '14px', color: '#ff4d4f' }}
                  />
                </Col>
              </Row>
            </Card>
          </Space>
        </Col>
      </Row>

      <Drawer
        title={`Historical Trends - ${selectedNode?.name || 'Node'}`}
        placement="right"
        width={600}
        onClose={() => setHistoryDrawerVisible(false)}
        open={historyDrawerVisible}
      >
        <Table columns={historyColumns} dataSource={historyData} pagination={{ pageSize: 10 }} size="small" />
      </Drawer>
    </div>
  );
};

export default GraphExploration;
