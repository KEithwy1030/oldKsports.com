import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

interface BrowserCompatibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  isSogouBrowser?: boolean;
}

const BrowserCompatibleModal: React.FC<BrowserCompatibleModalProps> = ({
  isOpen,
  onClose,
  children,
  isSogouBrowser = false
}) => {
  const [modalRoot, setModalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // 创建或获取modal容器
    let modalContainer = document.getElementById('modal-root');
    
    if (!modalContainer) {
      modalContainer = document.createElement('div');
      modalContainer.id = 'modal-root';
      modalContainer.style.position = 'fixed';
      modalContainer.style.top = '0';
      modalContainer.style.left = '0';
      modalContainer.style.right = '0';
      modalContainer.style.bottom = '0';
      modalContainer.style.zIndex = isSogouBrowser ? '999999' : '9999';
      modalContainer.style.pointerEvents = 'none';
      document.body.appendChild(modalContainer);
    }
    
    setModalRoot(modalContainer);
    
    return () => {
      // 清理函数 - 不删除容器，因为可能被其他modal使用
    };
  }, [isSogouBrowser]);

  useEffect(() => {
    if (isOpen) {
      // 防止页面滚动
      document.body.style.overflow = 'hidden';
      // 确保modal容器可以接收事件
      if (modalRoot) {
        modalRoot.style.pointerEvents = 'auto';
      }
    } else {
      document.body.style.overflow = 'unset';
      if (modalRoot) {
        modalRoot.style.pointerEvents = 'none';
      }
    }

    return () => {
      document.body.style.overflow = 'unset';
      if (modalRoot) {
        modalRoot.style.pointerEvents = 'none';
      }
    };
  }, [isOpen, modalRoot]);

  if (!isOpen || !modalRoot) {
    return null;
  }

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: isSogouBrowser ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: isSogouBrowser ? 999999 : 9999
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {children}
    </div>
  );

  return ReactDOM.createPortal(modalContent, modalRoot);
};

export default BrowserCompatibleModal;
