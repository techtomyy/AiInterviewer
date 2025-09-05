import { useState, useRef, useCallback, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Play, 
  Square, 
  Pause, 
  RotateCcw, 
  Video, 
  VideoOff,
  Mic,
  MicOff,
  Volume2,
  Eye,
  Settings,
  RefreshCw,
  Upload,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

interface VideoRecorderProps {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: (blob: Blob) => void;
  timer: number;
  sessionId?: string; // optional session ID for retake upload
}

export default function VideoRecorder({
  isRecording,
  onStartRecording,
  onStopRecording,
  timer,
  sessionId
}: VideoRecorderProps) {
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>();
  const { toast } = useToast();

  // Initialize media stream
  useEffect(() => {
    initializeMedia();
    return () => {
      cleanup();
    };
  }, []);

  // Setup audio analysis for volume monitoring
  useEffect(() => {
    if (mediaStream && isAudioEnabled) {
      setupAudioAnalysis();
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mediaStream, isAudioEnabled]);

  const enumerateDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setAvailableDevices(videoDevices);
      return videoDevices;
    } catch (error) {
      return [];
    }
  };

  const initializeMedia = async () => {
    setIsInitializing(true);
    try {
      // First enumerate devices to help with DroidCam detection
      const videoDevices = await enumerateDevices();
      
      // Try to find DroidCam device first
      const droidCamDevice = videoDevices.find(device =>
        device.label.toLowerCase().includes('droidcam') ||
        device.label.toLowerCase().includes('virtual') ||
        device.label.toLowerCase().includes('webcam') ||
        device.label.toLowerCase().includes('android') ||
        device.label.toLowerCase().includes('phone') ||
        device.label.toLowerCase().includes('ip camera') ||
        device.label.toLowerCase().includes('network')
      );

      let stream;

      if (droidCamDevice) {
        // Try to use DroidCam device specifically with relaxed constraints
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: { exact: droidCamDevice.deviceId },
              width: { ideal: 1280, min: 640 },
              height: { ideal: 720, min: 480 },
              frameRate: { ideal: 30, min: 15 }
            },
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              sampleRate: 44100
            }
          });
        } catch (droidCamError) {
          console.log('DroidCam specific constraints failed, trying relaxed constraints:', droidCamError);
          // Fallback to relaxed constraints for DroidCam
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: {
                deviceId: { exact: droidCamDevice.deviceId },
                width: { ideal: 640 },
                height: { ideal: 480 }
              },
              audio: {
                echoCancellation: false,
                noiseSuppression: false
              }
            });
          } catch (relaxedError) {
            console.log('Relaxed DroidCam constraints failed, trying any video:', relaxedError);
            // Last resort - try any video device
            stream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: true
            });
          }
        }
      } else {
        // No DroidCam device found, use default constraints
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 }
            },
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              sampleRate: 44100
            }
          });
        } catch (defaultError) {
          console.log('Default constraints failed, trying basic video:', defaultError);
          // Fallback to basic constraints
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
          });
        }
      }

      setMediaStream(stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Wait for video to load
        videoRef.current.onloadedmetadata = () => {
          console.log('Video loaded successfully');
          console.log('Video dimensions:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight);
          setIsInitializing(false);
        };
        
        // Add error handling for video
        videoRef.current.onerror = (error) => {
          console.error('Video error:', error);
          setIsInitializing(false);
        };
      }

      toast({
        title: "Camera Ready",
        description: droidCamDevice 
          ? `Connected to ${droidCamDevice.label}` 
          : "Your camera and microphone are connected successfully.",
      });
    } catch (error) {
      console.error('Error accessing media devices:', error);
      setIsInitializing(false);
      
      let errorMessage = "Unable to access camera or microphone. Please check your permissions.";
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = "Camera access denied. Please allow camera permissions and refresh the page.";
        } else if (error.name === 'NotFoundError') {
          errorMessage = "No camera found. Please ensure DroidCam is running and connected.";
        } else if (error.name === 'NotReadableError') {
          errorMessage = "Camera is in use by another application. Please close other apps using the camera.";
        } else if (error.name === 'OverconstrainedError') {
          errorMessage = "Camera constraints not supported. Please check DroidCam settings.";
        } else if (error.name === 'TypeError') {
          errorMessage = "Camera initialization error. Please restart DroidCam and refresh the page.";
        }
      }
      
      toast({
        title: "Media Access Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const retryCamera = async () => {
    cleanup();
    await initializeMedia();
  };

  const setupAudioAnalysis = () => {
    if (!mediaStream) return;

    try {
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(mediaStream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      const updateVolumeLevel = () => {
        if (!analyserRef.current) return;

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        const average = dataArray.reduce((a, b) => a + b) / bufferLength;
        setVolumeLevel(Math.min(100, (average / 128) * 100));

        animationRef.current = requestAnimationFrame(updateVolumeLevel);
      };

      updateVolumeLevel();
    } catch (error) {
      console.error('Error setting up audio analysis:', error);
    }
  };

  const startRecording = async () => {
    if (!mediaStream) {
      toast({
        title: "No Media Stream",
        description: "Please ensure camera and microphone access is granted.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Try different MIME types for better compatibility
      // Prioritize formats that are widely supported for both recording and playback
      let mimeType = 'video/webm;codecs=vp8,opus'; // VP8 is more widely supported than VP9
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp9,opus';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            // Last resort - try basic video without specific codecs
            mimeType = 'video/webm';
          }
        }
      }

      console.log('Using MIME type:', mimeType);
      console.log('Available MIME types:');
      const supportedTypes = [
        'video/webm;codecs=vp8,opus',
        'video/webm;codecs=vp9,opus',
        'video/webm',
        'video/mp4'
      ];
      supportedTypes.forEach(type => {
        console.log(`${type}: ${MediaRecorder.isTypeSupported(type)}`);
      });

      const recorder = new MediaRecorder(mediaStream, {
        mimeType: mimeType
      });

      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: mimeType });
        console.log('Recording stopped, blob size:', blob.size, 'bytes, type:', blob.type);

        // Validate blob before proceeding
        if (blob.size === 0) {
          console.error('Error: Recorded blob is empty');
          toast({
            title: "Recording Error",
            description: "The recorded video appears to be empty. Please try recording again.",
            variant: "destructive",
          });
          return;
        }

        // Check if blob type matches expected MIME type
        if (blob.type !== mimeType && blob.type !== 'video/webm') {
          console.warn('Blob type mismatch:', blob.type, 'expected:', mimeType);
        }

        // Try to validate the video by creating a temporary video element
        try {
          const testVideo = document.createElement('video');
          const testUrl = URL.createObjectURL(blob);
          testVideo.src = testUrl;

          await new Promise((resolve, reject) => {
            testVideo.onloadedmetadata = () => {
              console.log('Video validation successful - duration:', testVideo.duration, 'dimensions:', testVideo.videoWidth, 'x', testVideo.videoHeight);
              URL.revokeObjectURL(testUrl);
              resolve(true);
            };
            testVideo.onerror = (e) => {
              console.error('Video validation failed:', e);
              URL.revokeObjectURL(testUrl);
              reject(new Error('Video validation failed'));
            };
            testVideo.load();
          });
        } catch (validationError) {
          console.error('Video validation error:', validationError);
          toast({
            title: "Video Validation Error",
            description: "The recorded video appears to be corrupted. Please try recording again.",
            variant: "destructive",
          });
          return;
        }

        handleStopRecording(blob);
      };

      recorder.start(1000); // Collect data every second
      setMediaRecorder(recorder);
      setRecordedChunks(chunks);
      onStartRecording();

      toast({
        title: "Recording Started",
        description: "Your interview session is now being recorded.",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Failed to start recording. Please try again.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setMediaRecorder(null);
      
      toast({
        title: "Recording Stopped",
        description: "Your answer has been recorded successfully.",
      });
    }
  };

  const uploadVideo = async (blob: Blob) => {
    setIsUploading(true);
    setUploadStatus('idle');

    const [, navigate] = useLocation();

    try {
      // Get current user session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        // User session is invalid, redirect to auth
        localStorage.removeItem('supabase_token');
        // Use React Router navigation instead of window.location
        navigate('/auth');
        throw new Error("Session expired. Please sign in again.");
      }

      const userEmail = session.user?.email;

      if (!userEmail) {
        throw new Error("User not authenticated");
      }

      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      
      return new Promise<string>((resolve, reject) => {
        reader.onload = async () => {
          try {
            const base64Data = reader.result as string;
            const base64Content = base64Data.split(',')[1]; // Remove data:video/webm;base64, prefix
            
            // Determine API endpoint based on sessionId prop
            const base = `${(import.meta as any).env?.VITE_API_URL || 'http://localhost:5000'}`;
            const apiUrl = sessionId ? `${base}/api/candidate/upload` : `${base}/api/candidate/session`;
            console.log(`Attempting to upload video to ${apiUrl}`);

            const formData = new FormData();
            formData.append('video', blob, `interview_${Date.now()}.webm`);
            formData.append('title', 'Interview Session');
            if (sessionId) {
              formData.append('sessionId', sessionId);
            }

            console.log('FormData created with blob size:', blob.size, 'type:', blob.type);
            console.log('Blob MIME type:', blob.type);
            console.log('Uploading to:', apiUrl);

            // Log blob details for debugging
            console.log('Blob details:', {
              size: blob.size,
              type: blob.type,
              lastModified: blob instanceof File ? blob.lastModified : 'N/A'
            });

      const token = localStorage.getItem('supabase_token');
      console.log('Token from localStorage:', token);
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

            console.log('Upload response status:', response.status);
            console.log('Upload response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
              // Read the response body only once
              let errorMessage = 'Upload failed';
              try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorData.message || 'Upload failed';
                console.error("Upload error response:", errorData);
              } catch (parseError) {
                console.error("Failed to parse error response:", parseError);
                errorMessage = `Upload failed with status ${response.status}`;
              }
              throw new Error(errorMessage);
            }

            const result = await response.json();
            console.log("Upload successful result:", result);
            setUploadedVideoUrl(result.url);
            setUploadStatus('success');
            
            toast({
              title: "Video Uploaded",
              description: "Your video has been successfully saved to the cloud.",
              variant: "default",
            });
            
            resolve(result.url);
          } catch (error) {
            console.error('Upload error:', error);
            setUploadStatus('error');
            
            toast({
              title: "Upload Failed",
              description: error instanceof Error ? error.message : "Failed to upload video. Please try again.",
              variant: "destructive",
            });
            
            reject(error);
          } finally {
            setIsUploading(false);
          }
        };

        reader.onerror = () => {
          setIsUploading(false);
          setUploadStatus('error');
          reject(new Error("Failed to read video file"));
        };
      });
    } catch (error) {
      setIsUploading(false);
      setUploadStatus('error');
      throw error;
    }
  };

  const handleStopRecording = async (blob: Blob) => {
    onStopRecording(blob);
    setHasRecorded(true);
    setRecordedChunks([]);
  };

  const toggleVideo = () => {
    if (mediaStream) {
      const videoTracks = mediaStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !isVideoEnabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const toggleAudio = () => {
    if (mediaStream) {
      const audioTracks = mediaStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !isAudioEnabled;
      });
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  const retakeVideo = () => {
    setHasRecorded(false);
    setRecordedChunks([]);
  };

  const cleanup = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Video Preview */}
      <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video">
        {mediaStream ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
              data-testid="video-preview"
            />
            
            {/* Recording Status Overlay */}
            {isRecording && (
              <div className="absolute top-4 left-4 flex items-center space-x-2 bg-red-600/90 backdrop-blur-sm rounded-full px-3 py-1">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-white text-sm font-medium">REC</span>
              </div>
            )}

            {/* Timer Overlay */}
            <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg px-3 py-1">
              <span className="text-white font-mono text-sm" data-testid="video-timer">
                {formatTime(timer)}
              </span>
            </div>

            {/* Device Info Overlay */}
            {availableDevices.length > 0 && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm rounded-lg px-3 py-1">
                <span className="text-white text-xs">
                  {availableDevices.length} camera{availableDevices.length !== 1 ? 's' : ''} detected
                </span>
              </div>
            )}

            {/* Real-time AI Feedback Overlay */}
            <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 max-w-xs">
              <div className="flex items-center space-x-2 mb-2">
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                  isRecording ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
                <span className="text-sm font-medium text-gray-800">
                  {isRecording ? 'AI Analysis' : 'Ready'}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Eye Contact</span>
                  <span className="text-green-600 font-medium">Good</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Speech Clarity</span>
                  <span className="text-green-600 font-medium">Excellent</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Volume Level</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-8 bg-gray-200 rounded-full h-1">
                      <div 
                        className="bg-primary h-1 rounded-full transition-all duration-100"
                        style={{ width: `${volumeLevel}%` }}
                      ></div>
                    </div>
                    <span className={`text-xs font-medium ${
                      volumeLevel < 20 ? 'text-red-600' : 
                      volumeLevel > 80 ? 'text-yellow-600' : 
                      'text-green-600'
                    }`}>
                      {volumeLevel < 20 ? 'Low' : 
                       volumeLevel > 80 ? 'High' : 
                       'Good'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recording Controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="flex items-center space-x-4 bg-black/80 backdrop-blur-sm rounded-full px-6 py-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleVideo}
                  className={`text-white hover:bg-white/20 ${!isVideoEnabled ? 'bg-red-600' : ''}`}
                  data-testid="button-toggle-video"
                >
                  {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleAudio}
                  className={`text-white hover:bg-white/20 ${!isAudioEnabled ? 'bg-red-600' : ''}`}
                  data-testid="button-toggle-audio"
                >
                  {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </Button>

                {!isRecording ? (
                  <Button
                    onClick={startRecording}
                    className="w-12 h-12 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center"
                    data-testid="button-start-recording"
                  >
                    <Play className="text-white h-5 w-5 ml-0.5" />
                  </Button>
                ) : (
                  <Button
                    onClick={stopRecording}
                    className="w-12 h-12 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center"
                    data-testid="button-stop-recording"
                  >
                    <Square className="text-white h-4 w-4" />
                  </Button>
                )}

                {hasRecorded && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={retakeVideo}
                    className="text-white hover:bg-white/20"
                    data-testid="button-retake"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={retryCamera}
                  className="text-white hover:bg-white/20"
                  title="Refresh camera connection"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              {isInitializing ? (
                <>
                  <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-white text-lg mb-2">Initializing camera...</p>
                  <p className="text-gray-300 text-sm">Please allow camera and microphone access</p>
                </>
              ) : (
                <>
                  <Video className="text-white h-16 w-16 mx-auto mb-4" />
                  <p className="text-white text-lg mb-2">Camera not available</p>
                  <p className="text-gray-300 text-sm mb-4">Please check DroidCam connection</p>
                  <Button
                    onClick={retryCamera}
                    variant="outline"
                    className="text-white border-white hover:bg-white hover:text-gray-900"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry Camera
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gray-50">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              {isVideoEnabled ? (
                <Eye className="h-4 w-4 text-green-500" />
              ) : (
                <VideoOff className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm font-medium">Camera</span>
            </div>
            <Badge variant={isVideoEnabled ? "default" : "destructive"}>
              {isVideoEnabled ? 'Active' : 'Disabled'}
            </Badge>
            {availableDevices.length > 1 && (
              <div className="mt-2">
                <select 
                  className="text-xs border rounded px-2 py-1 w-full"
                  onChange={(e) => {
                    const device = availableDevices.find(d => d.deviceId === e.target.value);
                    if (device) {
                      console.log('Switching to device:', device.label);
                      // Reinitialize with specific device
                      cleanup();
                      initializeMedia();
                    }
                  }}
                >
                  {availableDevices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Camera ${device.deviceId.slice(0, 8)}...`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gray-50">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              {isAudioEnabled ? (
                <Volume2 className="h-4 w-4 text-green-500" />
              ) : (
                <MicOff className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm font-medium">Microphone</span>
            </div>
            <Badge variant={isAudioEnabled ? "default" : "destructive"}>
              {isAudioEnabled ? 'Active' : 'Disabled'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {hasRecorded && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Badge className="bg-green-600 text-white">Recording Complete</Badge>
              {isUploading && (
                <div className="flex items-center space-x-2 ml-2">
                  <div className="animate-spin w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full"></div>
                  <span className="text-sm text-green-700">Uploading...</span>
                </div>
              )}
              {uploadStatus === 'success' && (
                <div className="flex items-center space-x-2 ml-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700">Uploaded</span>
                </div>
              )}
              {uploadStatus === 'error' && (
                <div className="flex items-center space-x-2 ml-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-700">Upload Failed</span>
                </div>
              )}
            </div>
            <p className="text-sm text-green-700 mb-2">
              Your answer has been recorded. {uploadStatus === 'success' && 'Video saved to cloud storage.'}
            </p>
            {uploadedVideoUrl && (
              <div className="mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(uploadedVideoUrl, '_blank')}
                  className="text-xs"
                >
                  <Upload className="h-3 w-3 mr-1" />
                  View Uploaded Video
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Debug Information for DroidCam removed as per user request */}
    </div>
  );
}
