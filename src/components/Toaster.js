// ======================== Toaster.js ========================
import { Toaster } from "react-hot-toast";

/**
 * Mount once near the root (e.g., in App.js).
 * Use:
 *   import toast from 'react-hot-toast';
 *   toast.success('Saved');
 *   toast.error('Something failed');
 */
export default function AppToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          fontSize: "0.95rem",
          padding: "10px 14px",
          borderRadius: "10px",
        },
        success: {
          iconTheme: { primary: "#22c55e", secondary: "#ffffff" },
        },
        error: {
          iconTheme: { primary: "#ef4444", secondary: "#ffffff" },
        },
      }}
    />
  );
}
