/**
 * Layout Customization Panel Component
 * Allows users to adjust board area sizes and save custom layouts.
 * Includes sliders, preview, and preset management.
 */

import React, { useState } from 'react';
import { useLayout } from '../contexts/LayoutContext';
import { LayoutPreset, LayoutArea } from '../lib/layoutTypes';

interface LayoutCustomizationPanelProps {
  onClose?: () => void;
}

/**
 * Panel for customizing and managing layout preferences.
 * Provides sliders for each area, save/load/reset functionality.
 */
export function LayoutCustomizationPanel({
  onClose,
}: LayoutCustomizationPanelProps) {
  const layout = useLayout();
  const [showPresets, setShowPresets] = useState(false);
  const [customName, setCustomName] = useState('');
  const [previewLayout, setPreviewLayout] = useState<LayoutPreset | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const currentLayout = previewLayout || layout.currentLayout;

  /**
   * Updates a single area's width percentage.
   */
  const handleAreaWidthChange = (areaId: string, percent: number) => {
    const updated = {
      ...currentLayout,
      areas: {
        ...currentLayout.areas,
        [areaId]: {
          ...currentLayout.areas[areaId],
          widthPercent: Math.max(10, Math.min(100, percent)),
        },
      },
    };
    setPreviewLayout(updated);
    validateLayout(updated);
  };

  /**
   * Updates a single area's height percentage.
   */
  const handleAreaHeightChange = (areaId: string, percent: number) => {
    const updated = {
      ...currentLayout,
      areas: {
        ...currentLayout.areas,
        [areaId]: {
          ...currentLayout.areas[areaId],
          heightPercent: Math.max(10, Math.min(100, percent)),
        },
      },
    };
    setPreviewLayout(updated);
    validateLayout(updated);
  };

  /**
   * Validates layout for common issues.
   */
  const validateLayout = (preset: LayoutPreset) => {
    const errors: string[] = [];

    Object.entries(preset.areas).forEach(([areaId, area]) => {
      // Check minimum sizes
      if (area.constraints?.minWidth && (area.width || 100) < area.constraints.minWidth) {
        errors.push(`${area.name} is below minimum width`);
      }
      if (area.constraints?.minHeight && (area.height || 100) < area.constraints.minHeight) {
        errors.push(`${area.name} is below minimum height`);
      }

      // Check touch target (44px minimum for interactive elements)
      if (areaId === 'actions' && (area.height || 50) < 44) {
        errors.push('Action buttons must be at least 44px high for accessibility');
      }
    });

    setValidationErrors(errors);
  };

  /**
   * Saves the current layout.
   */
  const handleSaveLayout = () => {
    if (validationErrors.length > 0) {
      alert('Cannot save layout with validation errors:\n' + validationErrors.join('\n'));
      return;
    }
    if (previewLayout) {
      layout.setCustomLayout(previewLayout);
    }
    layout.saveCurrentLayout();
    alert('Layout saved!');
    setPreviewLayout(null);
  };

  /**
   * Saves layout with a custom name.
   */
  const handleSaveAs = () => {
    if (!customName.trim()) {
      alert('Please enter a layout name');
      return;
    }
    if (validationErrors.length > 0) {
      alert('Cannot save layout with validation errors');
      return;
    }
    if (previewLayout) {
      layout.setCustomLayout(previewLayout);
    }
    layout.saveLayoutAs(customName);
    alert(`Layout saved as "${customName}"`);
    setCustomName('');
    setPreviewLayout(null);
  };

  /**
   * Resets to default layout.
   */
  const handleResetLayout = () => {
    if (confirm('Reset layout to defaults?')) {
      layout.resetToDefault(layout.defaultLayout);
      setPreviewLayout(null);
      setValidationErrors([]);
    }
  };

  /**
   * Resets all saved layouts.
   */
  const handleClearAll = () => {
    if (confirm('Delete all saved layouts? This cannot be undone.')) {
      layout.clearAllPreferences();
      setPreviewLayout(null);
    }
  };

  return (
    <div className="layout-customization-panel">
      <div className="panel-header">
        <h2>Layout Customization</h2>
        <button className="close-button" onClick={onClose} aria-label="Close panel">
          ✕
        </button>
      </div>

      <div className="panel-content">
        {/* Validation errors */}
        {validationErrors.length > 0 && (
          <div className="error-section">
            <h3>Issues:</h3>
            <ul>
              {validationErrors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Area sliders */}
        <div className="sliders-section">
          <h3>Adjust Areas</h3>

          {Object.entries(currentLayout.areas).map(([areaId, area]) => (
            <div key={areaId} className="slider-group">
              <label htmlFor={`width-${areaId}`}>{area.name} Width</label>
              <input
                id={`width-${areaId}`}
                type="range"
                min="10"
                max="100"
                value={area.widthPercent || 50}
                onChange={(e) => handleAreaWidthChange(areaId, parseInt(e.target.value))}
                className="slider"
              />
              <span className="slider-value">{area.widthPercent || 50}%</span>

              <label htmlFor={`height-${areaId}`}>{area.name} Height</label>
              <input
                id={`height-${areaId}`}
                type="range"
                min="10"
                max="100"
                value={area.heightPercent || 50}
                onChange={(e) => handleAreaHeightChange(areaId, parseInt(e.target.value))}
                className="slider"
              />
              <span className="slider-value">{area.heightPercent || 50}%</span>
            </div>
          ))}
        </div>

        {/* Save options */}
        <div className="save-section">
          <h3>Save Layout</h3>
          <button className="btn btn-primary" onClick={handleSaveLayout}>
            Save Current Layout
          </button>

          <div className="save-as-group">
            <input
              type="text"
              placeholder="Custom layout name (e.g., 'Compact')"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="input-text"
            />
            <button className="btn btn-secondary" onClick={handleSaveAs}>
              Save As
            </button>
          </div>
        </div>

        {/* Load presets */}
        {Object.keys(layout.savedLayouts).length > 0 && (
          <div className="presets-section">
            <h3>Saved Layouts</h3>
            <button
              className="btn btn-secondary"
              onClick={() => setShowPresets(!showPresets)}
            >
              {showPresets ? 'Hide' : 'Show'} Saved Layouts
            </button>

            {showPresets && (
              <ul className="preset-list">
                {Object.entries(layout.savedLayouts).map(([name, preset]) => (
                  <li key={name} className="preset-item">
                    <button
                      className="btn btn-tertiary"
                      onClick={() => layout.loadSavedLayout(name)}
                    >
                      Load: {name}
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => layout.deleteSavedLayout(name)}
                      title="Delete this layout"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Reset options */}
        <div className="reset-section">
          <h3>Reset</h3>
          <button className="btn btn-warning" onClick={handleResetLayout}>
            Reset to Default Layout
          </button>
          <button className="btn btn-danger" onClick={handleClearAll}>
            Clear All Saved Layouts
          </button>
        </div>
      </div>
    </div>
  );
}
