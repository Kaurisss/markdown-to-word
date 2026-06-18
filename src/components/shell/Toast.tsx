import { toast } from 'sonner';

export type ToastType = 'success' | 'error' | 'info';

export function showAppToast(message: string, type: ToastType = 'success') {
  if (type === 'error') {
    toast.error(message);
    return;
  }
  if (type === 'info') {
    toast.info(message);
    return;
  }
  toast.success(message);
}
