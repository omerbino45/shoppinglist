import { useState, useRef, useCallback } from 'react';

export function useToast() {
  const [message, setMessage] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fire = useCallback((msg: string, duration = 2500) => {
    setMessage(msg);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(''), duration);
  }, []);

  return { message, fire };
}
