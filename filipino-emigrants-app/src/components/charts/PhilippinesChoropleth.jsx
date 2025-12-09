// src/components/charts/PhilippinesChoropleth.jsx
import React, { useEffect, useState, useCallback } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { getData, collections } from '../../services/emigrantsService';

// Load Highcharts Map module
const initMapModules = async () => {
  try {
    const mapModule = await import('highcharts/modules/map.js');
    if (mapModule && typeof mapModule.default === 'function') {
      mapModule.default(Highcharts);
    }
    console.log('✅ Highcharts Map module loaded');
    return true;
  } catch (e) {
    console.error('❌ Could not load Highcharts modules:', e);
    return false;
  }
};
initMapModules();

// Province name to DB key mapping
const PROVINCE_DB_MAP = {
  'ILOCOS NORTE': 'ILOCOS_NORTE',
  'ILOCOS SUR': 'ILOCOS_SUR',
  'LA UNION': 'LA_UNION',
  'PANGASINAN': 'PANGASINAN',
  'BATANES': 'BATANES',
  'CAGAYAN': 'CAGAYAN',
  'ISABELA': 'ISABELA',
  'NUEVA VIZCAYA': 'NUEVA_VIZCAYA',
  'QUIRINO': 'QUIRINO',
  'AURORA': 'AURORA',
  'BATAAN': 'BATAAN',
  'BULACAN': 'BULACAN',
  'NUEVA ECIJA': 'NUEVA_ECIJA',
  'PAMPANGA': 'PAMPANGA',
  'TARLAC': 'TARLAC',
  'ZAMBALES': 'ZAMBALES',
  'BATANGAS': 'BATANGAS',
  'CAVITE': 'CAVITE',
  'LAGUNA': 'LAGUNA',
  'QUEZON': 'QUEZON',
  'RIZAL': 'RIZAL',
  'MARINDUQUE': 'MARINDUQUE',
  'OCCIDENTAL MINDORO': 'OCCIDENTAL_MINDORO',
  'ORIENTAL MINDORO': 'ORIENTAL_MINDORO',
  'PALAWAN': 'PALAWAN',
  'ROMBLON': 'ROMBLON',
  'ALBAY': 'ALBAY',
  'CAMARINES NORTE': 'CAMARINES_NORTE',
  'CAMARINES SUR': 'CAMARINES_SUR',
  'CATANDUANES': 'CATANDUANES',
  'MASBATE': 'MASBATE',
  'SORSOGON': 'SORSOGON',
  'AKLAN': 'AKLAN',
  'ANTIQUE': 'ANTIQUE',
  'CAPIZ': 'CAPIZ',
  'GUIMARAS': 'GUIMARAS',
  'ILOILO': 'ILOILO',
  'NEGROS OCCIDENTAL': 'NEGROS_OCCIDENTAL',
  'BOHOL': 'BOHOL',
  'CEBU': 'CEBU',
  'NEGROS ORIENTAL': 'NEGROS_ORIENTAL',
  'SIQUIJOR': 'SIQUIJOR',
  'BILIRAN': 'BILIRAN',
  'EASTERN SAMAR': 'EASTERN_SAMAR',
  'LEYTE': 'LEYTE',
  'NORTHERN SAMAR': 'NORTHERN_SAMAR',
  'SAMAR (WESTERN SAMAR)': 'SAMAR_WESTERN_SAMAR_',
  'SOUTHERN LEYTE': 'SOUTHERN_LEYTE',
  'ZAMBOANGA DEL NORTE': 'ZAMBOANGA_DEL_NORTE',
  'ZAMBOANGA DEL SUR': 'ZAMBOANGA_DEL_SUR',
  'ZAMBOANGA SIBUGAY': 'ZAMBOANGA_SIBUGAY',
  'ISABELA CITY, (BASILAN)  (a)': 'ISABELA_CITY_BASILAN_a_',
  'BUKIDNON': 'BUKIDNON',
  'CAMIGUIN': 'CAMIGUIN',
  'LANAO DEL NORTE': 'LANAO_DEL_NORTE',
  'MISAMIS OCCIDENTAL': 'MISAMIS_OCCIDENTAL',
  'MISAMIS ORIENTAL': 'MISAMIS_ORIENTAL',
  'COMPOSTELA VALLEY': 'COMPOSTELA_VALLEY',
  'DAVAO DEL NORTE': 'DAVAO_DEL_NORTE',
  'DAVAO DEL SUR': 'DAVAO_DEL_SUR',
  'DAVAO ORIENTAL': 'DAVAO_ORIENTAL',
  'COTABATO CITY  (a)': 'COTABATO_CITY_a_',
  'NORTH COTABATO': 'NORTH_COTABATO',
  'SARANGANI': 'SARANGANI',
  'SOUTH COTABATO': 'SOUTH_COTABATO',
  'SULTAN KUDARAT': 'SULTAN_KUDARAT',
  'AGUSAN DEL NORTE': 'AGUSAN_DEL_NORTE',
  'AGUSAN DEL SUR': 'AGUSAN_DEL_SUR',
  'SURIGAO DEL NORTE (still includes Dinagat Islands) (b)': 'SURIGAO_DEL_NORTE_still_includes_Dinagat_Islands_b_',
  'SURIGAO DEL SUR': 'SURIGAO_DEL_SUR',
  'BASILAN': 'BASILAN',
  'LANAO DEL SUR': 'LANAO_DEL_SUR',
  'MAGUINDANAO (still includes Shariff Kabunsuan) (c)': 'MAGUINDANAO_still_includes_Shariff_Kabunsuan_c_',
  'SULU': 'SULU',
  'TAWI-TAWI': 'TAWI_TAWI',
  'ABRA': 'ABRA',
  'APAYAO': 'APAYAO',
  'BENGUET': 'BENGUET',
  'IFUGAO': 'IFUGAO',
  'KALINGA': 'KALINGA',
  'MOUNTAIN PROVINCE': 'MOUNTAIN_PROVINCE',
  'NCR': 'NCR'
};

// Normalize province names for map matching
const normalizeProvinceName = (name) =>
  name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z]/g, '');

let mapKeyLookup = {};

function PhilippinesChoropleth({ compact = false }) {
  const [data, setData] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isModuleLoaded, setIsModuleLoaded] = useState(false);
  const [phMap, setPhMap] = useState(null);
  const [chartOptions, setChartOptions] = useState(null);
  const [error, setError] = useState(null);

  // Check Highcharts Map module status
  useEffect(() => {
    if (Highcharts.maps) {
      setIsModuleLoaded(true);
    } else {
      const timer = setTimeout(() => {
        if (Highcharts.maps) setIsModuleLoaded(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Fetch data and map
  const loadData = useCallback(async () => {
    setIsDataLoading(true);
    setError(null);
    try {
      const [originData, mapData] = await Promise.all([
        getData(collections.placeOfOrigin),
        fetch('https://code.highcharts.com/mapdata/countries/ph/ph-all.geo.json').then((res) => res.json())
      ]);

      if (!originData || originData.length === 0) {
        setError('No place of origin data found.');
        setIsDataLoading(false);
        return;
      }

      setPhMap(mapData);

      // Build lookup
      if (mapData?.features) {
        mapData.features.forEach((f) => {
          const hcKey = f.properties['hc-key'];
          const mapName = f.properties.name;
          const norm = normalizeProvinceName(mapName);
          mapKeyLookup[norm] = { hcKey, displayName: mapName };
        });
      }

      const sorted = originData.sort((a, b) => Number(b.year) - Number(a.year));
      setData(sorted);
      const sortedYears = sorted.map((item) => item.year).filter(Boolean);
      setYears(sortedYears);
      if (sortedYears.length > 0) setSelectedYear(sortedYears[0]);
    } catch (err) {
      console.error('❌ Error loading data/map:', err);
      setError(`Failed to load data: ${err.message}`);
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Build chart
  useEffect(() => {
    if (!isModuleLoaded || !phMap || !selectedYear || data.length === 0) return;

    const currentYearData = data.find((d) => d.year === selectedYear);
    if (!currentYearData) return;

    const choroplethData = [];

    Object.keys(PROVINCE_DB_MAP).forEach((prov) => {
      const dbKey = PROVINCE_DB_MAP[prov];
      const val = currentYearData[dbKey];
      const norm = normalizeProvinceName(prov);
      const entry = mapKeyLookup[norm];
      if (!entry || val === undefined || val === null || val === '') return;
      const numVal = Number(val);
      if (!isNaN(numVal) && numVal > 0) {
        choroplethData.push({
          'hc-key': entry.hcKey,
          name: entry.displayName,
          value: numVal
        });
      }
    });

    const values = choroplethData.map(d => d.value);
    const maxValue = Math.max(...values, 1);
    const minValue = Math.min(...values.filter(v => v > 0), 1);

    const options = {
      chart: {
        map: phMap,
        height: compact ? 400 : 520,
        backgroundColor: 'transparent',
        spacingTop: 10,
        spacingBottom: 10,
        spacingLeft: 10,
        spacingRight: 10
      },
      title: {
        text: null
      },
      mapNavigation: {
        enabled: true,
        buttonOptions: {
          verticalAlign: 'bottom',
          align: 'right',
          theme: {
            fill: '#0B0C4A',
            'stroke-width': 1,
            stroke: '#4020A0',
            r: 4,
            states: {
              hover: {
                fill: '#2C2089'
              },
              select: {
                stroke: '#6B23A9',
                fill: '#4020A0'
              }
            }
          }
        }
      },
      colorAxis: {
        min: minValue,
        max: maxValue,
        type: values.length > 0 && maxValue / minValue > 100 ? 'logarithmic' : 'linear',
        minColor: '#F095AA',
        maxColor: '#0B0C4A',
        labels: {
          formatter: function() {
            return this.value.toLocaleString();
          },
          style: {
            color: '#6B23A9',
            fontSize: '11px',
            fontWeight: '500'
          }
        }
      },
      legend: {
        enabled: true,
        layout: 'vertical',
        align: 'left',
        verticalAlign: 'bottom',
        borderRadius: 8,
        padding: 12,
        backgroundColor: 'rgba(11, 12, 74, 0.05)',
        borderColor: '#9C2DA9',
        borderWidth: 1,
        itemStyle: {
          color: '#2C2089',
          fontSize: '12px',
          fontWeight: '500'
        }
      },
      tooltip: {
        backgroundColor: '#0B0C4A',
        borderColor: '#9C2DA9',
        borderWidth: 2,
        borderRadius: 8,
        shadow: {
          color: 'rgba(156, 45, 169, 0.3)',
          offsetX: 0,
          offsetY: 2,
          opacity: 0.5,
          width: 4
        },
        useHTML: true,
        formatter: function() {
          const value = this.point.value;
          const formattedValue = (value || 0).toLocaleString();
          return `<div style="padding: 8px;">
            <div style="font-weight: 600; font-size: 14px; margin-bottom: 6px; color: #F095AA;">${this.point.name}</div>
            <div style="color: #E17AA2; font-weight: 700; font-size: 18px;">${formattedValue}</div>
            <div style="font-size: 11px; color: #C14F9E; margin-top: 2px;">emigrants</div>
          </div>`;
        }
      },
      series: [
        {
          type: 'map',
          name: 'Emigrant Count',
          mapData: phMap,
          data: choroplethData,
          joinBy: ['hc-key', 'hc-key'],
          borderColor: '#2C2089',
          borderWidth: 0.8,
          nullColor: '#f3f4f6',
          allAreas: true,
          states: {
            hover: {
              color: '#9C2DA9',
              borderColor: '#6B23A9',
              borderWidth: 2
            }
          },
          dataLabels: {
            enabled: false
          }
        }
      ],
      credits: { enabled: false }
    };

    setChartOptions(options);
  }, [isModuleLoaded, phMap, selectedYear, data, compact]);

  // Loading state
  if (isDataLoading || !isModuleLoaded) {
    return (
      <div style={{ padding: '20px' }}>
        <h2 className="content-title" style={{ marginBottom: '20px' }}>
          Philippine Emigrant Place of Origin
        </h2>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '400px',
          border: '2px solid #dee2e6',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              border: '6px solid #f3f4f6',
              borderTop: '6px solid #4020A0',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              animation: 'spin 1.2s linear infinite',
              margin: '0 auto 16px'
            }}></div>
            <p style={{ color: '#6c757d', fontSize: '14px' }}>
              {!isModuleLoaded ? 'Loading map module...' : 'Loading data...'}
            </p>
          </div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // No data state
  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '20px' }}>
        <h2 className="content-title" style={{ marginBottom: '20px' }}>
          Philippine Emigrant Place of Origin
        </h2>
        {error && (
          <div style={{
            marginBottom: '16px',
            padding: '12px 16px',
            background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
            border: '2px solid #ef4444',
            borderRadius: '8px',
            color: '#991b1b',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '400px',
          border: '2px solid #dee2e6',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
        }}>
          <p style={{ color: '#6c757d', fontSize: '14px' }}>No place of origin data available.</p>
        </div>
      </div>
    );
  }

  // Calculate total emigrants for selected year
  const totalEmigrants = selectedYear && data.find(d => d.year === selectedYear)
    ? Object.keys(PROVINCE_DB_MAP).reduce((sum, key) => {
        const dataYear = data.find(d => d.year === selectedYear);
        const dbKey = PROVINCE_DB_MAP[key];
        const value = dataYear[dbKey];
        return sum + (Number(value) || 0);
      }, 0)
    : 0;

  const provinceCount = Object.keys(PROVINCE_DB_MAP).length;

  return (
    <div style={{ padding: '20px', background: 'white' }}>
      <h2 className="content-title" style={{ marginBottom: '20px' }}>
        Philippine Emigrant Place of Origin
      </h2>

      {error && (
        <div style={{
          marginBottom: '16px',
          padding: '12px 16px',
          background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
          border: '2px solid #ef4444',
          borderRadius: '8px',
          color: '#991b1b',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      {!compact && (
        <div style={{ 
          marginBottom: '20px', 
          display: 'flex', 
          flexWrap: 'wrap', 
          alignItems: 'center', 
          gap: '16px',
          padding: '16px',
          background: 'linear-gradient(135deg, #171d24 0%, #6b3481 100%)',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label htmlFor="year-select" style={{ 
              fontSize: '12px', 
              color: '#9ca3af', 
              marginBottom: '6px',
              fontWeight: '500'
            }}>
              Select Year
            </label>
            <select
              id="year-select"
              style={{
                border: '2px solid #475569',
                borderRadius: '8px',
                padding: '10px 14px',
                minWidth: '140px',
                fontSize: '14px',
                fontWeight: '600',
                outline: 'none',
                background: 'white',
                color: '#1f2937',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              value={selectedYear || ''}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {selectedYear && (
            <div style={{
              padding: '12px 20px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{ fontSize: '13px', color: '#e5e7eb', lineHeight: '1.6' }}>
                <span style={{ fontWeight: '700', color: '#F095AA' }}>{provinceCount}</span> provinces
                <span style={{ margin: '0 8px', color: '#475569' }}>•</span>
                <span style={{ fontWeight: '700', color: '#F095AA' }}>{totalEmigrants.toLocaleString()}</span> total emigrants
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{
        width: '100%',
        border: '2px solid #dee2e6',
        borderRadius: '12px',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
        minHeight: compact ? '400px' : '520px'
      }}>
        {chartOptions ? (
          <HighchartsReact
            highcharts={Highcharts}
            options={chartOptions}
            constructorType="mapChart"
          />
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%'
          }}>
            <p style={{ color: '#6c757d', fontSize: '14px' }}>Select a year to view the map</p>
          </div>
        )}
      </div>

      {!compact && selectedYear && (
        <div style={{ marginTop: '32px' }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px'
          }}>
            Top Provinces ({selectedYear})
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '12px'
          }}>
            {Object.keys(PROVINCE_DB_MAP)
              .map(key => {
                const dataYear = data.find(d => d.year === selectedYear);
                const dbKey = PROVINCE_DB_MAP[key];
                const value = dataYear ? Number(dataYear[dbKey]) || 0 : 0;
                return {
                  name: key,
                  value: value
                };
              })
              .filter(p => p.value > 0)
              .sort((a, b) => b.value - a.value)
              .slice(0, 20)
              .map((province) => (
                <div 
                  key={province.name} 
                  style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    border: '2px solid #dee2e6',
                    borderRadius: '10px',
                    padding: '14px 16px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.2s',
                    cursor: 'default'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(107, 35, 169, 0.15)';
                    e.currentTarget.style.borderColor = '#6B23A9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
                    e.currentTarget.style.borderColor = '#dee2e6';
                  }}
                >
                  <div style={{
                    fontWeight: '600',
                    color: '#1f2937',
                    fontSize: '13px',
                    marginBottom: '6px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }} title={province.name}>
                    {province.name}
                  </div>
                  <div style={{
                    color: '#6B23A9',
                    fontWeight: '700',
                    fontSize: '20px',
                    marginBottom: '2px'
                  }}>
                    {province.value.toLocaleString()}
                  </div>
                  <div style={{
                    color: '#6c757d',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    emigrants
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PhilippinesChoropleth;