/* EduManage — Root app: providers + cổng xác thực + modal tài khoản bị khóa */
import React from 'react';
import { I } from './components/icons';
import { Modal, ToastHost } from './components/ui';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginUser from './pages/login/LoginUser';
import MainLayout from './layouts/MainLayout';

// Component gốc: hiển thị màn đăng nhập / ứng dụng chính và modal tài khoản bị khóa
function Root() {
  const { lang } = useApp();
  const { lockedMessage, clearLockedMessage, logout } = useAuth();

  // Đóng modal tài khoản bị khóa rồi đăng xuất
  function handleLockedOk() {
    clearLockedMessage();
    logout();
  }

  return (
    <>
      <LoginUser renderApp={(user, onSignOut) => <MainLayout key={user.id} apiUser={user} onSignOut={onSignOut} />} />
      <Modal
        open={!!lockedMessage}
        onClose={handleLockedOk}
        icon={<I.lock size={22} />}
        title={lang === 'vi' ? 'Tài khoản đã bị khóa' : 'Account Locked'}
        tone="danger"
        footer={
          <button className="btn btn-primary" onClick={handleLockedOk}>
            {lang === 'vi' ? 'Đã hiểu' : 'OK'}
          </button>
        }
      >
        {lockedMessage}
      </Modal>
    </>
  );
}

// Điểm vào ứng dụng: bọc các Provider (theme/ngôn ngữ, toast, xác thực) quanh Root
export default function App() {
  return (
    <AppProvider>
      <ToastHost>
        <AuthProvider>
          <Root />
        </AuthProvider>
      </ToastHost>
    </AppProvider>
  );
}
