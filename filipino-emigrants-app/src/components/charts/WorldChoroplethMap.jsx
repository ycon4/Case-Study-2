import React, { useEffect, useState, useCallback } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

// Import real services
import { getData, collections } from '../../services/emigrantsService';

// Load map module
const initMapModules = async () => {
  try {
    const mapModule = await import('highcharts/modules/map.js');
    if (mapModule && typeof mapModule.default === 'function') {
      mapModule.default(Highcharts);
    }
    console.log("Highcharts Map module loaded.");
    return true;
  } catch (e) {
    console.error("Could not load Highcharts modules:", e);
    return false;
  }
};
initMapModules();

// Map database keys to ISO-A2 codes required by Highcharts world map
const COUNTRY_MAP_KEYS = {
  'usa': { label: 'USA', mapKey: 'us' },
  'canada': { label: 'Canada', mapKey: 'ca' },
  'japan': { label: 'Japan', mapKey: 'jp' },
  'australia': { label: 'Australia', mapKey: 'au' },
  'italy': { label: 'Italy', mapKey: 'it' },
  'newZealand': { label: 'New Zealand', mapKey: 'nz' },
  'unitedKingdom': { label: 'United Kingdom', mapKey: 'gb' },
  'germany': { label: 'Germany', mapKey: 'de' },
  'southKorea': { label: 'South Korea', mapKey: 'kr' },
  'spain': { label: 'Spain', mapKey: 'es' },
};

function WorldChoroplethMap({ compact = false }) {
  const [data, setData] = useState([]);
  const [years, setYears] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isModuleLoaded, setIsModuleLoaded] = useState(false);
  const [selectedYear, setSelectedYear] = useState(null);
  const [chartOptions, setChartOptions] = useState(null);
  const [worldMap, setWorldMap] = useState(null);
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

  // Fetch data (map and emigrants)
  const loadData = useCallback(async () => {
    setIsDataLoading(true);
    setError(null);
    try {
      console.log('Loading data from collection:', collections.majorCountries);
      const [countriesData, mapData] = await Promise.all([
        getData(collections.majorCountries),
        fetch('https://code.highcharts.com/mapdata/custom/world.geo.json').then(res => res.json())
      ]);

      console.log('Countries data loaded:', countriesData);
      console.log('First record structure:', countriesData[0]);
      console.log('Map data loaded:', mapData ? 'Success' : 'Failed');

      if (!countriesData || countriesData.length === 0) {
        setError('No emigrant data found. Please ensure data exists in the majorCountries collection.');
        setIsDataLoading(false);
        return;
      }

      setWorldMap(mapData);

      // Sort by year descending - try multiple possible year field names
      const sortedData = countriesData.sort((a, b) => {
        const yearB = Number(b.year || b.YEAR || b.Year || 0);
        const yearA = Number(a.year || a.YEAR || a.Year || 0);
        return yearB - yearA;
      });
      setData(sortedData);

      // Extract unique years - check multiple possible field names
      const sortedYears = sortedData
        .map(item => item.year || item.YEAR || item.Year)
        .filter(Boolean)
        .filter((year, index, self) => self.indexOf(year) === index); // Remove duplicates
      
      console.log('Years found:', sortedYears);
      console.log('Year field values:', sortedData.map(d => ({YEAR: d.YEAR, year: d.year, Year: d.Year})));
      setYears(sortedYears);

      // Set most recent year as default
      if (sortedYears.length > 0) {
        setSelectedYear(sortedYears[0]);
      } else {
        setError('No year data found in records.');
      }
    } catch (err) {
      console.error("Failed to fetch map or data:", err);
      setError(`Failed to load data: ${err.message}`);
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Build chart options when all dependencies are ready
  useEffect(() => {
    if (!isModuleLoaded || isDataLoading || !selectedYear || !worldMap || data.length === 0) {
      return;
    }

    const dataYear = data.find(d => (d.year || d.YEAR || d.Year) === selectedYear);
    if (!dataYear) return;

    console.log('Selected year data:', dataYear);
    console.log('All fields in record:', Object.keys(dataYear));

    // Helper function to clean string data saved from CSV
    const cleanValue = (val) => {
      if (val === null || val === undefined || val === '') return 0;
      const cleaned = String(val).replace(/,/g, '').trim();
      return Number(cleaned) || 0;
    };

    // Transform data for the choropleth series
    const choroplethData = Object.keys(COUNTRY_MAP_KEYS).map(dbKey => {
      const mapInfo = COUNTRY_MAP_KEYS[dbKey];
      const rawValue = dataYear[dbKey];
      const cleanedValue = cleanValue(rawValue);

      console.log(`Country: ${dbKey}, Raw value: ${rawValue}, Cleaned: ${cleanedValue}`);

      return {
        'hc-key': mapInfo.mapKey,
        name: mapInfo.label,
        value: cleanedValue
      };
    }).filter(item => item.value > 0);

    // Determine max value for color axis
    const values = choroplethData.map(d => d.value);
    const maxValue = Math.max(...values, 1);
    const minValue = Math.min(...values.filter(v => v > 0), 1);

    const options = {
      chart: {
        map: worldMap,
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
        minColor: '#F095AA',  // Light pink for low values
        maxColor: '#0B0C4A',  // Deep navy for high values
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
          mapData: worldMap,
          data: choroplethData,
          joinBy: ['hc-key', 'hc-key'],
          borderColor: '#2C2089',
          borderWidth: 0.8,
          nullColor: '#f3f4f6',
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
  }, [data, selectedYear, worldMap, isModuleLoaded, isDataLoading, compact]);

  // Loading state
  if (isDataLoading || !isModuleLoaded) {
    return (
      <div style={{ padding: '20px' }}>
        <h2 className="content-title" style={{ marginBottom: '20px' }}>
          Major Emigrant Destinations
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
              borderTop: '6px solid #1e3c72',
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
          Major Emigrant Destinations
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
          <p style={{ color: '#6c757d', fontSize: '14px' }}>No emigrant data available.</p>
        </div>
      </div>
    );
  }

  // Calculate total emigrants for selected year
  const totalEmigrants = selectedYear && data.find(d => d.year === selectedYear)
    ? Object.keys(COUNTRY_MAP_KEYS).reduce((sum, key) => {
        const dataYear = data.find(d => d.year === selectedYear);
        const value = String(dataYear[key] || '0').replace(/,/g, '');
        return sum + (Number(value) || 0);
      }, 0)
    : 0;

  return (
    <div style={{ padding: '20px', background: 'white' }}>
      <h2 className="content-title" style={{ marginBottom: '20px' }}>
        Major Emigrant Destinations
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
                <span style={{ fontWeight: '700', color: '#F095AA' }}>{Object.keys(COUNTRY_MAP_KEYS).length}</span> countries
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
            All Destinations ({selectedYear})
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '12px'
          }}>
            {Object.keys(COUNTRY_MAP_KEYS)
              .map(key => {
                const dataYear = data.find(d => d.year === selectedYear);
                const rawValue = dataYear ? dataYear[key] : '0';
                const value = Number(String(rawValue || '0').replace(/,/g, '')) || 0;
                return {
                  name: COUNTRY_MAP_KEYS[key].label,
                  value: value
                };
              })
              .sort((a, b) => b.value - a.value)
              .map((country) => (
                <div 
                  key={country.name} 
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
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(30, 60, 114, 0.15)';
                    e.currentTarget.style.borderColor = '#4c2a7e';
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
                  }} title={country.name}>
                    {country.name}
                  </div>
                  <div style={{
                    color: '#4c2a7e',
                    fontWeight: '700',
                    fontSize: '20px',
                    marginBottom: '2px'
                  }}>
                    {country.value.toLocaleString()}
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

export default WorldChoroplethMap;