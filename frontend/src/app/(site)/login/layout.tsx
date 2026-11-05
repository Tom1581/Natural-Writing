import type { Metadata } from 'next';
import { OG_IMAGE } from '@/lib/posts';

export const metadata: Metadata = {
  title: 'Sign In or Create Account',
  description: 'Sign in to Natural Quill to start rewriting AI-generated drafts into clear, natural writing. Create a free account and get 400 words free instantly.',
  robots: { index: false, follow: true },
  alternates: { canonical: 'https://naturalquill.one/login' },
  openGraph: {
    title: 'Sign In to Natural Quill',
    description: 'Create a free account or sign in to start rewriting AI text into natural, human-sounding writing.',
    url: 'https://naturalquill.one/login',
    images: [OG_IMAGE],
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
