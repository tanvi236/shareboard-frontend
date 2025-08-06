import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Download, 
  Grid3X3, 
  Eye, 
  EyeOff,
  MousePointer
} from 'lucide-react';
import { Button } from '../../styles/GlobalStyles';

const ToolbarContainer = styled.div`
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ToolbarGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding-right: 12px;
  border-right: 1px solid #e2e8f0;

  &:last-child {
    border-right: none;
  }
`;

const ZoomLevel = styled.span`
  font-size: 14px;
  color: #4a5568;
  min-width: 40px;
  text-align: center;
`;

// Fixed: Added shouldForwardProp to prevent active prop from going to DOM
const ToggleButton = styled(Button).withConfig({
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active: boolean }>`
  background: ${props => props.active ? '#667eea' : '#f7fafc'};
  color: ${props => props.active ? 'white' : '#4a5568'};
  
  &:hover {
    background: ${props => props.active ? '#5a67d8' : '#edf2f7'};
  }
`;

const BoardToolbar: React.FC = () => {
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(true);
  const [showCursors, setShowCursors] = useState(true);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 25));
  };

  const handleResetZoom = () => {
    setZoom(100);
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export board');
  };

  return (
    <ToolbarContainer>
      <ToolbarGroup>
        <Button variant="secondary" onClick={handleZoomOut}>
          <ZoomOut size={16} />
        </Button>
        <ZoomLevel>{zoom}%</ZoomLevel>
        <Button variant="secondary" onClick={handleZoomIn}>
          <ZoomIn size={16} />
        </Button>
        <Button variant="secondary" onClick={handleResetZoom}>
          <RotateCcw size={16} />
        </Button>
      </ToolbarGroup>

      <ToolbarGroup>
        <ToggleButton 
          active={showGrid}
          onClick={() => setShowGrid(!showGrid)}
          variant="secondary"
        >
          <Grid3X3 size={16} />
          Grid
        </ToggleButton>
        
        <ToggleButton 
          active={showCursors}
          onClick={() => setShowCursors(!showCursors)}
          variant="secondary"
        >
          {showCursors ? <Eye size={16} /> : <EyeOff size={16} />}
          Cursors
        </ToggleButton>
      </ToolbarGroup>

      <ToolbarGroup>
        <Button variant="secondary">
          <MousePointer size={16} />
          Select
        </Button>
      </ToolbarGroup>

      <ToolbarGroup>
        <Button variant="secondary" onClick={handleExport}>
          <Download size={16} />
          Export
        </Button>
      </ToolbarGroup>
    </ToolbarContainer>
  );
};

export default BoardToolbar;
