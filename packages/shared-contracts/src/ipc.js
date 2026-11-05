"use strict";
/**
 * PulsePause Shared Contracts: Electron IPC Channels
 * Strictly-typed IPC message definitions between Electron Main and Renderer
 * Matching official Presage SmartSpectra SDK Node / Electron guidelines
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IPC_CHANNELS = void 0;
exports.IPC_CHANNELS = {
    // Engine Lifecycle
    ENGINE_GET_STATUS: 'pulsepause:engine:get-status',
    ENGINE_START: 'pulsepause:engine:start',
    ENGINE_PAUSE: 'pulsepause:engine:pause',
    ENGINE_RESUME: 'pulsepause:engine:resume',
    ENGINE_STOP: 'pulsepause:engine:stop',
    ENGINE_DESTROY: 'pulsepause:engine:destroy',
    // Camera Management
    CAMERA_LIST: 'pulsepause:camera:list',
    CAMERA_SELECT: 'pulsepause:camera:select',
    // Real-Time Events (Main -> Renderer)
    EVENT_SIGNAL: 'pulsepause:event:signal',
    EVENT_VALIDATION: 'pulsepause:event:validation',
    EVENT_STATUS: 'pulsepause:event:status',
    EVENT_ERROR: 'pulsepause:event:error',
    EVENT_PREVIEW: 'pulsepause:event:preview'
};
