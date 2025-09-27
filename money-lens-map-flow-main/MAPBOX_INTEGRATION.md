# Mapbox Integration Guide

## Overview
This application integrates with Mapbox to provide interactive geographic visualization of spending data.

## Setup Instructions

### 1. Get a Mapbox Access Token
1. Visit [mapbox.com](https://mapbox.com)
2. Sign up for a free account
3. Go to your [Account page](https://account.mapbox.com/access-tokens/)
4. Create a new access token or use the default public token
5. Copy the token (starts with `pk.`)

### 2. Configure the Token
1. Open the application
2. Navigate to **Settings** page
3. Scroll down to **Map Configuration** section
4. Paste your Mapbox token in the "Mapbox Access Token" field
5. Click **Save Map Settings**

### 3. Use the Map
1. Navigate to the **Map** page
2. The interactive map will load with your spending data
3. Click on merchant markers to see details
4. Use the sidebar to select different merchants
5. Use map controls to zoom and navigate

## Features

### Interactive Map
- **Merchant Markers**: Clickable pins showing spending locations
- **Popups**: Detailed information when clicking markers
- **Navigation**: Zoom in/out, reset north orientation
- **Responsive**: Works on desktop and mobile devices

### Map Controls
- **Zoom In/Out**: Adjust map zoom level
- **Reset North**: Reset map orientation
- **Spending Heatmap**: Toggle spending intensity visualization
- **Merchant Pins**: Toggle merchant location markers

### Data Visualization
- **Spending Intensity**: Color-coded heatmap showing spending patterns
- **Merchant Details**: Sidebar with detailed merchant information
- **Location Search**: Search for specific locations
- **Category Filtering**: Filter merchants by spending category

## Technical Details

### Context Management
- Mapbox token is stored in `localStorage`
- Context provides global access to Mapbox configuration
- Automatic validation and error handling

### Map Initialization
- Map loads only when token is configured
- Automatic cleanup on component unmount
- Responsive design with proper sizing

### Error Handling
- Graceful fallback when token is missing
- Loading states during map initialization
- User-friendly error messages

## Troubleshooting

### Map Not Loading
1. Check if Mapbox token is configured in Settings
2. Verify token is valid and has proper permissions
3. Check browser console for error messages
4. Ensure internet connection is working

### Performance Issues
1. Reduce number of markers if map is slow
2. Use appropriate zoom levels for data density
3. Consider clustering for large datasets

### Token Issues
1. Verify token starts with `pk.`
2. Check token permissions in Mapbox account
3. Ensure token is not expired
4. Try creating a new token

## Development

### Adding New Features
1. Update `MapboxContext` for new configuration options
2. Modify `MapView` component for new map features
3. Update Settings page for new configuration options
4. Add proper error handling and validation

### Customization
- Map styles can be changed in `MapView.tsx`
- Marker styles can be customized
- Popup content can be modified
- Map controls can be added/removed
