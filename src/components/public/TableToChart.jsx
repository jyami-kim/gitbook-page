import React, { useState, useMemo, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DEFAULT_ITEMS = [
  { id: 1, name: '숙소', value: 2310000 },
  { id: 2, name: '비행기', value: 1800000 },
  { id: 3, name: '식비', value: 1500000 },
  { id: 4, name: '교통비', value: 930000 },
  { id: 5, name: '관광', value: 470000 },
  { id: 6, name: '기념품', value: 430000 },
  { id: 7, name: '준비물', value: 280000 },
];

const COLORS = [
  '#10B981',  // 숙소 - 에메랄드
  '#F59E0B',  // 비행기 - 앰버
  '#EF4444',  // 식비 - 레드
  '#3B82F6',  // 교통비 - 블루
  '#8B5CF6',  // 관광 - 바이올렛
  '#EC4899',  // 기념품 - 핑크
  '#6366F1',  // 준비물 - 인디고
  '#14B8A6',  // 틸 (NEW)
  '#F97316',  // 오렌지 (NEW)
  '#A855F7',  // 퍼플 (NEW)
];

const formatCurrency = (value, unit = '원') => {
  return new Intl.NumberFormat('ko-KR').format(Math.round(value)) + unit;
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        padding: '16px 20px',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
      }}>
        <p style={{ 
          margin: 0, 
          fontWeight: 700, 
          fontSize: '15px',
          color: '#1a1a2e',
          marginBottom: '6px'
        }}>
          {data.name}
        </p>
        <p style={{ 
          margin: 0, 
          fontSize: '18px', 
          fontWeight: 600,
          color: payload[0].payload.fill || '#333',
        }}>
          {formatCurrency(data.value)}
        </p>
        <p style={{ 
          margin: 0, 
          fontSize: '13px',
          color: '#666',
          marginTop: '4px'
        }}>
          전체의 {data.percentage}%
        </p>
      </div>
    );
  }
  return null;
};

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor="middle" 
      dominantBaseline="central"
      style={{ 
        fontSize: '12px', 
        fontWeight: 600,
        textShadow: '0 1px 3px rgba(0,0,0,0.3)'
      }}
    >
      {(percent * 100).toFixed(0)}%
    </text>
  );
};

const CustomLegend = ({ payload }) => {
  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: '10px 20px',
      marginTop: '20px',
      padding: '0 16px',
    }}>
      {payload.map((entry, index) => (
        <div key={index} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '3px',
            backgroundColor: entry.color,
          }} />
          <span style={{
            fontSize: '13px',
            color: '#555',
            fontWeight: 500,
          }}>
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function ExpensePieChart() {
  // 상태 관리
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('chartItems');
    return saved ? JSON.parse(saved) : DEFAULT_ITEMS;
  });
  const [activeTab, setActiveTab] = useState('input');
  const [nextId, setNextId] = useState(() => {
    const saved = localStorage.getItem('chartNextId');
    return saved ? parseInt(saved) : 8;
  });
  const [title, setTitle] = useState(() => {
    const saved = localStorage.getItem('chartTitle');
    return saved || '✈️ 여행 경비 분석';
  });
  const [subtitle, setSubtitle] = useState(() => {
    const saved = localStorage.getItem('chartSubtitle');
    return saved || '호주 & 뉴질랜드 여행';
  });
  const [unit, setUnit] = useState(() => {
    const saved = localStorage.getItem('chartUnit');
    return saved || '원';
  });

  // localStorage 저장
  useEffect(() => {
    localStorage.setItem('chartItems', JSON.stringify(items));
    localStorage.setItem('chartNextId', nextId.toString());
    localStorage.setItem('chartTitle', title);
    localStorage.setItem('chartSubtitle', subtitle);
    localStorage.setItem('chartUnit', unit);
  }, [items, nextId, title, subtitle, unit]);

  // 계산된 값
  const computedTotal = useMemo(() => {
    return items.reduce((sum, item) => sum + Number(item.value || 0), 0);
  }, [items]);

  const computedChartData = useMemo(() => {
    if (computedTotal === 0) return [];
    return items
      .map((item, idx) => ({ ...item, originalIndex: idx }))
      .filter(item => Number(item.value || 0) > 0)
      .map(item => ({
        name: item.name || '(이름 없음)',
        value: Number(item.value),
        percentage: ((Number(item.value) / computedTotal) * 100).toFixed(1),
        originalIndex: item.originalIndex,
      }));
  }, [items, computedTotal]);

  // 이벤트 핸들러
  const handleAddItem = () => {
    if (items.length >= 10) return;
    setItems([...items, { id: nextId, name: '', value: 0 }]);
    setNextId(nextId + 1);
  };

  const handleRemoveItem = (id) => {
    if (items.length <= 1) return;
    setItems(items.filter(item => item.id !== id));
  };

  const handleUpdateItem = (id, field, value) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleClearAll = () => {
    if (window.confirm('모든 데이터를 삭제하시겠습니까?')) {
      setItems([{ id: 1, name: '', value: 0 }]);
      setNextId(2);
    }
  };
  
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      padding: '40px 20px',
      fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      <div style={{
        maxWidth: '580px',
        margin: '0 auto',
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px)',
        borderRadius: '28px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 25px 80px rgba(0, 0, 0, 0.4)',
        padding: '36px 28px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Glow effects */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '250px',
          height: '250px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-80px',
          left: '-80px',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
        
        <div style={{ textAlign: 'center', marginBottom: '28px', position: 'relative' }}>
          <h1 style={{
            fontSize: '26px',
            fontWeight: 800,
            color: '#fff',
            margin: 0,
            letterSpacing: '-0.5px',
          }}>
            {title || '새로운 데이터'}
          </h1>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '6px',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          padding: '6px',
          marginBottom: '24px',
        }}>
          <button
            onClick={() => setActiveTab('input')}
            style={{
              flex: 1,
              padding: '10px 16px',
              background: activeTab === 'input' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
              color: activeTab === 'input' ? '#fff' : 'rgba(255, 255, 255, 0.5)',
              border: activeTab === 'input' ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: activeTab === 'input' ? '0 4px 12px rgba(0, 0, 0, 0.2)' : 'none',
            }}
          >
            ✏️ 데이터 입력
          </button>
          <button
            onClick={() => setActiveTab('chart')}
            style={{
              flex: 1,
              padding: '10px 16px',
              background: activeTab === 'chart' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
              color: activeTab === 'chart' ? '#fff' : 'rgba(255, 255, 255, 0.5)',
              border: activeTab === 'chart' ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: activeTab === 'chart' ? '0 4px 12px rgba(0, 0, 0, 0.2)' : 'none',
            }}
          >
            📊 차트 보기
          </button>
        </div>

        {/* Chart View */}
        {activeTab === 'chart' && (
          <>
            {/* Total Summary */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '20px',
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <p style={{
                margin: 0,
                fontSize: '12px',
                color: 'rgba(255,255,255,0.5)',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                marginBottom: '6px',
              }}>
                총합
              </p>
              <p style={{
                margin: 0,
                fontSize: '34px',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #fff 0%, #86efac 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-1px',
              }}>
                {formatCurrency(computedTotal, unit)}
              </p>
            </div>

            <div style={{ width: '100%', height: '320px', position: 'relative', marginBottom: '20px' }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={computedChartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
                labelLine={false}
                label={renderCustomLabel}
                animationBegin={0}
                animationDuration={800}
              >
                {computedChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[entry.originalIndex % 10]}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={1}
                    style={{
                      filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))',
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Detail breakdown */}
        <div style={{
          marginTop: '24px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: '24px',
        }}>
          <h3 style={{
            fontSize: '12px',
            fontWeight: 700,
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            margin: '0 0 16px 0',
          }}>
            상세 내역
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {items.map((item, index) => {
              const percentage = computedTotal > 0 ? ((Number(item.value) / computedTotal) * 100).toFixed(1) : '0';
              return (
                <div key={item.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.05)',
                  transition: 'all 0.2s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '6px',
                      height: '28px',
                      borderRadius: '3px',
                      background: COLORS[index % 10],
                      boxShadow: `0 0 12px ${COLORS[index % 10]}50`,
                    }} />
                    <span style={{
                      fontWeight: 600,
                      color: 'rgba(255,255,255,0.9)',
                      fontSize: '14px',
                    }}>
                      {item.name || '(이름 없음)'}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      fontWeight: 700,
                      color: '#fff',
                      fontSize: '14px',
                    }}>
                      {formatCurrency(item.value, unit)}
                    </span>
                    <span style={{
                      display: 'block',
                      fontSize: '11px',
                      color: 'rgba(255,255,255,0.4)',
                      marginTop: '2px',
                    }}>
                      {percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
          </>
        )}

        {/* Input View */}
        {activeTab === 'input' && (
          <div>
            {/* Title and Metadata Section */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginBottom: '20px',
              paddingBottom: '20px',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, 50))}
                placeholder="제목 (예: 여행 경비 분석)"
                maxLength="50"
                style={{
                  padding: '12px 14px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  fontWeight: 600,
                }}
              />
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value.slice(0, 10))}
                placeholder="단위 (예: 원, $, 개)"
                maxLength="10"
                style={{
                  padding: '12px 14px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
              />
            </div>

            {/* Header Row */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              paddingBottom: '16px',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}>
              <div style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.7)',
              }}>
                항목 {items.length}/10
              </div>
              <button
                onClick={handleClearAll}
                style={{
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                🗑️ 초기화
              </button>
            </div>

            {/* Input Rows */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              maxHeight: '450px',
              overflowY: 'auto',
              paddingRight: '4px',
              marginBottom: '16px',
            }}>
              {items.map((item, index) => (
                <div key={item.id} style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center',
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  transition: 'all 0.2s',
                }}>
                  {/* Color Indicator */}
                  <div style={{
                    width: '6px',
                    height: '40px',
                    borderRadius: '3px',
                    background: COLORS[index % 10],
                    boxShadow: `0 0 12px ${COLORS[index % 10]}50`,
                    flexShrink: 0,
                  }} />

                  {/* Name Input */}
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value.slice(0, 20))}
                    placeholder="항목명"
                    maxLength="20"
                    style={{
                      flex: 0.4,
                      padding: '10px 14px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                      outline: 'none',
                    }}
                  />

                  {/* Value Input */}
                  <input
                    type="number"
                    value={item.value === 0 ? '' : item.value}
                    onChange={(e) => handleUpdateItem(item.id, 'value', e.target.value === '' ? 0 : Number(e.target.value))}
                    placeholder="수치"
                    min="0"
                    style={{
                      flex: 0.3,
                      padding: '10px 14px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                      outline: 'none',
                    }}
                  />

                  {/* Percentage Display */}
                  <div style={{
                    flex: 0.25,
                    textAlign: 'right',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.7)',
                  }}>
                    {computedTotal > 0 && Number(item.value) > 0
                      ? ((Number(item.value) / computedTotal) * 100).toFixed(1) + '%'
                      : '-'}
                  </div>

                  {/* Remove Button */}
                  {items.length > 1 && (
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      style={{
                        padding: '8px 12px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '6px',
                        color: 'rgba(239, 68, 68, 0.8)',
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        flexShrink: 0,
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add Button */}
            {items.length < 10 && (
              <button
                onClick={handleAddItem}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '12px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                + 항목 추가
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}