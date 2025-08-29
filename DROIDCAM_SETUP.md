# DroidCam Setup Guide for InterviewCoach

## Overview
This guide helps you set up DroidCam to use your phone's camera as an external webcam for the InterviewCoach application.

## Prerequisites
- Android phone with DroidCam app installed
- Computer with InterviewCoach running
- Both devices on the same network (WiFi) or connected via USB

## Step-by-Step Setup

### 1. Install DroidCam on Your Phone
- Download DroidCam from Google Play Store
- Install and open the app
- Grant camera and microphone permissions

### 2. Install DroidCam on Your Computer
- Download DroidCam from [https://www.dev47apps.com/](https://www.dev47apps.com/)
- Install the application
- Run DroidCam on your computer

### 3. Connect Your Phone
#### WiFi Connection (Recommended)
1. Make sure both devices are on the same WiFi network
2. Open DroidCam on your phone
3. Note the IP address shown on your phone (e.g., 192.168.1.100:4747)
4. On your computer, open DroidCam and enter the IP address
5. Click "Start" to establish connection

#### USB Connection (Alternative)
1. Enable USB debugging on your phone:
   - Go to Settings > About Phone
   - Tap "Build Number" 7 times to enable Developer Options
   - Go to Settings > Developer Options > USB Debugging
   - Enable USB Debugging
2. Connect your phone to computer via USB
3. Allow USB debugging when prompted on your phone
4. In DroidCam on your computer, select "USB" mode

### 4. Test the Connection
1. In DroidCam on your computer, you should see your phone's camera feed
2. If successful, you'll see a live video stream

## Troubleshooting Common Issues

### Black Screen Issue
**Problem**: Camera shows black screen in InterviewCoach

**Solutions**:
1. **Check DroidCam Status**:
   - Ensure DroidCam is running on both devices
   - Verify connection status in DroidCam app

2. **Browser Permissions**:
   - Allow camera access when prompted
   - Check browser settings for camera permissions
   - Try refreshing the page after granting permissions

3. **Device Detection**:
   - Use the "Test Camera" button in InterviewCoach
   - Check browser console for device enumeration logs
   - Verify DroidCam appears in the device list

4. **Restart Services**:
   - Close DroidCam on both devices
   - Restart DroidCam on your phone first
   - Then restart DroidCam on your computer
   - Refresh the InterviewCoach page

### Camera Not Detected
**Problem**: InterviewCoach doesn't detect any cameras

**Solutions**:
1. **Check DroidCam Connection**:
   - Ensure DroidCam is properly connected
   - Try switching between WiFi and USB modes
   - Restart both DroidCam applications

2. **Browser Issues**:
   - Try a different browser (Chrome, Firefox, Edge)
   - Clear browser cache and cookies
   - Disable browser extensions temporarily

3. **Firewall Settings**:
   - Allow DroidCam through Windows Firewall
   - Check antivirus software settings
   - Ensure no security software is blocking camera access

### Poor Video Quality
**Problem**: Video is blurry or low resolution

**Solutions**:
1. **DroidCam Settings**:
   - Increase video quality in DroidCam app
   - Set resolution to 720p or 1080p
   - Ensure good lighting on your phone

2. **Network Issues** (WiFi mode):
   - Move closer to WiFi router
   - Reduce network congestion
   - Use 5GHz WiFi if available

3. **Phone Settings**:
   - Clean phone camera lens
   - Ensure good lighting
   - Close other apps using the camera

## Using the Camera Test Utility

InterviewCoach includes a built-in camera test utility to help diagnose issues:

1. **Access the Test**: Click "Test Camera" button in the interview page header
2. **Device Detection**: See all available cameras and their status
3. **Test Streams**: Test individual camera connections
4. **Debug Info**: View detailed device capabilities and settings
5. **Troubleshooting**: Get specific error messages and solutions

## Advanced Troubleshooting

### Check Device Manager
1. Open Device Manager on Windows
2. Look for "Imaging devices" or "Cameras"
3. DroidCam should appear as a virtual camera
4. If not present, reinstall DroidCam

### Browser Console Debugging
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Look for camera-related error messages
4. Check for device enumeration logs

### Alternative Solutions
1. **Try Different DroidCam Versions**:
   - Download older or newer versions
   - Some versions work better with certain devices

2. **Use Different Connection Methods**:
   - Switch between WiFi and USB
   - Try different USB cables
   - Test with different WiFi networks

3. **Alternative Apps**:
   - EpocCam
   - iVCam
   - Webcamoid

## Performance Optimization

### For Best Results:
1. **Use USB Connection**: Generally more stable than WiFi
2. **Good Lighting**: Ensure your phone has adequate lighting
3. **Close Other Apps**: Free up phone resources
4. **Stable Network**: Use reliable WiFi connection
5. **Regular Updates**: Keep DroidCam updated

### Recommended Settings:
- **Video Quality**: High (720p or 1080p)
- **Frame Rate**: 30 FPS
- **Audio Quality**: High
- **Connection**: USB (if possible)

## Getting Help

If you're still experiencing issues:

1. **Check Console Logs**: Look for specific error messages
2. **Test with Camera Test Utility**: Use the built-in testing tool
3. **Verify DroidCam Works**: Test in other applications first
4. **Check System Requirements**: Ensure your system meets requirements
5. **Contact Support**: Provide detailed error messages and system info

## System Requirements

- **Windows**: Windows 10 or later
- **Browser**: Chrome 80+, Firefox 75+, Edge 80+
- **Network**: Stable WiFi or USB 2.0+ connection
- **Phone**: Android 6.0+ with DroidCam app
- **RAM**: 4GB+ recommended
- **Storage**: 100MB+ free space

---

**Note**: DroidCam is a third-party application. InterviewCoach is not responsible for DroidCam functionality or compatibility issues.
