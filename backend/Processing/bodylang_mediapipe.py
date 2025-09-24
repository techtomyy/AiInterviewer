
# bodylang_mediapipe.py
import cv2
import mediapipe as mp
import numpy as np

mp_face = mp.solutions.face_mesh
mp_pose = mp.solutions.pose

def compute_head_pose(landmarks, image_w, image_h):
    # landmarks: face landmarks normalized; use nose(1), left/right eye centers, etc.
    # Simplified: compute vector from nose tip to midpoint of eyes to infer yaw/pitch
    # You can refine with solvePnP for 3D head pose if you have 3D model points.
    pass

def analyze_video(video_path, sample_rate_fps=2):
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS) or 30
    frame_skip = max(1, int(fps // sample_rate_fps))
    face_mesh = mp_face.FaceMesh(static_image_mode=False, max_num_faces=1)
    pose = mp_pose.Pose(static_image_mode=False)
    total_frames = 0
    eye_contact_frames = 0
    posture_scores = []
    frame_idx = 0
    while True:
        ret, frame = cap.read()
        if not ret: break
        if frame_idx % frame_skip != 0:
            frame_idx += 1
            continue
        total_frames += 1
        h, w, _ = frame.shape
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        f_res = face_mesh.process(rgb)
        p_res = pose.process(rgb)
        # Eye-contact heuristic:
        if f_res.multi_face_landmarks:
            lm = f_res.multi_face_landmarks[0].landmark
            # compute eye center and iris position if available, or use ratio of eye aspect to center
            left_eye = np.array([lm[33].x * w, lm[33].y * h]) # approximate
            right_eye = np.array([lm[263].x * w, lm[263].y * h])
            nose = np.array([lm[1].x * w, lm[1].y * h])
            eye_mid = (left_eye + right_eye) / 2
            nose_vec = nose - eye_mid
            # yaw: x offset; pitch: y offset -- small offsets => looking at camera
            if abs(nose_vec[0]) < 0.08 * w and abs(nose_vec[1]) < 0.06 * h:
                eye_contact_frames += 1
        # posture:
        if p_res.pose_landmarks:
            pl = p_res.pose_landmarks.landmark
            left_sh = np.array([pl[11].x*w, pl[11].y*h])
            right_sh = np.array([pl[12].x*w, pl[12].y*h])
            left_hip = np.array([pl[23].x*w, pl[23].y*h])
            right_hip = np.array([pl[24].x*w, pl[24].y*h])
            shoulder_mid = (left_sh + right_sh) / 2
            hip_mid = (left_hip + right_hip) / 2
            torso_vec = hip_mid - shoulder_mid
            # torso angle from vertical:
            angle_deg = abs(np.degrees(np.arctan2(torso_vec[0], torso_vec[1])))
            # normalize angle to score: 0 deg -> perfect (100), >30deg -> low
            score = max(0, 100 - (angle_deg * 3))  # heuristic
            posture_scores.append(score)
        frame_idx += 1
    cap.release()
    eye_contact_pct = (eye_contact_frames / total_frames) * 100 if total_frames else 0
    posture_score = float(np.mean(posture_scores)) if posture_scores else 0.0
    return {"eye_contact_pct": round(eye_contact_pct, 2), "posture_score": round(posture_score,2)}
