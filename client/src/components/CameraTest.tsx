import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, VideoOff, RefreshCw, Settings, Info } from "lucide-react";

export default function CameraTest() {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string>('');
  const [deviceInfo, setDeviceInfo] = useState<any>({});
  
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    enumerateDevices();
  }, []);

  const enumerateDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);
      
      // Log all devices for debugging
      console.log('All devices:', devices);
      console.log('Video devices:', videoDevices);
      
      if (videoDevices.length > 0) {
        setSelectedDevice(videoDevices[0].deviceId);
      }
    } catch (err) {
      console.error('Error enumerating devices:', err);
      setError('Failed to enumerate devices');
    }
  };

  const startStream = async () => {
    if (!selectedDevice) return;
    
    try {
      setError('');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: selectedDevice },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      
      setStream(mediaStream);
      setIsStreaming(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      // Get device capabilities
      const track = mediaStream.getVideoTracks()[0];
      if (track) {
        const capabilities = track.getCapabilities();
        const settings = track.getSettings();
        setDeviceInfo({ capabilities, settings });
        console.log('Device capabilities:', capabilities);
        console.log('Device settings:', settings);
      }
      
    } catch (err: any) {
      console.error('Error starting stream:', err);
      setError(err.message || 'Failed to start stream');
      setIsStreaming(false);
    }
  };

  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsStreaming(false);
      setDeviceInfo({});
    }
  };

  const refreshDevices = () => {
    stopStream();
    enumerateDevices();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Video className="h-5 w-5 text-blue-600" />
            <span>DroidCam Test Utility</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Button onClick={refreshDevices} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Devices
            </Button>
            <Badge variant="outline">
              {devices.length} camera{devices.length !== 1 ? 's' : ''} detected
            </Badge>
          </div>

          {devices.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Camera:</label>
              <select
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                {devices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${device.deviceId.slice(0, 8)}...`}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex space-x-2">
            {!isStreaming ? (
              <Button onClick={startStream} disabled={!selectedDevice}>
                <Video className="h-4 w-4 mr-2" />
                Start Test Stream
              </Button>
            ) : (
              <Button onClick={stopStream} variant="destructive">
                <VideoOff className="h-4 w-4 mr-2" />
                Stop Stream
              </Button>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Video Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Video Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video">
            {isStreaming ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>No active stream</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Device Information */}
      {Object.keys(deviceInfo).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="h-5 w-5 text-green-600" />
              <span>Device Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deviceInfo.capabilities && (
                <div>
                  <h4 className="font-medium mb-2">Capabilities:</h4>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(deviceInfo.capabilities, null, 2)}
                  </pre>
                </div>
              )}
              
              {deviceInfo.settings && (
                <div>
                  <h4 className="font-medium mb-2">Current Settings:</h4>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(deviceInfo.settings, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Troubleshooting Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-orange-600" />
            <span>DroidCam Troubleshooting</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>1. Ensure DroidCam is running:</strong> Open DroidCam app on your phone</p>
            <p><strong>2. Check connection:</strong> Make sure phone and computer are on same network</p>
            <p><strong>3. Enable USB debugging:</strong> If using USB connection, enable USB debugging on phone</p>
            <p><strong>4. Check firewall:</strong> Allow DroidCam through Windows firewall</p>
            <p><strong>5. Restart DroidCam:</strong> Sometimes restarting the app helps</p>
            <p><strong>6. Check browser permissions:</strong> Ensure camera access is allowed</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
