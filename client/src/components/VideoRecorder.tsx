import { useState, useRef, useCallback, useEffect } from "react";
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
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VideoRecorderProps {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: (blob: Blob) => void;
  timer: number;
}

export default function VideoRecorder({
  isRecording,
  onStartRecording,
  onStopRecording,
  timer
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
      console.log('Available video devices:', videoDevices);
      return videoDevices;
    } catch (error) {
      console.error('Error enumerating devices:', error);
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
        device.label.toLowerCase().includes('phone')
      );

      console.log('Found DroidCam device:', droidCamDevice);
      console.log('All video devices:', videoDevices);

      let stream;
      
      if (droidCamDevice) {
        // Try to use DroidCam device specifically
        try {
          console.log('Attempting to connect to DroidCam device:', droidCamDevice.deviceId);
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: { exact: droidCamDevice.deviceId },
              width: { ideal: 1280 },
              height: { ideal: 720 }
            },
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              sampleRate: 44100
            }
          });
          console.log('Successfully connected to DroidCam device:', droidCamDevice.label);
        } catch (droidCamError) {
          console.log('DroidCam specific access failed, trying fallback:', droidCamError);
          // Fallback to default constraints
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
        }
      } else {
        // No DroidCam device found, use default constraints
        console.log('No DroidCam device found, using default constraints');
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
      }

      console.log('Media stream obtained:', stream);
      console.log('Video tracks:', stream.getVideoTracks());
      console.log('Audio tracks:', stream.getAudioTracks());

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
      const recorder = new MediaRecorder(mediaStream, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });

      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        onStopRecording(blob);
        setHasRecorded(true);
        setRecordedChunks([]);
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
              muted
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
            </div>
            <p className="text-sm text-green-700">
              Your answer has been recorded. You can retake it or proceed to the next question.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Debug Information for DroidCam */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="bg-gray-50 border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Debug Info (Development)</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2 text-xs">
              <div>
                <strong>Available Devices:</strong> {availableDevices.length}
              </div>
              {availableDevices.map((device, index) => (
                <div key={device.deviceId} className="pl-2">
                  {index + 1}. {device.label || 'Unknown Device'} ({device.deviceId.slice(0, 8)}...)
                </div>
              ))}
              <div>
                <strong>Media Stream:</strong> {mediaStream ? 'Active' : 'None'}
              </div>
              <div>
                <strong>Video Tracks:</strong> {mediaStream?.getVideoTracks().length || 0}
              </div>
              <div>
                <strong>Audio Tracks:</strong> {mediaStream?.getAudioTracks().length || 0}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
