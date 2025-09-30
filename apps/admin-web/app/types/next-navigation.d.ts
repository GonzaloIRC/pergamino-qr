// This file contains custom type declarations

declare module 'next/navigation' {
  export function useRouter(): {
    push: (url: string) => void;
    replace: (url: string) => void;
    prefetch: (url: string) => void;
    back: () => void;
    forward: () => void;
  };
  
  export function usePathname(): string;
  
  export function useSearchParams(): URLSearchParams;
}

// Add any other missing type declarations as needed