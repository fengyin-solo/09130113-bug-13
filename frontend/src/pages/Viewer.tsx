import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Spin, message, Space, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { RootState, AppDispatch } from '../store';
import { fetchSeismicById } from '../store/slices/seismicSlice';
import { SeismicData } from '../types';
import SeismicCanvas from '../components/SeismicCanvas';
import ControlPanel from '../components/ControlPanel';
import Toolbar from '../components/Toolbar';
import StatusBar from '../components/StatusBar';

const { Title } = Typography;

const Viewer: React.FC = () => {
  const { seismicId } = useParams<{ seismicId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const containerRef = useRef<HTMLDivElement>(null);

  const { loading } = useSelector((state: RootState) => state.seismic);
  const [currentData, setCurrentData] = useState<SeismicData | null>(null);

  useEffect(() => {
    let active = true;
    const id = parseInt(seismicId || '0');
    if (!id) {
      message.error('未找到地震数据');
      navigate('/projects');
      return;
    }

    setCurrentData(null);
    dispatch(fetchSeismicById(id)).then((result) => {
      if (!active) return;
      if (fetchSeismicById.fulfilled.match(result)) {
        setCurrentData(result.payload);
      } else {
        const detail = result.payload;
        message.error(typeof detail === 'string' && detail ? detail : '未找到地震数据');
        navigate('/projects');
      }
    });

    return () => {
      active = false;
    };
  }, [seismicId, dispatch, navigate]);

  if (loading || !currentData) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (currentData.status !== 'ready') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: 16,
        }}
      >
        <Title level={4}>数据尚未就绪</Title>
        <p>当前状态: {currentData.status}</p>
        <Button type="primary" onClick={() => navigate('/projects')}>
          返回项目列表
        </Button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="seismic-canvas-container">
      <SeismicCanvas seismicData={currentData} containerRef={containerRef} />

      <Toolbar />

      <ControlPanel seismicData={currentData} />

      <StatusBar seismicData={currentData} />

      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 100,
        }}
      >
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/projects')}>
            返回
          </Button>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              padding: '8px 16px',
              borderRadius: 4,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <strong>{currentData.name}</strong>
          </div>
        </Space>
      </div>
    </div>
  );
};

export default Viewer;
