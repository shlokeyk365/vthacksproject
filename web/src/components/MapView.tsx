import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Merchant } from '../lib/api';
import MerchantCard from './MerchantCard';
import HeatLegend from './HeatLegend';
import toast from 'react-hot-toast';

interface MapViewProps {
  merchants: Merchant[];
  onMerchantSelect: (merchant: Merchant) => void;
  selectedMerchant: Merchant | null;
  onTransactionSimulated: () => void;
}

const BLACKSBURG_COORDS = { lat: 37.2296, lng: -80.4139 };
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const MapView: React.FC<MapViewProps> = ({
  merchants,
  onMerchantSelect,
  selectedMerchant,
  onTransactionSimulated
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [useMapbox, setUseMapbox] = useState(!!MAPBOX_TOKEN);
  const [showList, setShowList] = useState(!MAPBOX_TOKEN);

  useEffect(() => {
    if (useMapbox && mapContainer.current && !map.current) {
      initializeMapbox();
    }
  }, [useMapbox]);

  const initializeMapbox = () => {
    if (!MAPBOX_TOKEN) {
      setUseMapbox(false);
      setShowList(true);
      return;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [BLACKSBURG_COORDS.lng, BLACKSBURG_COORDS.lat],
      zoom: 15
    });

    map.current.on('load', () => {
      setMapLoaded(true);
      addMerchantsToMap();
    });

    map.current.on('error', (e) => {
      console.error('Mapbox error:', e);
      toast.error('Map failed to load. Switching to list view.');
      setUseMapbox(false);
      setShowList(true);
    });
  };

  const addMerchantsToMap = () => {
    if (!map.current || !mapLoaded) return;

    // Clear existing sources and layers
    if (map.current.getSource('merchants')) {
      map.current.removeLayer('merchants-heatmap');
      map.current.removeLayer('merchants-points');
      map.current.removeSource('merchants');
    }

    // Prepare data for heatmap
    const heatmapData = merchants.map(merchant => ({
      type: 'Feature',
      properties: {
        id: merchant.merchant_id,
        name: merchant.name,
        category: merchant.category,
        last30_spend: merchant.last30_spend,
        mtd_spend: merchant.mtd_spend,
        monthly_budget_left: merchant.monthly_budget_left,
        over_cap: merchant.over_cap,
        locked: merchant.locked
      },
      geometry: {
        type: 'Point',
        coordinates: [merchant.lng, merchant.lat]
      }
    }));

    // Add heatmap source
    map.current.addSource('merchants', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: heatmapData
      }
    });

    // Add heatmap layer
    map.current.addLayer({
      id: 'merchants-heatmap',
      type: 'heatmap',
      source: 'merchants',
      maxzoom: 15,
      paint: {
        'heatmap-weight': [
          'interpolate',
          ['linear'],
          ['get', 'last30_spend'],
          0, 0,
          100, 1
        ],
        'heatmap-intensity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0, 1,
          15, 3
        ],
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0, 'rgba(0, 0, 255, 0)',
          0.1, 'rgb(0, 255, 0)',
          0.3, 'rgb(255, 255, 0)',
          0.5, 'rgb(255, 165, 0)',
          0.7, 'rgb(255, 0, 0)',
          1, 'rgb(128, 0, 128)'
        ],
        'heatmap-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0, 2,
          15, 20
        ],
        'heatmap-opacity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          7, 1,
          15, 0
        ]
      }
    });

    // Add points layer
    map.current.addLayer({
      id: 'merchants-points',
      type: 'circle',
      source: 'merchants',
      minzoom: 14,
      paint: {
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          7, [
            'interpolate',
            ['linear'],
            ['get', 'last30_spend'],
            0, 5,
            100, 15
          ],
          15, [
            'interpolate',
            ['linear'],
            ['get', 'last30_spend'],
            0, 10,
            100, 30
          ]
        ],
        'circle-color': [
          'case',
          ['get', 'locked'], '#ef4444', // red if locked
          ['get', 'over_cap'], '#f59e0b', // orange if over cap
          '#3b82f6' // blue otherwise
        ],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
        'circle-opacity': 0.8
      }
    });

    // Add click handler
    map.current.on('click', 'merchants-points', (e) => {
      if (e.features && e.features[0]) {
        const feature = e.features[0];
        const merchant = merchants.find(m => m.merchant_id === feature.properties.id);
        if (merchant) {
          onMerchantSelect(merchant);
        }
      }
    });

    // Change cursor on hover
    map.current.on('mouseenter', 'merchants-points', () => {
      if (map.current) {
        map.current.getCanvas().style.cursor = 'pointer';
      }
    });

    map.current.on('mouseleave', 'merchants-points', () => {
      if (map.current) {
        map.current.getCanvas().style.cursor = '';
      }
    });
  };

  useEffect(() => {
    if (mapLoaded && merchants.length > 0) {
      addMerchantsToMap();
    }
  }, [merchants, mapLoaded]);

  const simulateGeofenceEnter = (merchant: Merchant) => {
    const percentage = merchant.monthly_budget_left > 0 
      ? ((merchant.mtd_spend / (merchant.mtd_spend + merchant.monthly_budget_left)) * 100)
      : 100;

    if (percentage >= 100) {
      toast.error(`⛔ Cap hit. Card locked for ${merchant.name}.`);
    } else if (percentage >= 80) {
      toast.error(`⚠ Near your cap at ${merchant.name} (${Math.round(percentage)}% used).`);
    } else {
      toast.success(`📍 Entered zone: ${merchant.name}`);
    }
  };

  if (showList || !useMapbox) {
    return (
      <div className="h-screen flex flex-col">
        <div className="bg-white border-b p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Merchants Near Blacksburg, VA</h2>
            <button
              onClick={() => setShowList(false)}
              className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700"
            >
              Try Map View
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {merchants.map(merchant => (
            <div
              key={merchant.merchant_id}
              className="bg-white rounded-lg shadow-sm border p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onMerchantSelect(merchant)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{merchant.name}</h3>
                  <p className="text-sm text-gray-500">{merchant.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    ${merchant.mtd_spend.toFixed(2)} MTD
                  </p>
                  <p className="text-xs text-gray-500">
                    ${merchant.monthly_budget_left.toFixed(2)} left
                  </p>
                </div>
              </div>
              {merchant.locked && (
                <div className="mt-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full inline-block">
                  CARD LOCKED
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen relative">
      <div ref={mapContainer} className="h-full w-full" />
      
      {mapLoaded && (
        <>
          <HeatLegend merchants={merchants} />
          
          {selectedMerchant && (
            <div className="absolute top-4 left-4 right-4 z-10">
              <MerchantCard
                merchant={selectedMerchant}
                onClose={() => onMerchantSelect(null as any)}
                onSimulateTransaction={onTransactionSimulated}
                onSimulateGeofence={() => simulateGeofenceEnter(selectedMerchant)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MapView;
