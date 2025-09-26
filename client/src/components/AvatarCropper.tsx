import React from 'react';
import ReactCrop, { Crop as CropType, centerCrop, makeAspectCrop } from 'react-image-crop';

type AvatarCropperProps = {
  imageSrc: string;
  onReady?: (img: HTMLImageElement) => void;
  onComplete: (img: HTMLImageElement, crop: CropType) => void;
};

// 使用独立组件 + RAF 节流，显著降低父组件重渲染频率
const AvatarCropper: React.FC<AvatarCropperProps> = ({ imageSrc, onReady, onComplete }) => {
  const [crop, setCrop] = React.useState<CropType>();
  const [completedCrop, setCompletedCrop] = React.useState<CropType>();
  const imgRef = React.useRef<HTMLImageElement | null>(null);

  // RAF 节流：避免每次 pointermove 都触发 setState
  const rafRef = React.useRef<number | null>(null);
  const pendingCropRef = React.useRef<CropType | null>(null);

  const setCropRaf = React.useCallback((next: CropType) => {
    pendingCropRef.current = next;
    if (rafRef.current == null) {
      rafRef.current = window.requestAnimationFrame(() => {
        if (pendingCropRef.current) {
          setCrop(pendingCropRef.current);
          pendingCropRef.current = null;
        }
        if (rafRef.current != null) {
          window.cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
      });
    }
  }, []);

  const onImageLoad = React.useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (onReady) onReady(img);
    const displayWidth = img.naturalWidth;
    const displayHeight = img.naturalHeight;
    const initial = centerCrop(
      makeAspectCrop(
        { unit: '%', width: 80 },
        1,
        displayWidth,
        displayHeight
      ),
      displayWidth,
      displayHeight
    );
    setCrop(initial);
  }, [onReady]);

  React.useEffect(() => {
    return () => {
      if (rafRef.current != null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  React.useEffect(() => {
    if (imgRef.current && completedCrop && completedCrop.width && completedCrop.height) {
      onComplete(imgRef.current, completedCrop);
    }
  }, [completedCrop, onComplete]);

  return (
    <div style={{ width: '100%', maxWidth: 600 }}>
      <ReactCrop
        crop={crop}
        onChange={(_, percent) => setCropRaf(percent)}
        onComplete={(c) => setCompletedCrop(c)}
        aspect={1}
        minWidth={50}
        minHeight={50}
        keepSelection
      >
        <img
          ref={imgRef}
          src={imageSrc}
          onLoad={onImageLoad}
          alt="裁剪图片"
          style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
        />
      </ReactCrop>
    </div>
  );
};

export default React.memo(AvatarCropper);


