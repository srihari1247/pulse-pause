"use strict";
/**
 * PulsePause Shared Contracts: Validation & Signal Quality Rules
 * Strict thresholds for optical rPPG and respiratory signal acceptance
 * Directly matching the official Presage SmartSpectra SDK validation states
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BIOMETRIC_CONSTRAINTS = void 0;
exports.buildValidationReport = buildValidationReport;
exports.determineSignalQuality = determineSignalQuality;
exports.evaluateSignalQuality = evaluateSignalQuality;
exports.BIOMETRIC_CONSTRAINTS = {
    PULSE_MIN_BPM: 40,
    PULSE_MAX_BPM: 200,
    RESPIRATION_MIN_BRPM: 4,
    RESPIRATION_MAX_BRPM: 45,
    MIN_ACCEPTABLE_CONFIDENCE: 0.55,
    OPTIMAL_CONFIDENCE: 0.80,
    MIN_COVERAGE_RATIO: 0.25,
    OPTIMAL_COVERAGE_RATIO: 0.45
};
/**
 * Standard SDK validation status parser
 */
function buildValidationReport(input) {
    const reasons = [];
    const recommendations = [];
    const faceDetected = input.faceDetected ?? true;
    const lighting = input.lighting ?? 'OPTIMAL';
    const motion = input.motion ?? 'STABLE';
    const positioning = input.positioning ?? 'CENTERED';
    const confidence = input.confidence ?? 0;
    let status = 'VALID';
    if (!faceDetected) {
        status = 'NO_FACE_DETECTED';
        reasons.push('Face not detected in camera viewport');
        recommendations.push('Center your face directly in the frame looking at the camera');
    }
    else if (lighting === 'UNDEREXPOSED') {
        status = 'INSUFFICIENT_LIGHTING';
        reasons.push('Lighting is too dark for optical microvascular rPPG');
        recommendations.push('Increase front lighting or sit facing a light source');
    }
    else if (lighting === 'OVEREXPOSED') {
        status = 'INSUFFICIENT_LIGHTING';
        reasons.push('Harsh backlighting or camera glare');
        recommendations.push('Adjust backlight or angle camera to reduce glare');
    }
    else if (motion === 'EXCESSIVE_MOTION') {
        status = 'EXCESSIVE_MOTION';
        reasons.push('Excessive head movement disrupted rPPG signal baseline');
        recommendations.push('Rest comfortably and minimize talking or head turns');
    }
    else if (positioning === 'TOO_CLOSE' || positioning === 'TOO_FAR' || positioning === 'OFF_CENTER') {
        status = 'POOR_FACE_POSITIONING';
        reasons.push(`Face positioning is ${positioning.toLowerCase().replace('_', ' ')}`);
        recommendations.push('Align your face within the forehead ROI reticle at ~0.6m distance');
    }
    else if (confidence < exports.BIOMETRIC_CONSTRAINTS.MIN_ACCEPTABLE_CONFIDENCE) {
        status = 'CALIBRATING';
        reasons.push('Calibrating optical signal baseline');
        recommendations.push('Hold steady while initial rPPG waveform stabilizes');
    }
    return {
        status,
        lighting,
        motion,
        positioning,
        faceDetected,
        confidence,
        reasons,
        recommendations
    };
}
function determineSignalQuality(report, confidence) {
    if (report.status === 'NO_FACE_DETECTED' || !report.faceDetected) {
        return 'UNAVAILABLE';
    }
    if (report.status === 'EXCESSIVE_MOTION' || report.status === 'INSUFFICIENT_LIGHTING' || confidence < exports.BIOMETRIC_CONSTRAINTS.MIN_ACCEPTABLE_CONFIDENCE) {
        return 'UNRELIABLE';
    }
    if (report.status === 'POOR_FACE_POSITIONING' || confidence < exports.BIOMETRIC_CONSTRAINTS.OPTIMAL_CONFIDENCE) {
        return 'DEGRADED';
    }
    return 'OPTIMAL';
}
function evaluateSignalQuality(sample, quality) {
    const report = buildValidationReport({
        faceDetected: quality?.faceDetected,
        lighting: quality?.lightingQuality,
        motion: quality?.motionStability === 'HIGH_ARTIFACTS' ? 'EXCESSIVE_MOTION' : quality?.motionStability === 'MODERATE_MOTION' ? 'MODERATE_MOTION' : 'STABLE',
        positioning: quality?.distanceQuality === 'TOO_CLOSE' ? 'TOO_CLOSE' : quality?.distanceQuality === 'TOO_FAR' ? 'TOO_FAR' : 'CENTERED',
        confidence: sample?.confidence
    });
    return {
        isValid: report.status === 'VALID',
        level: report.status === 'VALID' ? 'OPTIMAL' : report.status === 'CALIBRATING' ? 'CALIBRATING' : report.status === 'POOR_FACE_POSITIONING' ? 'DEGRADED' : 'UNUSABLE',
        reasons: report.reasons,
        recommendations: report.recommendations
    };
}
